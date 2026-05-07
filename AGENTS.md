# 🤖 Guia para Agentes de IA (AGENTS.md)

Este documento fornece contexto e diretrizes para agentes de Inteligência Artificial que auxiliam no desenvolvimento e manutenção do projeto **Gerenciador de Ativos Jotanunes Construtora**.

## 📌 Visão Geral do Projeto

O projeto é um sistema fullstack de gerenciamento de ativos e projetos de construção para a Jotanunes Construtora.

*   **Objetivo:** Modernizar o gerenciamento de obras, ambientes e materiais.
*   **Arquitetura:** Aplicação totalmente containerizada com Docker.

## 🛠️ Stack Tecnológico e Contexto

Ao escrever ou modificar código, os agentes devem respeitar as seguintes tecnologias:

### Backend (Pasta: `/backend/`)
*   **Linguagem:** Python 3.11 (via Docker)
*   **Framework:** Django
*   **API:** Django REST Framework (DRF)
*   **Banco de Dados:** MySQL (Docker)
*   **Diretrizes:**
    *   Siga as convenções do Django para criação de Models, Views e Serializers.
    *   Toda operação que crie/atualize múltiplos objetos relacionados **deve** usar `@transaction.atomic`.
    *   Comandos Django devem ser executados via `docker exec -it django_backend_jotanunes python manage.py <comando>`.

### Frontend (Pasta: `/frontend/`)
*   **Linguagem:** JavaScript / JSX
*   **Biblioteca:** React
*   **Build Tool:** Vite (Rodando no container `frontend_jotanunes`)
*   **Estilização:** SCSS (CoreUI).
*   **Diretrizes:**
    *   Mantenha a arquitetura baseada em componentes.
    *   O build de produção é servido via Nginx.

### Infraestrutura (Docker)
*   **Docker Compose:** Gerencia MySQL, Redis, Celery, Backend, Frontend e Nginx.
*   **Variáveis de Ambiente:** Configuradas no arquivo `.env` na raiz.

## 📂 Estrutura e Arquivos Chave

*   **`README.md`**: Instruções de inicialização via Docker.
*   **`Docker-compose.yml`**: Orquestração dos serviços.
*   **`/backend/config/settings.py`**: Configurações Django, dinâmicas via `python-decouple`.
*   **`.env.example`**: Modelo de variáveis de ambiente para o Docker.

## ⚙️ Ambiente de Desenvolvimento (Docker Workflow)

### Executar comandos no Backend
```powershell
docker exec -it django_backend_jotanunes python manage.py <comando>
```

### Executar comandos no Frontend
```powershell
docker exec -it frontend_jotanunes npm <comando>
```

## 📝 Regras de Interação para Agentes

1.  **Prioridade Docker:** Sempre utilize e recomende o fluxo via Docker Compose. Evite comandos locais (`pip`, `npm` direto na máquina) a menos que explicitamente solicitado.
2.  **Variáveis de Ambiente:** Nunca hardcode credenciais. Use o arquivo `.env` e acesse via `config()` no backend.
3.  **Migrações:** O container do backend está configurado para rodar `python manage.py migrate` ao iniciar. Se criar novos modelos, lembre-se de rodar `makemigrations`.
4.  **Verificação pós-mudança:** Após editar o backend, verifique os logs: `docker logs -f django_backend_jotanunes`.
5.  **Rotas duplicadas:** Os endpoints `/api/ambientes/privativos/` e `/api/ambientes/area-comum/` são servidos pelos **actions do `AmbienteViewSet`**.
6.  **Alteração de senha:** Use `POST /api/alterar-senha/`. O `PATCH /api/perfil/` **não aceita** o campo `password`.
