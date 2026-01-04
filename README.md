### 🚀 Executando o Projeto Localmente

### 📌 Pré-requisitos

- Node.js 20+

- PostgreSQL

### ⚙️ Variáveis de Ambiente


Crie um arquivo `.env`:

```env

    DATABASE_URL=
    AUTH_SECRET=
    SMTP_HOST=
    SMTP_PORT=
    SMTP_USER=
    SMTP_PASS=
    NEXT_URL=

```

---

### ▶️ Executar o projeto

```bash

    npm install
    npm run dev

```

<strong>A aplicação estará disponível em:</strong>

```text

    http://localhost:3000

```

---

### 🗄️ Inicialização do Banco de Dados

Este projeto utiliza rotas da API para criar e resetar o banco de dados automaticamente.

### 🔧 Inicializar / Criar Banco


```text

    GET /api/init-db

```

```text

    http://localhost:3000/api/init-db

```

### ✅ Resposta esperada

```json

    {
      "ok": true,
      "message": "Banco verificado e configurado."
    }

```

<strong>ℹ️ Esta rota pode ser executada várias vezes sem causar erros.</strong>

---

### ♻️ Reset do Banco de Dados (`ADMIN`)

### ⚠️ Apenas usuários com role `ADMIN`

- Remove todas as estruturas do banco

- Apaga todos os dados

- Encerra a sessão atual

```text

    GET /api/reset-db

```

```text

    http://localhost:3000/api/reset-db

```

### 🚫 Se não for `ADMIN`

```json

    {
      "error": "Acesso negado. Apenas administradores podem resetar o banco."
    }

```

### ✅ Se for `ADMIN`

```json

    {
        "ok": true,
        "message": "Banco resetado com sucesso."
    }

```

---

### 📌 Fluxo recomendado para desenvolvimento

```text

    1. Criar o banco      → /api/init-db
    2. Criar o primeiro usuário (ADMIN)
    3. Desenvolver normalmente
    4. Resetar se preciso → /api/reset-db
    5. Criar novamente    → /api/init-db

```

---

### 👤 Primeiro Usuário

- O primeiro usuário registrado será automaticamente ADMIN

- Após isso, apenas administradores podem registrar novos usuários

### 🔐 Autenticação e Controle de Acesso

- Login com e-mail e senha

- Suporte a verificação de e-mail / login mágico

- Controle de acesso por papéis (`ADMIN`, `USER`)

- Soft delete de usuários