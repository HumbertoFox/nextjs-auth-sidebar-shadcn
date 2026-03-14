## 🗄 Banco de Dados – Migrations

Esta pasta contém todos os scripts SQL de migrations para o projeto Next.js.
O objetivo é organizar, versionar e aplicar alterações no banco de dados de forma segura, repetível e auditável.

---

### Estrutura da Pasta

000_reset.sql → Reseta o banco (drop triggers, functions, views, tables, enums, schema_migrations, extensões e role).

001_init_extensions.sql → Cria extensões necessárias no PostgreSQL (pgcrypto, citext).

002_create_enums.sql → Cria enums do sistema (user_role).

003_create_users.sql → Cria tabela users com índices, comentários e suporte a soft delete.

004_create_views.sql → Cria views públicas e administrativas para usuários.

005_create_triggers.sql → Cria função e trigger de atualização automática de updated_at.

006_create_verification_tokens.sql → Cria tabela verification_tokens com índices.

007_create_permissions.sql → Cria role app_backend_role, permissões via GRANT/REVOKE e políticas RLS.

**Ordem das migrations:**

Os arquivos são executados em ordem alfabética/numerada, garantindo consistência.

---

### Scripts Node.js

**Criar uma nova migration**

```bash
    npm run make:migration "descrição da migration"
```

- Cria um arquivo `.sql` na pasta `_database/migrations` com:
  - Número sequencial automático

  - **Timestamp automático**

  - **Descrição opcional**, que será convertida automaticamente para **snake_case** e **sem aspas**.

- Exemplo de arquivo gerado:

`007_20260208124500_add_profiles.sql`

**Observações importantes:**

- Não inclua aspas no nome do arquivo; use apenas a descrição dentro das aspas do comando.

- Todos os caracteres especiais (como `!`, `.`, `-`) serão removidos automaticamente.

- Espaços são convertidos em underscores `_`.

**Rodar migrations**

```bash
    npm run db:migrate
```

- Executa todas as migrations não aplicadas, em ordem.

- Registra cada migration aplicada na tabela schema_migrations com hash do conteúdo.

- Detecta alterações em migrations já aplicadas e emite aviso.

- Mensagens detalhadas:
  - ↷ Skipping: <arquivo> → migration já aplicada e sem alterações.

  - ⚠️ Migration "<arquivo>" was modified after it was applied! → migration alterada após execução.

  - → Running: <arquivo.sql> → migration aplicada.

  - ✅ X migration(s) executed successfully. → migrations aplicadas.

  - ℹ️ Database is already up to date. → todas as migrations já foram aplicadas.

**Resetar o banco**

```bash
    npm run db:reset
```

- Aplica 000_reset.sql e limpa todas as tabelas.

**Reset + migrate + iniciar dev**

```bash
    npm run db:setup
```

---

### Boas práticas para novas migrations

**1. Nomear sequencialmente:**

Prefixo numérico (`008`, `009`) + timestamp + descrição (opcional).

**2. Idempotência:**

Sempre use `IF EXISTS` ou `IF NOT EXISTS` para evitar erros em execuções repetidas.

**3. Evitar dados sensíveis:**

Scripts devem focar em estrutura (tabelas, views, triggers).

**4. Separar lógica por arquivo:**

Cada alteração significativa deve ter uma migration própria.

---

### Fluxo de uso

**1. Criar ou modificar uma migration:**

```bash
    npm run make:migration "descrição opcional"
```

**2. Rodar migrations::**

```bash
    npm run db:migrate
```

**3. Para limpar tudo e recriar o banco:**

```bash
    npm run db:setup
```

---

### Mensagens exibidas pelo migrate

- ⚠️ Banco já possui tabelas → nenhuma migration será executada

- ↷ Skipping: <arquivo> → migration já aplicada

- ⚠️ Migration "<arquivo>" was modified after it was applied! → migration alterada

- → Running: <arquivo.sql> → migration aplicada

- ✅ X migration(s) executed successfully → migrations aplicadas

- ℹ️ Database is already up to date → banco atualizado

---

### Referência

- Extensões PostgreSQL usadas: `pgcrypto`, `citext`

- Enum: `user_role` → `ADMIN`, `USER`

- Tabelas principais: `users`, `verification_tokens`, `schema_migrations`

- Índices: `idx_users_deleted_at`, `idx_verification_tokens_expires_at`, `idx_verification_tokens_identifier`

- Função: `update_updated_at` compara **NEW** com **OLD** e só atualiza se houver mudança real

- Trigger: `trigger_update_users_updated_at` atualiza automaticamente `updated_at` na tabela `users`

- Views públicas (sem password): `users_public`, `users_admin_public`, `users_public_active`

- Role: `app_backend_role` — acesso exclusivo à tabela `users`, `users_active` e `verification_tokens`

- RLS: Row Level Security habilitado na tabela users — PUBLIC só acessa via views