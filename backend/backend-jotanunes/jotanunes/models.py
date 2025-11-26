from django.db import models

STATUS_CHOICES = [
    ('RECUSADO', 'Recusado'),
    ('EM_ANALISE', 'Em Análise'),
    ('NAO_FINALIZADO', 'Não Finalizado'),
    ('FINALIZADO', 'Finalizado'),
]

class Estado(models.Model):
    nome = models.CharField(max_length=50, unique=True, verbose_name="Nome do Estado")
    uf = models.CharField(max_length=2, unique=True, verbose_name="UF (Sigla)")

    class Meta:
        verbose_name = "Estado"
        ordering = ['nome']

    def __str__(self):
        return self.nome

class Cidade(models.Model):
    nome = models.CharField(max_length=100, verbose_name="Nome da Cidade")
    estado = models.ForeignKey(
        Estado, 
        on_delete=models.CASCADE, 
        related_name="cidades", 
        verbose_name="Estado"
    )

    class Meta:
        verbose_name = "Cidade"
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.estado.uf})"

class Obra(models.Model):
    nome = models.CharField(max_length=255)
    cidade = models.CharField(max_length=100, blank=True)
    estado = models.CharField(max_length=2, blank=True)
    observacao = models.TextField(null=True, blank=True, verbose_name="Observação / Prefácio")    
    endereco_completo = models.TextField("Endereço Completo", blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NAO_FINALIZADO')

    def __str__(self):
        return self.nome


class Descricao(models.Model):
    detalhe = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.detalhe

class Item(models.Model):
    nome = models.CharField(max_length=255)
    descricoes = models.ManyToManyField(Descricao, related_name='itens', blank=True)

    def __str__(self):
        return self.nome

class Ambiente(models.Model):
    obra = models.ForeignKey(Obra, related_name='ambientes', on_delete=models.CASCADE, null=True)
    torre = models.ForeignKey(Torre, related_name='ambientes', on_delete=models.CASCADE, null=True, blank=True)
    nome = models.CharField(max_length=255)
    itens = models.ManyToManyField(Item, related_name='ambientes', blank=True)

    def __str__(self):
        return self.nome

class Marca(models.Model):
    nome = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.nome

class Material(models.Model):
    item = models.ForeignKey(Item, related_name='materiais', on_delete=models.CASCADE)
    descricao = models.CharField(max_length=255, blank=True, null=True)
    marcas = models.ManyToManyField(Marca, related_name='materiais', blank=True)

    def __str__(self):
        return self.descricao or 'Material sem descrição'
