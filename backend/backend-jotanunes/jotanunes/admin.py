from django.contrib import admin
from .models import (
    Obra, Ambiente, Item,
    Material, Descricao, Marca,
    Estado, Cidade
)

admin.site.register(Material)


@admin.register(Marca)
class MarcaAdmin(admin.ModelAdmin):
    search_fields = ['nome']


@admin.register(Descricao)
class DescricaoAdmin(admin.ModelAdmin):
    search_fields = ['detalhe']


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('nome',)
    search_fields = ['nome', 'descricoes__detalhe']
    filter_horizontal = ('descricoes',)


@admin.register(Ambiente)
class AmbienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'obra', 'get_itens')
    search_fields = ['nome', 'obra__nome', 'itens__nome']
    list_filter = ('obra',)
    filter_horizontal = ('itens',)

    @admin.display(description='Itens')
    def get_itens(self, obj):
        return ", ".join([i.nome for i in obj.itens.all()])


@admin.register(Obra)
class ObraAdmin(admin.ModelAdmin):
    list_display = ('nome', 'status', 'endereco_completo')
    list_filter = ('status',)
    search_fields = ('nome', 'endereco_completo')

    def get_readonly_fields(self, request, obj=None):
        if not request.user.is_superuser:
            if not request.user.groups.filter(name='Gestores').exists():
                return ['status']
        return []


@admin.register(Estado)
class EstadoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'uf')
    search_fields = ('nome', 'uf')


@admin.register(Cidade)
class CidadeAdmin(admin.ModelAdmin):
    list_display = ('nome', 'get_estado_uf')
    search_fields = ('nome',)
    list_filter = ('estado',)

    @admin.display(description='Estado (UF)')
    def get_estado_uf(self, obj):
        return obj.estado.uf
