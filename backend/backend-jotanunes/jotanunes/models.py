from django.db import models

STATUS_CHOICES = [
    ('PENDENTE', 'Pendente'),
    ('EM_ANDAMENTO', 'Em Andamento'),
    ('FINALIZADO', 'Finalizado'),
]

class Obra(models.Model):
    nome = models.CharField(max_length=255)
    cidade = models.CharField(max_length=100, blank=True)
    estado = models.CharField(max_length=2, blank=True)
    descricao = models.TextField(blank=True, null=True)
    endereco_completo = models.TextField("Endereço Completo", blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDENTE')

    def __str__(self):
        return self.nome

class Torre(models.Model):
    obra = models.ForeignKey(Obra, related_name='torres', on_delete=models.CASCADE)
    nome = models.CharField(max_length=255)

    def __str__(self):
        return f'{self.nome} - {self.obra.nome}'

class Ambiente(models.Model):
    obra = models.ForeignKey(Obra, related_name='ambientes', on_delete=models.CASCADE, null=True)
    torre = models.ForeignKey(Torre, related_name='ambientes', on_delete=models.CASCADE, null=True, blank=True)
    nome = models.CharField(max_length=255)

    def __str__(self):
        return self.nome

class Marca(models.Model):
    nome = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.nome

class Descricao(models.Model):
    detalhe = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.detalhe

class Item(models.Model):
    ambiente = models.ForeignKey(Ambiente, related_name='itens', on_delete=models.CASCADE)
    nome = models.CharField(max_length=255)
    descricoes = models.ManyToManyField(Descricao, related_name='itens', blank=True)
    def __str__(self):
        return self.nome

class Material(models.Model):
    item = models.ForeignKey(Item, related_name='materiais', on_delete=models.CASCADE)
    descricao = models.CharField(max_length=255, blank=True, null=True)
    marcas = models.ManyToManyField(Marca, related_name='materiais', blank=True)

    def __str__(self):
        return self.descricao or 'Material sem descrição'