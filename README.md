# fullstack-jotanunes

🛠️ *Tecnologias Utilizadas*
Backend: Python 3.11, Django 4.x, Django REST Framework

Servidor de Aplicação: Gunicorn

Servidor Web / Proxy: Nginx

Banco de Dados: MySQL 8.0

Filas / Cache: Redis 7, Celery

Autenticação: djangorestframework-simplejwt

Documentação: drf-spectacular

Admin: django-jazzmin

Containerização: Docker, Docker Compose

<img width="150" height="150" alt="Python-logo-notext svg" src="https://github.com/user-attachments/assets/50b2cf26-6a19-408a-b1a7-f37d1782beb5" />

<img width="250" height="250" alt="1710173183065" src="https://github.com/user-attachments/assets/884e24b8-9ee2-4e02-b860-5efcc8a04703" />

<img width="250" height="200" alt="MySQL-Logo" src="https://github.com/user-attachments/assets/2ed701ab-8599-425e-baa5-fcd71d027dc6" />

<img width="150" height="150" alt="4844483" src="https://github.com/user-attachments/assets/4b6b1c4c-b4ec-4543-9a98-a85e5fedf63d" />

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Pré-requisitos:
Python

Django

IDE

Git

Docker

Docker Compose
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Guia de instalação, via terminal VScode:

1- Este comando irá construir as imagens e iniciar todos os serviços (Nginx, Gunicorn/Django, MySQL, Redis, Celery) em segundo plano.
docker-compose up -d --build

2- Após os contêineres estarem em execução, precisamos de preparar o banco de dados e os ficheiros estáticos.

a) Aplicar as migrações do banco de dados.

docker-compose exec backend python manage.py migrate

3- Coletar os ficheiros estáticos (Obrigatório para o Nginx): Este comando copia os CSS/JS do admin e do Jazzmin para um volume partilhado que o Nginx pode servir.

docker-compose exec backend python manage.py collectstatic --noinput --clear

4- Criar um Superusuário (Administrador): Siga as instruções para criar o seu utilizador de admin.
docker-compose exec backend python manage.py createsuperuser

5- Documentação da API (Swagger)
Essa etapa é para acessar a documentação e testar todos os endpoints da API.

Swagger UI: <http://localhost/api/schema/swagger-ui/>

Redoc: <http://localhost/api/schema/redoc/>
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

🚀 Utilização
Após a instalação, o projeto estará acessível no navegador:

Painel de Administração (Jazzmin)
Aceda ao painel para gerir todas as entidades do sistema.

URL: <http://localhost/admin/>

Utilizador: (O superusuário criado)

Senha: (A senha que você definiu)

Documentação da API (Swagger)
Aceda à documentação interativa para ver e testar todos os endpoints da API.

Swagger UI: <http://localhost/api/schema/swagger-ui/>

Redoc: <http://localhost/api/schema/redoc/>

Principais Endpoints da API
Login: POST /api/login/

Obras: GET, POST /api/obras/

Detalhe Obra: GET, PUT, PATCH, DELETE /api/obras/{id}/

Duplicar Obra: POST /api/obras/{id}/duplicar/

Ambientes: GET, POST /api/ambientes/

... e assim por diante para torres, itens, materiais, marcas e descricoes.
