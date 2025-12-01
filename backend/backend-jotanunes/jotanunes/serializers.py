from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    Obra, Ambiente, Material, Marca, Item, Descricao,
    Estado, Cidade
)

User = get_user_model()


# ===========================================================
# USUÁRIOS
# ===========================================================

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


# ===========================================================
# ESTADO & CIDADE
# ===========================================================

class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = ["nome", "uf"]


class CidadeSerializer(serializers.ModelSerializer):
    estado = serializers.CharField(source="estado.uf")

    class Meta:
        model = Cidade
        fields = ["nome", "estado"]


# ===========================================================
# MARCA
# ===========================================================

class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = ['id', 'nome']

    def to_internal_value(self, data):
        if isinstance(data, str):
            obj, _ = Marca.objects.get_or_create(nome=data)
            return {"id": obj.id, "nome": obj.nome}
        return super().to_internal_value(data)


# ===========================================================
# DESCRIÇÃO
# ===========================================================

class DescricaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Descricao
        fields = ["detalhe"]


# ===========================================================
# MATERIAL
# ===========================================================

class MaterialSerializer(serializers.ModelSerializer):
    marcas = serializers.ListField(
        child=serializers.CharField(),
    )

    item = serializers.CharField()

    class Meta:
        model = Material
        fields = ["item", "descricao", "marcas"]

    def create(self, validated_data):
        marcas = validated_data.pop("marcas", [])
        item_nome = validated_data.pop("item")

        # cria item caso não exista
        item, _ = Item.objects.get_or_create(nome=item_nome)

        material = Material.objects.create(item=item, **validated_data)

        for marca_nome in marcas:
            marca, _ = Marca.objects.get_or_create(nome=marca_nome)
            material.marcas.add(marca)

        return material


# ===========================================================
# ITEM
# ===========================================================

class ItemSerializer(serializers.ModelSerializer):
    descricoes = serializers.ListField(
        child=serializers.CharField(),
        write_only=True
    )

    class Meta:
        model = Item
        fields = ["nome", "descricoes"]

    def create(self, validated_data):
        descricoes = validated_data.pop("descricoes", [])
        item = Item.objects.create(**validated_data)

        for desc in descricoes:
            desc_obj, _ = Descricao.objects.get_or_create(detalhe=desc)
            item.descricoes.add(desc_obj)

        return item


# ===========================================================
# AMBIENTE
# ===========================================================

class AmbienteSerializer(serializers.ModelSerializer):
    itens = ItemSerializer(many=True)

    class Meta:
        model = Ambiente
        fields = ["nome", "tipo", "itens"]

    def create(self, validated_data):
        itens_data = validated_data.pop("itens", [])
        ambiente = Ambiente.objects.create(**validated_data)

        for item_data in itens_data:
            item = ItemSerializer().create(item_data)
            ambiente.itens.add(item)

        return ambiente


# ===========================================================
# OBRA
# ===========================================================

class ObraSerializer(serializers.ModelSerializer):
    cidade = serializers.CharField()
    estado = serializers.CharField()

    ambientes = AmbienteSerializer(many=True, required=False)
    materiais = MaterialSerializer(many=True, required=False)

    class Meta:
        model = Obra
        fields = [
            "id",
            "nome",
            "estado",
            "cidade",
            "texto_prefacio",
            "endereco_completo",
            "observacao_final",
            "status",
            "ambientes",
            "materiais",
        ]

    # ---------------------------------------------
    # 🔍 RESOLVE ESTADO (UF ou Nome)
    # ---------------------------------------------
    def _resolve_estado(self, estado_input):
        if not estado_input:
            return None

        # Tenta pela UF (ex: "SE")
        estado = Estado.objects.filter(uf__iexact=estado_input).first()

        # Tenta pelo nome (ex: "Sergipe")
        if not estado:
            estado = Estado.objects.filter(nome__iexact=estado_input).first()

        if not estado:
            raise serializers.ValidationError({"estado": "Estado não encontrado."})

        return estado

    # ---------------------------------------------
    # 🔍 RESOLVE CIDADE (pelo nome + estado)
    # ---------------------------------------------
    def _resolve_cidade(self, cidade_input, estado_obj):
        if not cidade_input:
            return None

        cidade = Cidade.objects.filter(
            nome__iexact=cidade_input,
            estado=estado_obj
        ).first()

        if not cidade:
            raise serializers.ValidationError({"cidade": "Cidade não encontrada para esse estado."})

        return cidade

    # ---------------------------------------------
    # 🟢 CREATE
    # ---------------------------------------------
    def create(self, validated_data):
        ambientes_data = validated_data.pop("ambientes", [])
        materiais_data = validated_data.pop("materiais", [])

        estado_input = validated_data.pop("estado")
        cidade_input = validated_data.pop("cidade")

        # resolve UF/Nome para objeto
        estado_obj = self._resolve_estado(estado_input)
        cidade_obj = self._resolve_cidade(cidade_input, estado_obj)

        # cria obra
        obra = Obra.objects.create(
            estado=estado_obj,
            cidade=cidade_obj,
            **validated_data
        )

        # cria ambientes e itens
        for ambiente_data in ambientes_data:
            itens_data = ambiente_data.pop("itens", [])
            ambiente = Ambiente.objects.create(obra=obra, **ambiente_data)

            for item_data in itens_data:
                item = ItemSerializer().create(item_data)
                ambiente.itens.add(item)

        # cria materiais globais
        for material_data in materiais_data:
            MaterialSerializer().create(material_data)

        return obra

    # ---------------------------------------------
    # 🟡 UPDATE
    # ---------------------------------------------
    def update(self, instance, validated_data):
        estado_input = validated_data.pop("estado", None)
        cidade_input = validated_data.pop("cidade", None)
        ambientes_data = validated_data.pop("ambientes", None)

        # estado
        if estado_input:
            instance.estado = self._resolve_estado(estado_input)

        # cidade
        if cidade_input:
            instance.cidade = self._resolve_cidade(cidade_input, instance.estado)

        # campos normais
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # ambientes
        if ambientes_data is not None:
            instance.ambientes.all().delete()

            for ambiente_data in ambientes_data:
                itens_data = ambiente_data.pop("itens", [])
                ambiente = Ambiente.objects.create(obra=instance, **ambiente_data)

                for item_data in itens_data:
                    item = ItemSerializer().create(item_data)
                    ambiente.itens.add(item)

        return instance

    # ---------------------------------------------
    # 🖼 REPRESENTAÇÃO FINAL
    # ---------------------------------------------
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["ambientes"] = AmbienteSerializer(instance.ambientes.all(), many=True).data
        return data

