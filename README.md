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
fullstack-jotanunes/
├── backend/               # API REST (Django + DRF)
│   ├── jotanunes/         # App principal
│   ├── residencia/        # Configurações Django
│   └── manage.py
├── frontend/             # Interface Web (React + Vite)
│   ├── src/
│   ├── public/
│   └── vite.config.mjs
├── nginx/                # Configuração de reverse proxy
└── docker-compose.yml    # Orquestração de containers
```

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React, Vite, ESLint |
| **Backend** | Django, Django REST Framework |
| **Banco de Dados** | SQLite (desenvolvimento) |
| **Containerização** | Docker, Docker Compose |
| **Proxy** | Nginx |

---

## ⚙️ Instalação e Configuração

### 1️⃣ Configuração Inicial (Ambiente Virtual)

Crie um ambiente virtual Python:

```bash
python -m venv venv
```

Ative o ambiente virtual de acordo com seu sistema operacional:

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```bash
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/Scripts/activate
```

---

### 2️⃣ Backend - Django

#### 📍 Navegação

```bash
cd backend
```

#### 🔧 Instalação e Setup

```bash
# Instalar dependências
pip install -r requirements.txt

# Executar migrações do banco de dados
python manage.py migrate

# Criar usuário administrador (superuser)
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

✅ Backend estará disponível em: **http://127.0.0.1:8000**

---

### 3️⃣ Frontend - React + Vite

#### 📍 Navegação

```bash
cd frontend
```

#### 🔧 Instalação e Setup

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
```

✅ Frontend estará disponível em: **http://localhost:3000**

---

## 🚀 Quick Start

### Execução Rápida do Backend

```bash
python -m venv venv
venv\Scripts\activate.bat
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Execução Rápida do Frontend

```bash
python -m venv venv
venv\Scripts\activate.bat
cd frontend
npm install
npm start
```

---

## 🌐 URLs e Endpoints

### Admin & Aplicação

| URL | Descrição |
|-----|-----------|
| **http://127.0.0.1:8000/** | Página inicial do backend |
| **http://127.0.0.1:8000/admin** | Painel administrativo Django |
| **http://127.0.0.1:8000/api/** | Base de todos os endpoints |

### Exemplos de Endpoints da API

```
http://127.0.0.1:8000/api/obras          # Listar obras
http://127.0.0.1:8000/api/ambientes      # Listar ambientes
http://127.0.0.1:8000/api/materiais      # Listar materiais
```

### Frontend

| URL | Descrição |
|-----|-----------|
| **http://localhost:3000** | Aplicação React principal |

---

## 📝 Notas Importantes

- Certifique-se de estar no diretório correto antes de executar os comandos
- O backend deve estar rodando antes de acessar a aplicação frontend
- Use o painel admin (http://127.0.0.1:8000/admin) para gerenciar dados
- As migrações devem ser executadas sempre que há mudanças no banco de dados

---

## 🔗 Referências

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

**Desenvolvido com ❤️**
