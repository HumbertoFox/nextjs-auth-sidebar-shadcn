## NextJS Auth Sidebar ShadCN – Documentação

### 📋 Sumário

- [Introdução](#introdu&#231;&#227;o)

- [Requisitos](#requisitos)

- [Variáveis de Ambiente](#vari&#225;veis-de-ambiente)

- [Rodando o Projeto](#rodando-o-projeto)

- [Banco de Dados](#banco-de-dados)

  - [Inicializar Banco](#inicializar-banco)

  - [Resetar Banco](#resetar-banco-admin)

  - [Modelo de Dados](#modelo-de-dados)

- [Usuários e Autenticação](#usu&#225;rios-e-autentica&#231;&#227;o)

- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)

- [Dependências](#depend&#234;ncias)

---

### Introdução

Aplicação Next.js com autenticação, controle de papéis (`ADMIN`, `USER`) e backend PostgreSQL.
Suporta login com senha, login mágico e verificação de e-mail.

---

### Requisitos

- Node.js 20+

- PostgreSQL

---

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

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

### Rodando o Projeto

```bash
    npm install
    npm run dev
```

A aplicação estará disponível em:

```bash
    http://localhost:3000
```

---

## Banco de Dados

O projeto possui rotas da API para inicialização e reset do banco de dados automaticamente.

Além disso, **se o banco de dados não existir**, ele será criado automaticamente na inicialização. Isso garante que você nunca precise criar o banco manualmente antes de rodar o projeto.

### Inicializar Banco

```http
    GET /api/init-db
```

```bash
    http://localhost:3000/api/init-db
```

---

**O que faz:**

- Verifica se o banco existe; se não, cria automaticamente.

- Cria extensões PostgreSQL necessárias (`pgcrypto`, `citext`).

- Cria ENUM `user_role` (`ADMIN`, `USER`).

- Cria tabelas `users` e `verification_tokens`.

- Cria views públicas e ativas para acesso seguro.

- Cria função `update_updated_at` e trigger para atualizar timestamps automaticamente.

- Protege a tabela `users`, liberando acesso somente às views.

**Resposta esperada:**

```json
    { "ok": true, "message": "Banco verificado e configurado." }
```

Esta rota pode ser executada várias vezes sem erros.

---

### Resetar Banco (`ADMIN`)

```pgsql
    GET /api/reset-db
```

```bash
    http://localhost:3000/api/reset-db
```

⚠️ Apenas `ADMIN` pode executar. Remove todas estruturas e dados, encerra sessão atual.

**Respostas:**

- Não-ADMIN:

```json
    { "error": "Acesso negado. Apenas administradores podem resetar o banco." }
```

- ADMIN:

```json
    { "ok": true, "message": "Banco resetado com sucesso." }
```

---

### Modelo de Dados

**Tabelas principais:** `users`, `verification_tokens`

**ENUM:** `user_role` → `ADMIN`, `USER`

**Relação lógica:** `users.email` ↔ `verification_tokens.identifier`

**Trigger:** Atualiza `updated_at` em users automaticamente.

Para detalhes de criação de tabelas, views e triggers, consulte o código em `@/_lib/db.ts`.

---

### Usuários e Autenticação

- Primeiro usuário registrado → `ADMIN`

- Apenas `ADMINs` podem criar novos usuários

- Login: e-mail + senha ou login mágico

- Controle de acesso por papéis (`ADMIN`, `USER`)

- Soft delete de usuários

---

### Fluxo de Desenvolvimento

```text
    1. Inicializar banco → /api/init-db
    2. Criar primeiro usuário (ADMIN)
    3. Desenvolver normalmente
    4. Resetar se necessário → /api/reset-db
    5. Inicializar banco novamente → /api/init-db
```
---

### Dependências

- Next.js, React, TailwindCSS

- Radix UI, Nodemailer, jose, bcrypt-ts, pg, Zod, gsap

---