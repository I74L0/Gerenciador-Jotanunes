# 🤖 Guia para Agentes de IA (AGENTS.md)

Este documento fornece contexto e diretrizes para agentes de Inteligência Artificial que auxiliam no desenvolvimento e manutenção do projeto **Gerenciador de Ativos Jotanunes Construtora**.

## 📌 Visão Geral do Projeto

O projeto é um sistema fullstack de gerenciamento de ativos e projetos de construção para a Jotanunes Construtora.

*   **Objetivo:** Modernizar o gerenciamento de obras, ambientes e materiais.
*   **Arquitetura:** Aplicação cliente-servidor tradicional com API REST no backend e SPA (Single Page Application) no frontend.

## 🛠️ Stack Tecnológico e Contexto

Ao escrever ou modificar código, os agentes devem respeitar as seguintes tecnologias:

### Backend (Pasta: `/backend/`)
*   **Linguagem:** Python
*   **Framework:** Django
*   **API:** Django REST Framework (DRF)
*   **Banco de Dados:** SQLite (em desenvolvimento)
*   **Dependências:** Gerenciadas via `requirements.txt`
*   **Diretrizes:**
    *   Siga as convenções do Django para criação de Models, Views (preferencialmente ViewSets do DRF) e Serializers.
    *   Sempre verifique a necessidade de criar migrações ao alterar modelos (`models.py`).

### Frontend (Pasta: `/frontend/`)
*   **Linguagem:** JavaScript / JSX
*   **Biblioteca:** React
*   **Build Tool:** Vite
*   **Estilização:** SCSS (incluindo integrações com CoreUI).
*   **Gerenciador de Pacotes:** npm
*   **Diretrizes:**
    *   Mantenha a arquitetura baseada em componentes do React.
    *   Atenção redobrada à resolução de dependências no Vite, especialmente ao importar arquivos SCSS de bibliotecas (`node_modules`).

### Infraestrutura
*   **Containerização:** Docker e Docker Compose (`docker-compose.yml`)
*   **Proxy Reverso:** Nginx (`/nginx/`)

## 📂 Estrutura e Arquivos Chave

*   **`README.md`**: Instruções detalhadas de inicialização local, scripts e URLs da API. **Leitura obrigatória inicial**.
*   **`/backend/app/`**: App principal do Django com a lógica de negócios e endpoints da API (obras, ambientes, materiais).
*   **`/backend/config/`**: Pasta de configurações globais do projeto Django (`settings.py`, `urls.py`).
*   **`/frontend/src/`**: Código-fonte do frontend.
*   **`/frontend/vite.config.mjs`**: Configurações de build do frontend, incluindo configurações de plugins, aliases e dependências do Vite.

## 📝 Regras de Interação para Agentes

1.  **Diretórios de Execução:** Preste muita atenção ao diretório atual ao executar comandos de terminal:
    *   Comandos backend (`python manage.py ...`, `pip install ...`) **devem** ser executados em `/backend/` com o ambiente virtual (venv) ativado.
    *   Comandos frontend (`npm install`, `npm start`, etc.) **devem** ser executados em `/frontend/`.
2.  **Verificação de Dependências:** Diante de erros de compilação no frontend (como módulos ou folhas de estilo não encontrados), o agente deve primeiro inspecionar o `package.json` para confirmar a presença das dependências ou verificar a pasta `node_modules`.
3.  **Ambiente Isolado:** O projeto usa Docker, mas o desenvolvimento local atual é feito via ambientes isolados (Venv e node_modules). Respeite esse fluxo a menos que o usuário solicite explicitamente trabalhar com os containers.
