from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'obras', views.ObraViewSet, basename='obra')
router.register(r'ambientes', views.AmbienteViewSet, basename='ambiente')
router.register(r'itens', views.ItemViewSet, basename='item')
router.register(r'materiais', views.MaterialViewSet, basename='material')
router.register(r'marcas', views.MarcaViewSet, basename='marca')
router.register(r'descricoes', views.DescricaoViewSet, basename='descricao')

urlpatterns = [
    path('', include(router.urls)),
    path('alterar-senha/', views.alterar_senha, name='alterar_senha'),
    path("me/", views.me, name='me'),

]
