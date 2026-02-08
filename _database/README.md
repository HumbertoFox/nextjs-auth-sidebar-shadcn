## 🗄 Banco de Dados – Migrations

Esta pasta contém todos os scripts SQL de migrations para o projeto Next.js.
O objetivo é organizar, versionar e aplicar alterações no banco de dados de forma segura e repetível.

---

### Estrutura da Pasta

`000_reset.sql` → Reseta o banco (drop tables, views, triggers, enums).

`001_init_users.sql` → Cria extensões, enums, tabelas, views, funções e triggers iniciais.

`XXX_*.sql` → Futuras migrations devem ser numeradas sequencialmente (`002_`, `003_`, etc).

**Ordem das migrations:**

Os arquivos são executados em ordem alfabética/numerada, garantindo consistência.

---

### Scripts Node.js

Além dos arquivos `.sql`, o projeto possui scripts para executar migrations via Node.js:

`database/reset.ts` → Aplica `000_reset.sql` e limpa o banco.

`database/migrate.ts` → Aplica todas as migrations `.sql` na pasta em ordem, **mas não executa se houver tabelas existentes**, evitando reset acidental.

---

### Comandos no package.json

```bash

    # Resetar banco (apaga tudo)
    npm run db:reset

    # Rodar todas as migrations
    npm run db:migrate

    # Reset + migrate + iniciar dev
    npm run db:setup

```

---

### Boas práticas para novas migrations

**1. Nomear sequencialmente:**

Use prefixos numéricos (`002_add_profiles.sql`, `003_add_posts.sql`).

**2. Idempotência:**

Sempre use `IF EXISTS` ou `IF NOT EXISTS` para evitar erros em execuções repetidas.

**3. Evitar dados sensíveis:**

Scripts de migrations devem focar em estrutura (tabelas, views, triggers).

**4. Separar lógica por arquivo:**

Cada alteração significativa do banco deve ser uma migration própria.

---

### Fluxo de uso

**1. Criar ou modificar uma migration `.sql`.**

**2. Rodar:**

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

- → Running: `<arquivo.sql>` → migration aplicada com sucesso

- ✅ All migrations executed successfully → todas as migrations aplicadas

---

### Referência

- Extensões PostgreSQL usadas: `pgcrypto`, `citext`

- Enum: `user_role` → `ADMIN`, `USER`

- Tabelas principais: `users`, `verification_tokens`

- Trigger: `update_updated_at` atualiza automaticamente `updated_at`

- Views públicas: `users_public`, `users_admin_public`, `users_active`, `users_public_active`