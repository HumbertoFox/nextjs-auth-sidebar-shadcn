## NextJS Auth Sidebar ShadCN – Documentação

### 📋 Sumário

- [Introdução](#introdução)

- [Requisitos](#requisitos)

- [Variáveis de Ambiente](#variáveis-de-ambiente)

- [Rodando o Projeto](#rodando-o-projeto)

- [Armazenamento de arquivos](#armazenamento-de-arquivos-avatar-upload)

- [Banco de Dados](#banco-de-dados)
  - [Inicializar Banco](#inicializar-banco)

  - [Resetar Banco](#resetar-banco-devadmin)

  - [Setup Completo Dev](#setup-completo-dev)

  - [Modelo de Dados](#modelo-de-dados)

- [Usuários e Autenticação](#usuários-e-autenticação)

- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)

- [Dependências](#dependências)

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
    BLOB_READ_WRITE_TOKEN=
    DATABASE_URL=
    AUTH_SECRET=
    SMTP_HOST=
    SMTP_PORT=
    SMTP_USER=
    SMTP_PASS=
    NEXT_URL=
```

---

### Descrição

| Variável              | Descrição                                    |
| --------------------- | -------------------------------------------- |
| BLOB_READ_WRITE_TOKEN | Token para upload de arquivos no Vercel Blob |
| DATABASE_URL          | Conexão com PostgreSQL                       |
| AUTH_SECRET           | Chave secreta para sessões                   |
| SMTP_HOST             | Servidor SMTP                                |
| SMTP_PORT             | Porta SMTP                                   |
| SMTP_USER             | Usuário SMTP                                 |
| SMTP_PASS             | Senha SMTP                                   |
| NEXT_URL              | URL da aplicação                             |

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

### Armazenamento de arquivos (Avatar Upload)

O projeto utiliza **Vercel Blob Storage** para armazenar avatares de usuários.

O upload é realizado através de Server Actions, com validações de segurança antes do envio do arquivo.

`upload-avatar.ts` → processa e valida a imagem enviada

`sharp` → verifica dimensões e integridade da imagem

`@vercel/blob` → realiza o upload do arquivo para o storage

Além disso, as imagens passam por validações de:

formato (`JPEG`, `PNG`, `WebP`)

tamanho máximo (`512 KB`)

dimensão máxima (`512x512px`)

Após o upload, o **Blob retorna uma URL pública**, que é armazenada no banco de dados no campo `avatar` do usuário.

Para mais detalhes sobre o fluxo de upload, validações e configuração do storage, consulte o [Detalhes do Armazenamento de arquivos](_docs/storage.md).

## Banco de Dados

O projeto possui scripts Node.js para gerenciar o banco de dados:

`reset.ts` → reseta o banco

`migrate.ts` → aplica migrations

`make-migration` → cria novos arquivos de migration com número sequencial e timestamp automático

Além disso, **se o banco não existir**, ele será criado automaticamente pelo `_lib/db.ts`.

Para mais detalhes sobre cada migration, consulte o [Detalhes das Migrations](_docs/database.md).

### Inicializar Banco

Para criar ou aplicar as migrations manualmente:

```bash
npm run db:migrate
```

---

**O que faz:**

- Cria extensões PostgreSQL necessárias (`pgcrypto`, `citext`).

- Cria ENUM `user_role` (`ADMIN`, `USER`).

- Cria tabelas `users` e `verification_tokens`.

- Cria views públicas e ativas para acesso seguro.

- Cria função `update_updated_at` e `trigger_update_users_updated_at` para atualizar timestamps automaticamente.

- Protege a tabela `users`, liberando acesso somente às views.

---

### Criar uma nova Migration

```bash
npm run make:migration "Descrição da migration"
```

- Cria arquivo `.sql` na pasta `_database/migrations` com:

Número sequencial automático

`**Timestamp automático**

**Descrição opcional**, convertida para **snake_case e sem aspas**

Exemplo de uso:

```bash
npm run make:migration "Add new Profiles Table"
```

- Arquivo gerado:

```pgsql
007_20260208124500_add_new_profiles_table.sql
```

**Observações:**

- Não inclua aspas no nome do arquivo; apenas no argumento do comando

- Todos os caracteres especiais serão removidos

- Espaços são convertidos em `_`

---

### Resetar Banco (`DEV`/`ADMIN`)

```bash
npm run db:reset
```

- Aplica 000_reset.sql e limpa todas as tabelas

- **⚠️ Aviso: apaga todos os dados. Não usar em produção**

- Após reset, rode novamente:

**Após reset, rode novamente:**

```bash
npm run db:migrate
```

---

### Setup Completo Dev

**Para resetar, recriar o banco e rodar o servidor de dev:**

```bash
npm run db:setup
npm run dev
```

**Isso equivale a:**

1. `npm run db:reset` → limpa o banco

2. `npm run db:migrate` → recria tudo

3. `npm run dev` → inicia o servidor Next.js

---

### Modelo de Dados

**Tabelas principais:** `users`, `verification_tokens`

**ENUM:** `user_role` → `ADMIN`, `USER`

**Relação lógica:** `users.email` ↔ `verification_tokens.identifier`

**Trigger:** Atualiza `updated_at` em users automaticamente.

Para detalhes de criação de tabelas, views e triggers, consulte os scripts em `database/migrations` e `_lib/db.ts`.

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
    1. Resetar banco (opcional) → npm run db:reset
    2. Inicializar banco → npm run db:migrate
    3. Criar primeiro usuário (ADMIN)
    4. Desenvolver normalmente
    5. Resetar se necessário → npm run db:reset
    6. Inicializar banco novamente → npm run db:migrate
```

---

### Dependências

- Next.js

- React

- TailwindCSS

- Radix UI

- Nodemailer

- jose

- bcrypt-ts

- pg

- Zod

- gsap

- Sharp

- Vercel Blob

---