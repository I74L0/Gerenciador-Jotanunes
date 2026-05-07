# 🏗️ Gerenciador de Ativos Jotanunes Construtora

> Uma solução moderna para gerenciamento de ativos e projetos de construção

## 📋 Sumário

- [📂 Estrutura do Projeto](#-estrutura-do-projeto)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [⚙️ Instalação e Configuração](#️-instalação-e-configuração)
- [🚀 Quick Start](#-quick-start)
- [🌐 URLs e Endpoints](#-urls-e-endpoints)

---

## 📂 Estrutura do Projeto

```
Gerenciador-jotanunes/
├── backend/               # API REST (Django + DRF)
├── frontend/             # Interface Web (React + Vite)
├── nginx/                # Configuração de reverse proxy e build de produção
└── Docker-compose.yml    # Orquestração de containers
```

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React, Vite, CoreUI |
| **Backend** | Django, Django REST Framework |
| **Banco de Dados** | MySQL (Docker) |
| **Fila de Tarefas** | Celery + Redis |
| **Containerização** | Docker, Docker Compose |
| **Proxy / Servidor** | Nginx |

---

## ⚙️ Instalação e Configuração

### 1️⃣ Pré-requisitos
- Docker instalado
- Docker Compose instalado

### 2️⃣ Configuração do Ambiente
Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```bash
cp .env.example .env
```

*(Certifique-se de ajustar as senhas e chaves conforme necessário)*

### 3️⃣ Iniciando o Projeto

Para iniciar todo o ecossistema (Banco, Backend, Frontend Dev, Redis, Celery, Nginx):

```bash
docker-compose up --build
```

O comando acima irá:
1. Construir as imagens necessárias.
2. Iniciar o MySQL e aguardar que ele esteja saudável.
3. Rodar as migrações do Django automaticamente.
4. Iniciar o servidor de desenvolvimento do Vite (Frontend).
5. Iniciar o servidor Gunicorn (Backend).
6. Iniciar o Worker do Celery.
7. Iniciar o Nginx como proxy reverso.

---

## 🚀 Desenvolvimento

### Comandos Úteis

| Ação | Comando |
|------|---------|
| Iniciar containers | `docker-compose up` |
| Parar containers | `docker-compose down` |
| Ver logs do backend | `docker logs -f django_backend_jotanunes` |
| Criar Superusuário | `docker exec -it django_backend_jotanunes python manage.py createsuperuser` |
| Shell do Django | `docker exec -it django_backend_jotanunes python manage.py shell` |

---

## 🌐 URLs e Endpoints

### Acesso via Nginx (Recomendado)

| Serviço | URL |
|---------|-----|
| **Aplicação (Frontend)** | [http://localhost](http://localhost) |
| **Admin Django** | [http://localhost/admin](http://localhost/admin) |
| **API Docs (Swagger)** | [http://localhost/api/schema/swagger-ui/](http://localhost/api/schema/swagger-ui/) |

### Acesso Direto (Desenvolvimento)

| Serviço | URL |
|---------|-----|
| **Frontend (Vite HMR)** | [http://localhost:5173](http://localhost:5173) |

---

## 📝 Notas Importantes

- **Banco de Dados**: O MySQL armazena dados no volume `mysql_data`. Eles persistem entre reinicializações dos containers.
- **Hot Reload**: Mudanças no código do frontend (Pasta `/frontend`) e backend (Pasta `/backend`) são refletidas automaticamente nos containers.
- **Migrações**: São executadas automaticamente ao subir o container do backend.

---

## 🔗 Referências

- [Docker Documentation](https://docs.docker.com/)
- [Django Documentation](https://docs.djangoproject.com/)
- [Vite Documentation](https://vitejs.dev/)

---

**Desenvolvido com ❤️**
