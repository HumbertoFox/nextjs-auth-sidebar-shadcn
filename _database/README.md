## 🗄 Banco de Dados – Migrations

Esta pasta contém todos os scripts SQL de migrations para o projeto Next.js.
O objetivo é organizar, versionar e aplicar alterações no banco de dados de forma segura, repetível e auditável.

---

### Estrutura da Pasta

000_reset.sql → Reseta o banco (drop tables, views, triggers, enums).

001_init_extensions.sql → Cria extensões necessárias no PostgreSQL (pgcrypto, citext).

002_create_users.sql → Cria tabela users e enums relacionados (user_role).

003_create_users_views.sql → Cria views públicas e administrativas para usuários.

004_create_users_triggers.sql → Cria triggers e funções auxiliares (ex.: update_updated_at).

005_create_verification_tokens.sql → Cria tabela verification_tokens.

006_create_permissions.sql → Cria tabela permissions e relacionamentos.

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

Prefixo numérico (`007`, `008`) + timestamp + descrição (opcional).

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

- Tabelas principais: `users`, `verification_tokens`

- Trigger: `update_updated_at` atualiza automaticamente `updated_at`

- Views públicas: `users_public`, `users_admin_public`, `users_active`, `users_public_active`