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
    *   Toda operação que crie/atualize múltiplos objetos relacionados **deve** usar `@transaction.atomic` para garantir consistência do banco.
    *   No `ObraSerializer`, use os métodos `_sync_ambientes` e `_sync_materiais` para upsert — **nunca** o padrão `clear()` + recriar tudo.
    *   O `ObraViewSet.queryset` já possui `select_related` e `prefetch_related` configurados. Ao adicionar novos relacionamentos ao model, verifique se precisam ser incluídos.

### Frontend (Pasta: `/frontend/`)
*   **Linguagem:** JavaScript / JSX
*   **Biblioteca:** React
*   **Build Tool:** Vite
*   **Estilização:** SCSS (incluindo integrações com CoreUI).
*   **Gerenciador de Pacotes:** npm
*   **Diretrizes:**
    *   Mantenha a arquitetura baseada em componentes do React.
    *   Atenção redobrada à resolução de dependências no Vite, especialmente ao importar arquivos SCSS de bibliotecas (`node_modules`).
    *   O template em branco para novos projetos está em `frontend/public/template.json`. Se adicionar novos campos ao model `Obra`, atualize esse arquivo também.
    *   A função `getTemplate()` em `frontend/src/api/dataService.js` possui fallback para objeto vazio caso o `template.json` não seja encontrado.
    *   Em páginas do tipo dashboard (ex: `Index.jsx`), use `height: 100vh` + `overflow: hidden` no wrapper principal para habilitar scroll interno na área de conteúdo.

### Infraestrutura
*   **Containerização:** Docker e Docker Compose (`docker-compose.yml`)
*   **Proxy Reverso:** Nginx (`/nginx/`)

## 📂 Estrutura e Arquivos Chave

*   **`README.md`**: Instruções detalhadas de inicialização local, scripts e URLs da API. **Leitura obrigatória inicial**.
*   **`/backend/app/`**: App principal do Django com a lógica de negócios e endpoints da API (obras, ambientes, materiais).
*   **`/backend/app/serializers.py`**: Contém os serializadores DRF. O `ObraSerializer` tem lógica complexa de upsert para ambientes e materiais — leia com atenção antes de modificar.
*   **`/backend/config/`**: Pasta de configurações globais do projeto Django (`settings.py`, `urls.py`).
*   **`/backend/static/`**: Arquivos estáticos do Django (imagens e CSS do admin Jazzmin). Subpastas: `img/` e `css/`.
*   **`/frontend/src/`**: Código-fonte do frontend.
*   **`/frontend/public/template.json`**: Template em branco usado ao criar um novo projeto sem referência.
*   **`/frontend/vite.config.mjs`**: Configurações de build do frontend, incluindo configurações de plugins, aliases e dependências do Vite.

## ⚙️ Ambiente de Desenvolvimento Local

### Localização do Venv
O ambiente virtual Python fica na **raiz do projeto** (não dentro de `/backend/`):
```
/venv/Scripts/python.exe
```

### Executar comandos Django sem ativar o venv
Em PowerShell, use o caminho completo ao Python do venv:
```powershell
& "C:\Users\Windows 11\Documents\Projetos\Gerenciador-Jotanunes\venv\Scripts\python.exe" manage.py <comando>
```
Exemplo de verificação de integridade:
```powershell
& "C:\...\venv\Scripts\python.exe" manage.py check
```

### Versão do Python
O projeto usa **Python 3.14** (pré-lançamento). Pacotes que exigem compilação via Rust/C++ (ex: `python-bidi`, dependência do `xhtml2pdf`) **não possuem wheel pré-compilado** para esta versão. Para evitar erros de instalação do `requirements.txt`, prefira **Python 3.12 ou 3.13**, ou instale o [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) com a opção "Desenvolvimento para desktop com C++".

## 📝 Regras de Interação para Agentes

1.  **Diretórios de Execução:** Preste muita atenção ao diretório atual ao executar comandos de terminal:
    *   Comandos backend (`python manage.py ...`, `pip install ...`) **devem** ser executados em `/backend/` usando o Python do venv (veja seção acima).
    *   Comandos frontend (`npm install`, `npm start`, etc.) **devem** ser executados em `/frontend/`.
2.  **Verificação de Dependências:** Diante de erros de compilação no frontend (como módulos ou folhas de estilo não encontrados), o agente deve primeiro inspecionar o `package.json` para confirmar a presença das dependências ou verificar a pasta `node_modules`.
3.  **Ambiente Isolado:** O projeto usa Docker, mas o desenvolvimento local atual é feito via ambientes isolados (Venv e node_modules). Respeite esse fluxo a menos que o usuário solicite explicitamente trabalhar com os containers.
4.  **Verificação pós-mudança no backend:** Após editar `models.py`, `serializers.py`, `views.py` ou `urls.py`, execute `manage.py check` para validar a integridade do projeto antes de reportar conclusão.
5.  **Rotas duplicadas:** Os endpoints `/api/ambientes/privativos/` e `/api/ambientes/area-comum/` são servidos pelos **actions do `AmbienteViewSet`** — não existem mais como rotas standalone em `urls.py`. Não os recrie.
6.  **Alteração de senha:** A única forma de trocar a senha via API é `POST /api/alterar-senha/` (exige `senha_atual`). O `PATCH /api/perfil/` **não aceita** o campo `password` por segurança.
