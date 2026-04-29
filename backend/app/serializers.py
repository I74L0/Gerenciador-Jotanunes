from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Obra, Ambiente, Material, Marca, Item, Descricao, Estado, Cidade

User = get_user_model()


class UsuarioSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email", "role")

    def get_role(self, obj):
        if obj.is_superuser:
            return "admin"
        if obj.groups.filter(name="Gestores").exists():
            return "gestor"
        return "user"


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UsuarioSerializer(self.user).data
        return data


class UsuarioCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "first_name", "last_name"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UsuarioLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    user = serializers.SerializerMethodField(read_only=True)

    def validate(self, data):
        user = authenticate(
            username=data.get("username"), password=data.get("password")
        )
        if user is None:
            raise serializers.ValidationError("Credenciais inválidas.")
        if not user.is_active:
            raise serializers.ValidationError("Este usuário está inativo.")
        data["user"] = user
        return data

    def get_user(self, obj):
        return UsuarioSerializer(obj.get("user")).data


class UsuarioUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["first_name", "email", "password"]

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save()
        return instance


class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = ["nome", "uf"]


class CidadeSerializer(serializers.ModelSerializer):
    estado = serializers.CharField(source="estado.uf")

    class Meta:
        model = Cidade
        fields = ["nome", "estado"]


class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = ["id", "nome"]

    def to_internal_value(self, data):
        if isinstance(data, str):
            obj, _ = Marca.objects.get_or_create(nome=data)
            return {"id": obj.id, "nome": obj.nome}
        return super().to_internal_value(data)


class DescricaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Descricao
        fields = ["detalhe"]


class ItemSerializer(serializers.ModelSerializer):
    # campo usado apenas para criar/atualizar a relação (entrada do seu JSON)
    descricao = serializers.CharField(required=False, allow_blank=True, write_only=True)
    # na saída, mostramos a lista de textos (campo 'detalhe' do model Descricao)
    descricoes = serializers.SlugRelatedField(
        many=True, slug_field="detalhe", read_only=True
    )

    class Meta:
        model = Item
        fields = "__all__"

    def create(self, validated_data):
        descricao_texto = validated_data.pop("descricao", None)
        nome = validated_data.get("nome")
        # busca item existente (como você fazia) ou cria novo
        item = Item.objects.filter(nome__iexact=nome).first()
        if not item:
            item = Item.objects.create(nome=nome)
        if descricao_texto:
            desc_obj, _ = Descricao.objects.get_or_create(detalhe=descricao_texto)
            item.descricoes.clear()
            item.descricoes.add(desc_obj)
        return item

class MaterialSerializer(serializers.ModelSerializer):
    item = serializers.CharField()
    marcas = serializers.ListField(child=serializers.CharField(), allow_empty=True)

    class Meta:
        model = Material
        fields = "__all__"

    def create(self, validated_data):
        item_name = validated_data.pop("item")
        marcas_names = validated_data.pop("marcas", [])
        item = ItemSerializer().create({"nome": item_name})
        material = Material.objects.create(
            item=item, descricao=validated_data.get("descricao", None)
        )
        for marca_name in marcas_names:
            if not marca_name:
                continue
            marca_obj, _ = Marca.objects.get_or_create(nome=marca_name)
            material.marcas.add(marca_obj)
        return material

    def to_representation(self, instance):
        return {
            "item": instance.item.nome if instance.item else None,
            "marcas": [m.nome for m in instance.marcas.all()],
        }


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


class ObraSerializer(serializers.ModelSerializer):
    cidade = serializers.CharField(required=False)
    estado = serializers.CharField(required=False)

    ambientes = AmbienteSerializer(many=True, required=False)
    materiais = MaterialSerializer(many=True, required=False)

    observacao_gestor = serializers.CharField(
        required=False, allow_null=True, allow_blank=True
    )

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
            "observacao_gestor",
        ]

    def user_is_gestor(self, user):
        return user and user.groups.filter(name="Gestores").exists()

    def user_is_criador(self, user):
        return user and user.groups.filter(name="Criadores").exists()

    def user_is_admin(self, user):
        return user and user.is_superuser

    def _resolve_estado(self, value):
        if not value:
            return None
        estado = (
            Estado.objects.filter(uf__iexact=value).first()
            or Estado.objects.filter(nome__iexact=value).first()
        )
        if not estado:
            raise serializers.ValidationError({"estado": "Estado não encontrado."})
        return estado

    def _resolve_cidade(self, nome, estado):
        if not nome:
            return None
        cidade = Cidade.objects.filter(nome__iexact=nome, estado=estado).first()
        if not cidade:
            raise serializers.ValidationError(
                {"cidade": "Cidade não encontrada para esse estado."}
            )
        return cidade

    def create(self, validated_data):
        ambientes_data = validated_data.pop("ambientes", [])
        materiais_data = validated_data.pop("materiais", [])
        observacao_gestor = validated_data.pop("observacao_gestor", None)
        estado_input = validated_data.pop("estado", None)
        cidade_input = validated_data.pop("cidade", None)

        estado_obj = self._resolve_estado(estado_input)
        cidade_obj = self._resolve_cidade(cidade_input, estado_obj)

        obra = Obra.objects.create(
            estado=estado_obj,
            cidade=cidade_obj,
            observacao_gestor=observacao_gestor,
            **validated_data
        )

        for ambiente_data in ambientes_data:
            itens_data = ambiente_data.pop("itens", [])
            ambiente = Ambiente.objects.create(obra=obra, **ambiente_data)
            for item_data in itens_data:
                item = ItemSerializer().create(item_data)
                ambiente.itens.add(item)

        for material_data in materiais_data:
            material = MaterialSerializer().create(material_data)
            obra.materiais.add(material)

        return obra

    def update(self, instance, validated_data):
        request = self.context.get("request")
        user = request.user if request else None

        ambientes_data = validated_data.pop("ambientes", None)
        materiais_data = validated_data.pop("materiais", None)

        pode_editar_campo_gestor = self.user_is_gestor(user) or self.user_is_admin(user)

        if not pode_editar_campo_gestor:
            validated_data.pop("observacao_gestor", None)

        if "estado" in validated_data:
            estado_input = validated_data.pop("estado")
            instance.estado = self._resolve_estado(estado_input)

        if "cidade" in validated_data:
            cidade_input = validated_data.pop("cidade")
            instance.cidade = self._resolve_cidade(cidade_input, instance.estado)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if ambientes_data is not None:
            instance.ambientes.all().delete()
            for ambiente_data in ambientes_data:
                itens_data = ambiente_data.pop("itens", [])
                ambiente = Ambiente.objects.create(obra=instance, **ambiente_data)
                for item_data in itens_data:
                    item = ItemSerializer().create(item_data)
                    ambiente.itens.add(item)

        if materiais_data is not None:
            instance.materiais.clear()
            for material_data in materiais_data:
                material = MaterialSerializer().create(material_data)
                instance.materiais.add(material)

        return instance

    def to_representation(self, instance):
        request = self.context.get("request")
        user = request.user if request else None

        data = super().to_representation(instance)

        pode_ver = (
            self.user_is_gestor(user)
            or self.user_is_criador(user)
            or self.user_is_admin(user)
        )

        if not pode_ver:
            data.pop("observacao_gestor", None)

        data["ambientes"] = AmbienteSerializer(instance.ambientes.all(), many=True).data
        data["materiais"] = MaterialSerializer(instance.materiais.all(), many=True).data

        return data
