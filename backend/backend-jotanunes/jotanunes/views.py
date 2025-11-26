from django.http import HttpResponse
from django.template.loader import render_to_string
from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
import re
from rest_framework.views import APIView
from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Obra, Torre, Ambiente, Item, Material, Marca, Descricao
from .permissions import IsGestor
from .serializers import (
    ObraSerializer, AmbienteSerializer, 
    ItemSerializer, MaterialSerializer, MarcaSerializer, DescricaoSerializer,
    UsuarioSerializer, UsuarioLoginSerializer, UsuarioUpdateSerializer
)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

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

    @action(detail=True, methods=['post'], url_path='finalizar')
    def finalizar_obra(self, request, pk=None):
        try:
            obra = self.get_object()

            if obra.status != 'NAO_FINALIZADO':
                return Response(
                    {'error': f'A obra com status "{obra.status}" não pode ser movida para "Em Análise".'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            obra.status = 'EM_ANALISE'
            obra.save(update_fields=['status'])

            serializer = self.get_serializer(obra)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Ocorreu um erro: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
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
                status='EM_ANALISE'
            )

            for ambiente in original_obra.ambientes.all():
                self._duplicar_ambiente_e_filhos(
                    ambiente_original=ambiente,
                    nova_obra=nova_obra
                )

            serializer = self.get_serializer(nova_obra)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Ocorreu um erro durante a duplicação: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    def _duplicar_ambiente_e_filhos(self, ambiente_original, nova_obra):
        novo_ambiente = Ambiente.objects.create(
            obra=nova_obra,
            nome=ambiente_original.nome,
        )

        for item in ambiente_original.itens.all():
            novo_item = Item.objects.create(
                ambiente=novo_ambiente,
                nome=item.nome,
            )
            novo_item.descricoes.set(item.descricoes.all())
            for material in item.materiais.all():
                novo_material = Material.objects.create(
                    item=novo_item,
                    descricao=material.descricao,
                )
                novo_material.marcas.set(material.marcas.all())

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
    filterset_fields = ['nome', 'descricoes']
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

class PerfilView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        
        serializer = UsuarioUpdateSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True, 
                "message": "Perfil atualizado com sucesso!",
                "user": serializer.data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)