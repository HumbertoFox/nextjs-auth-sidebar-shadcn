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

### Inicializar Banco

```http
    GET /api/init-db
```

```bash
    http://localhost:3000/api/init-db
```

---

### O que faz:

- Cria extensões (`pgcrypto`, `citext`)

- Cria ENUM `user_role`

- Cria tabelas `users` e `verification_tokens`

- Cria trigger para atualizar `updated_at`

### Resposta esperada:

```json
    { "ok": true, "message": "Banco verificado e configurado." }
```

Esta rota pode ser executada várias vezes sem erros.

---

### Resetar Banco (`ADMIN`)

```http
    GET /api/reset-db
```

```bash
    http://localhost:3000/api/reset-db
```

⚠️ Apenas `ADMIN`. Remove todas estruturas e dados, encerra sessão atual.

### Respostas:

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

<strong>Tabelas principais:</strong> `users`, `verification_tokens`

<strong>ENUM:</strong> `user_role` → `ADMIN`, `USER`

<strong>Relação lógica:</strong> `users.email` ↔ `verification_tokens.identifier`

<strong>Trigger:</strong> Atualiza `updated_at` em users automaticamente.

---

### Usuários e Autenticação

- Primeiro usuário registrado → ADMIN

- Apenas ADMINs podem criar novos usuários

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