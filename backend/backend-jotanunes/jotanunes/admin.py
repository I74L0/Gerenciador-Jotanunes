from django.contrib import admin
from .models import Obra, Torre, Ambiente, Item, Material, Descricao, Marca

admin.site.register(Ambiente)
admin.site.register(Material)

@admin.register(Marca)
class MarcaAdmin(admin.ModelAdmin):
    search_fields = ['nome']

@admin.register(Descricao)
class DescricaoAdmin(admin.ModelAdmin):
    search_fields = ['detalhe']

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('nome', 'ambiente')
    search_fields = ['nome', 'ambiente__nome']
    list_filter = ('ambiente__obra',)
    filter_horizontal = ('descricoes',)

@admin.register(Torre)
class TorreAdmin(admin.ModelAdmin):
    list_display = ('nome', 'obra')
    search_fields = ['nome', 'obra__nome']
    list_filter = ('obra',)

@admin.register(Obra)
class ObraAdmin(admin.ModelAdmin):
    list_display = ('nome', 'status', 'endereco_completo')
    list_filter = ('status',)
    search_fields = ('nome','endereco_completo')
    
    def get_readonly_fields(self, request, obj=None):
        if not request.user.is_superuser:
            if not request.user.groups.filter(name='Gestores').exists():
                return ['status']
        return []