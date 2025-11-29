from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    Obra, Ambiente, Material, Marca, Item, Descricao,
    Estado, Cidade
)

User = get_user_model()


# ---------------------------
# USUÁRIO
# ---------------------------

class UsuarioSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'role')

    def get_role(self, obj):
        if obj.is_superuser:
            return "admin"
        if obj.groups.filter(name='Gestores').exists():
            return "gestor"
        return "user"


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UsuarioSerializer(self.user).data
        return data


class UsuarioCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UsuarioLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    user = serializers.SerializerMethodField(read_only=True)

    def validate(self, data):
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if user is None:
            raise serializers.ValidationError("Credenciais inválidas.")
        if not user.is_active:
            raise serializers.ValidationError("Este usuário está inativo.")
        data['user'] = user
        return data

    def get_user(self, obj):
        return UsuarioSerializer(obj.get('user')).data


# ---------------------------
# ESTADO / CIDADE
# ---------------------------

class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = ['id', 'nome', 'uf']


class CidadeSerializer(serializers.ModelSerializer):
    estado_uf = serializers.CharField(source='estado.uf', read_only=True)

    class Meta:
        model = Cidade
        fields = ['id', 'nome', 'estado', 'estado_uf']


# ---------------------------
# MARCA / DESCRIÇÃO / MATERIAL / ITEM
# ---------------------------

class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = ['id', 'nome']


class DescricaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Descricao
        fields = ['id', 'detalhe']


class MaterialSerializer(serializers.ModelSerializer):
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Material
        fields = ['id', 'item', 'descricao', 'marcas']

    def create(self, validated_data):
        marcas = validated_data.pop('marcas', [])
        material = Material.objects.create(**validated_data)
        if marcas:
            material.marcas.set(marcas)
        return material

    def update(self, instance, validated_data):
        marcas = validated_data.pop('marcas', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if marcas is not None:
            instance.marcas.set(marcas)
        return instance


class ItemSerializer(serializers.ModelSerializer):
    descricoes = DescricaoSerializer(many=True, read_only=True)
    materiais = MaterialSerializer(many=True, read_only=True)

    descricoes_input = serializers.ListField(
        child=serializers.CharField(allow_blank=True),
        write_only=True,
        required=False
    )
    materiais_input = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Item
        fields = [
            'id', 'nome',
            'descricoes', 'materiais',
            'descricoes_input', 'materiais_input'
        ]
        read_only_fields = ['id', 'descricoes', 'materiais']

    def _get_or_create_descricoes(self, descricoes_input):
        result = []
        for valor in descricoes_input:
            if not valor:
                continue

            try:
                desc_id = int(valor)
                desc_obj = Descricao.objects.get(pk=desc_id)
            except Exception:
                desc_obj, _ = Descricao.objects.get_or_create(detalhe=valor)

            result.append(desc_obj)
        return result

    def create(self, validated_data):
        descricoes_input = validated_data.pop('descricoes_input', [])
        materiais_input = validated_data.pop('materiais_input', [])

        item = Item.objects.create(**validated_data)

        if descricoes_input:
            descricoes_objs = self._get_or_create_descricoes(descricoes_input)
            item.descricoes.set(descricoes_objs)

        if materiais_input:
            materiais_objs = Material.objects.filter(pk__in=materiais_input)
            for m in materiais_objs:
                m.item = item
                m.save()

        return item

    def update(self, instance, validated_data):
        descricoes_input = validated_data.pop('descricoes_input', None)
        materiais_input = validated_data.pop('materiais_input', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if descricoes_input is not None:
            descricoes_objs = self._get_or_create_descricoes(descricoes_input)
            instance.descricoes.set(descricoes_objs)

        if materiais_input is not None:
            Material.objects.filter(item=instance).update(item=None)
            materiais_objs = Material.objects.filter(pk__in=materiais_input)
            for m in materiais_objs:
                m.item = instance
                m.save()

        return instance


# ---------------------------
# AMBIENTE / OBRA
# ---------------------------

class AmbienteSerializer(serializers.ModelSerializer):
    itens = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Item.objects.all(),
        required=False
    )

    class Meta:
        model = Ambiente
        fields = ['id', 'nome', 'tipo', 'itens']


class ObraSerializer(serializers.ModelSerializer):
    cidade = serializers.SlugRelatedField(
        slug_field='nome',
        queryset=Cidade.objects.all()
    )
    estado = serializers.SlugRelatedField(
        slug_field='uf',
        queryset=Estado.objects.all()
    )

    ambientes = AmbienteSerializer(many=True, required=False)

    class Meta:
        model = Obra
        fields = [
            'id', 'nome', 'cidade', 'estado',
            'texto_prefacio', 'endereco_completo',
            'observacao_final', 'status',
            'ambientes'
        ]

    def create(self, validated_data):
        ambientes_data = validated_data.pop('ambientes', [])
        obra = Obra.objects.create(**validated_data)

        for ambiente_data in ambientes_data:
            itens_pks = ambiente_data.pop('itens', [])
            ambiente = Ambiente.objects.create(obra=obra, **ambiente_data)

            if itens_pks:
                itens_qs = Item.objects.filter(pk__in=itens_pks)
                ambiente.itens.set(itens_qs)

        return obra

    def update(self, instance, validated_data):
        ambientes_data = validated_data.pop('ambientes', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if ambientes_data is not None:
            instance.ambientes.all().delete()

            for ambiente_data in ambientes_data:
                itens_pks = ambiente_data.pop('itens', [])
                ambiente = Ambiente.objects.create(obra=instance, **ambiente_data)

                if itens_pks:
                    itens_qs = Item.objects.filter(pk__in=itens_pks)
                    ambiente.itens.set(itens_qs)

        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['ambientes'] = AmbienteSerializer(instance.ambientes.all(), many=True).data
        return data


# ---------------------------
# USUÁRIO UPDATE
# ---------------------------

class UsuarioUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['first_name', 'email', 'password']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)

        if password:
            instance.set_password(password)
            instance.save()

        return instance
