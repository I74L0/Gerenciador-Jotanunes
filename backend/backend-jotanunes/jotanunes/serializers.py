from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.relations import PrimaryKeyRelatedField
from .models import (
    Obra, Ambiente, Material, Marca, Item, Descricao, Torre,
    Estado, Cidade
)

User = get_user_model()


class UsuarioSerializer(serializers.ModelSerializer):
    is_gestor = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'is_gestor')

    def get_is_gestor(self, obj):
        return obj.is_superuser or obj.groups.filter(name='Gestores').exists()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        user = self.user
        
        user_data = UsuarioSerializer(user).data
        
        data['user'] = user_data
        
        return data

class UsuarioCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UsuarioLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    user = serializers.SerializerMethodField(read_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        user = authenticate(username=username, password=password)
        if user is None:
            raise serializers.ValidationError("Credenciais inválidas. Verifique o usuário e a senha.")
        if not user.is_active:
            raise serializers.ValidationError("Este usuário está inativo.")
        data['user'] = user
        return data

    def get_user(self, obj):
        user = obj.get('user')
        return UsuarioSerializer(user).data


class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = ['id', 'nome', 'uf']


class CidadeSerializer(serializers.ModelSerializer):
    estado_uf = serializers.CharField(source='estado.uf', read_only=True)
    class Meta:
        model = Cidade
        fields = ['id', 'nome', 'estado', 'estado_uf']


class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = ['id', 'nome']


class DescricaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Descricao
        fields = ['id', 'detalhe']


class MaterialSerializer(serializers.ModelSerializer):
    marcas = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Marca.objects.all(), 
        required=False
    )
    
    class Meta:
        model = Material
        fields = ['id', 'descricao', 'marcas']


class ItemSerializer(serializers.ModelSerializer):
    descricoes = DescricaoSerializer(many=True, read_only=True)
    materiais = MaterialSerializer(many=True, read_only=True)
    
    descricoes_input = serializers.ListField(
        child=serializers.CharField(allow_blank=True), 
        write_only=True, 
        required=False
    )
    
    materiais_input = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Material.objects.all(),
        write_only=True,
        required=False,
        source='materiais'
    )

    class Meta:
        model = Item
        fields = [
            'id', 'nome',
            'descricoes', 'materiais',
            'descricoes_input', 'materiais_input'
        ]
        read_only_fields = ['id', 'descricoes', 'materiais']

    def create(self, validated_data):
        descricoes_input_list = validated_data.pop('descricoes_input', [])
        materiais_objs = validated_data.pop('materiais', [])
        
        item = Item.objects.create(**validated_data)
        
        descricoes_objs_a_ligar = []
        if descricoes_input_list:
            for item_str in descricoes_input_list:
                if not item_str:
                    continue
                try:
                    desc_id = int(item_str)
                    desc_obj = Descricao.objects.get(pk=desc_id)
                    descricoes_objs_a_ligar.append(desc_obj)
                except (ValueError, TypeError, Descricao.DoesNotExist):
                    desc_obj, _ = Descricao.objects.get_or_create(detalhe=item_str)
                    descricoes_objs_a_ligar.append(desc_obj)
        
        if descricoes_objs_a_ligar:
            item.descricoes.set(descricoes_objs_a_ligar)

        if materiais_objs:
            item.materiais.set(materiais_objs)
            
        return item


class AmbienteSerializer(serializers.ModelSerializer):
    itens = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Item.objects.all(),
        required=False
    )
    materiais = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Material.objects.all(),
        required=False
    )

    class Meta:
        model = Ambiente
        fields = ['id', 'nome', 'itens', 'materiais']


class TorreSerializer(serializers.ModelSerializer):
    ambientes = AmbienteSerializer(many=True, required=False)

    class Meta:
        model = Torre
        fields = ['id', 'nome', 'ambientes']


class ObraSerializer(serializers.ModelSerializer):
    torres = TorreSerializer(many=True, required=False)
    ambientes = AmbienteSerializer(many=True, required=False) 

    class Meta:
        model = Obra
        fields = [
            'id', 'nome', 'cidade', 'estado', 'endereco_completo', 'descricao', 
            'status', 'torres', 'ambientes'
        ]

    def create(self, validated_data):
        torres_data = validated_data.pop('torres', [])
        ambientes_obra_data = validated_data.pop('ambientes', [])
        
        obra = Obra.objects.create(**validated_data)

        for torre_data in torres_data:
            ambientes_torre_data = torre_data.pop('ambientes', [])
            torre = Torre.objects.create(obra=obra, **torre_data)
            self._criar_ambientes_e_filhos(ambientes_torre_data, obra, torre)
        
        self._criar_ambientes_e_filhos(ambientes_obra_data, obra, None)
        
        return obra

    def _criar_ambientes_e_filhos(self, ambientes_data, obra_obj, torre_obj):
        for ambiente_data in ambientes_data:
            itens_data = ambiente_data.pop('itens', [])
            materiais_data = ambiente_data.pop('materiais', [])
            
            ambiente = Ambiente.objects.create(obra=obra_obj, torre=torre_obj, **ambiente_data)
            
            if itens_data:
                ambiente.itens.set(itens_data)
            if materiais_data:
                ambiente.materiais.set(materiais_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['ambientes'] = AmbienteSerializer(instance.ambientes.filter(torre__isnull=True), many=True).data
        return representation