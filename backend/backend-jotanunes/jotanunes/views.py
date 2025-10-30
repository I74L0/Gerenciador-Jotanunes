from django.http import HttpResponse
from django.template.loader import render_to_string
from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
#from weasyprint import HTML
from django_filters.rest_framework import DjangoFilterBackend
import re

from .models import Obra, Torre, Ambiente, Item, Material, Marca, Descricao
from .permissions import IsGestor
from .serializers import (
    ObraSerializer, TorreSerializer, AmbienteSerializer, 
    ItemSerializer, MaterialSerializer, MarcaSerializer, DescricaoSerializer,
    UsuarioSerializer, UsuarioLoginSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def usuario_login_view(request):
    serializer = UsuarioLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        user_data = UsuarioSerializer(user).data
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user_data
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def usuario_perfil_view(request):
    serializer = UsuarioSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def usuario_logout_view(request):
    return Response({"detail": "Logout bem-sucedido. O token deve ser descartado no cliente."}, status=status.HTTP_200_OK)


class ObraViewSet(viewsets.ModelViewSet):
    queryset = Obra.objects.all().order_by('-id')
    serializer_class = ObraSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['nome', 'endereco_completo', 'cidade', 'estado']
    filterset_fields = ['status', 'estado', 'cidade']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create', 'duplicar', 'gerar_pdf']:
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            self.permission_classes = [permissions.IsAuthenticated, IsGestor]
        return super().get_permissions()

    @action(detail=True, methods=['post'], url_path='duplicar')
    def duplicar(self, request, pk=None):
        try:
            original_obra = self.get_object()
            
            nome_original = original_obra.nome
            match = re.search(r' (\d+\.\d+)$', nome_original)
            if match:
                nome_base = nome_original[:match.start()].strip()
            else:
                nome_base = nome_original.strip()

            obras_relacionadas = Obra.objects.filter(nome__startswith=nome_base)
            maior_versao = 0.0

            for obra in obras_relacionadas:
                match_versao = re.search(r' (\d+\.\d+)$', obra.nome)
                if match_versao:
                    versao_atual = float(match_versao.group(1))
                    if versao_atual > maior_versao:
                        maior_versao = versao_atual
            
            nova_versao = (maior_versao or 1.0) + 1.0
            novo_nome = f"{nome_base} {nova_versao:.1f}"

            nova_obra = Obra.objects.create(
                nome=novo_nome,
                cidade=original_obra.cidade,
                estado=original_obra.estado,
                endereco_completo=original_obra.endereco_completo,
                descricao=original_obra.descricao,
                status='PENDENTE'
            )
            
            mapa_torres = {}
            for torre in original_obra.torres.all():
                nova_torre = Torre.objects.create(obra=nova_obra, nome=torre.nome)
                mapa_torres[torre.id] = nova_torre
            
            for ambiente in original_obra.ambientes.filter(torre__isnull=True):
                self._duplicar_ambiente_e_filhos(ambiente, nova_obra, None)

            for original_torre_id, nova_torre_obj in mapa_torres.items():
                for ambiente in Ambiente.objects.filter(torre_id=original_torre_id):
                    self._duplicar_ambiente_e_filhos(ambiente, nova_obra, nova_torre_obj)

            serializer = self.get_serializer(nova_obra)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'error': f'Ocorreu um erro durante a duplicação: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _duplicar_ambiente_e_filhos(self, ambiente_original, nova_obra, nova_torre):
        novo_ambiente = Ambiente.objects.create(
            obra=nova_obra, 
            torre=nova_torre, 
            nome=ambiente_original.nome,
            metragem=getattr(ambiente_original, 'metragem', None)
        )
        for item in ambiente_original.itens.all():
            novo_item = Item.objects.create(
                ambiente=novo_ambiente, 
                nome=item.nome, 
                posicao=getattr(item, 'posicao', None)
            )
            novo_item.descricoes.set(item.descricoes.all())
            for material in item.materiais.all():
                novo_material = Material.objects.create(
                    item=novo_item, 
                    descricao=material.descricao, 
                    dimensao=getattr(material, 'dimensao', None)
                )
                novo_material.marcas.set(material.marcas.all())
    
    @action(detail=True, methods=['get'], url_path='gerar-pdf')
    def gerar_pdf(self, request, pk=None):
        try:
            obra = self.get_object()
            logo_url = request.build_absolute_uri('/static/img/logo_vermelha.png')
            contexto = {'obra': obra}
            html_string = render_to_string('relatorio_obra.html', contexto)
            pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()
            response = HttpResponse(pdf_file, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="Relatorio_{obra.nome}.pdf"'
            return response
        except Exception as e:
            return Response({'error': f'Ocorreu um erro ao gerar o PDF: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TorreViewSet(viewsets.ModelViewSet):
    queryset = Torre.objects.all()
    serializer_class = TorreSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['obra']

class AmbienteViewSet(viewsets.ModelViewSet):
    queryset = Ambiente.objects.all()
    serializer_class = AmbienteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['obra', 'torre']

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['ambiente']
    search_fields = ['nome']

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['item', 'marcas']
    search_fields = ['descricao']

class MarcaViewSet(viewsets.ModelViewSet):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome']

class DescricaoViewSet(viewsets.ModelViewSet):
    queryset = Descricao.objects.all()
    serializer_class = DescricaoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['detalhe']