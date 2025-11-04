from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework.relations import PrimaryKeyRelatedField
from .models import (
    Obra, Ambiente, Material, Marca, Item, Descricao, Torre,
    Estado, Cidade
)

User = get_user_model()


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email')


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
    marcas = serializers.PrimaryKeyRelatedField(queryset=Marca.objects.all(), many=True, required=False)

    class Meta:
        model = Material
        fields = ['id', 'descricao', 'marcas']


class ItemSerializer(serializers.ModelSerializer):
    materiais = MaterialSerializer(many=True, required=False)
    descricoes = DescricaoSerializer(many=True, read_only=True)  # leitura
    descricoes_input = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )  # escrita

    class Meta:
        model = Item
        fields = ['id', 'nome', 'materiais', 'descricoes', 'descricoes_input']

    def create(self, validated_data):
        materiais_data = validated_data.pop('materiais', [])
        descricoes_data = validated_data.pop('descricoes_input', [])

        item = Item.objects.create(**validated_data)

        # Cria ou vincula descrições
        descricoes_objs = []
        for desc in descricoes_data:
            if isinstance(desc, int):
                try:
                    descricoes_objs.append(Descricao.objects.get(pk=desc))
                except Descricao.DoesNotExist:
                    continue
            else:
                descricao_obj, _ = Descricao.objects.get_or_create(detalhe=desc)
                descricoes_objs.append(descricao_obj)

        if descricoes_objs:
            item.descricoes.set(descricoes_objs)

        # Cria materiais e associa marcas
        for material_data in materiais_data:
            marcas = material_data.pop('marcas', [])
            material = Material.objects.create(item=item, **material_data)
            if marcas:
                material.marcas.set(marcas)

        return item

class AmbienteSerializer(serializers.ModelSerializer):
    itens = ItemSerializer(many=True, required=False)

    class Meta:
        model = Ambiente
        fields = ['id', 'nome', 'obra', 'torre', 'itens']


class TorreSerializer(serializers.ModelSerializer):
    ambientes = AmbienteSerializer(many=True, required=False)

    class Meta:
        model = Torre
        fields = ['id', 'nome', 'ambientes']


class ObraSerializer(serializers.ModelSerializer):
    torres = TorreSerializer(many=True, required=False)
    ambientes = AmbienteSerializer(many=True, required=False, help_text="Ambientes que pertencem diretamente à obra, sem torre.")

    class Meta:
        model = Obra
        fields = ['id', 'nome', 'cidade', 'estado', 'endereco_completo', 'descricao', 'status', 'torres', 'ambientes']

    def create(self, validated_data):
        torres_data = validated_data.pop('torres', [])
        ambientes_data = validated_data.pop('ambientes', [])
        obra = Obra.objects.create(**validated_data)

        for torre_data in torres_data:
            ambientes_da_torre_data = torre_data.pop('ambientes', [])
            torre = Torre.objects.create(obra=obra, **torre_data)
            self._criar_ambientes_e_filhos(ambientes_da_torre_data, obra, torre)

        self._criar_ambientes_e_filhos(ambientes_data, obra, None)
        return obra

    def _criar_ambientes_e_filhos(self, ambientes_data, obra_obj, torre_obj):
        for ambiente_data in ambientes_data:
            itens_data = ambiente_data.pop('itens', [])
            ambiente = Ambiente.objects.create(obra=obra_obj, torre=torre_obj, **ambiente_data)

            for item_data in itens_data:
                materiais_data = item_data.pop('materiais', [])
                descricoes_data = item_data.pop('descricoes', [])
                item = Item.objects.create(**item_data)  # ← corrigido aqui
                ambiente.itens.add(item)

                for material_data in materiais_data:
                    marcas = material_data.pop('marcas', [])
                    material = Material.objects.create(item=item, **material_data)
                    if marcas:
                        material.marcas.set(marcas)

                if descricoes_data:
                    item.descricoes.set(descricoes_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['ambientes'] = AmbienteSerializer(instance.ambientes.filter(torre__isnull=True), many=True).data
        return representation
