-- 1. Trigger
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;

-- 2. Function
DROP FUNCTION IF EXISTS update_updated_at;

-- 3. Views
DROP VIEW IF EXISTS users_public_active;
DROP VIEW IF EXISTS users_active;
DROP VIEW IF EXISTS users_public;
DROP VIEW IF EXISTS users_admin_public;

-- 4. Tables
DROP TABLE IF EXISTS verification_tokens;
DROP TABLE IF EXISTS users;

-- 5. Enum
DROP TYPE IF EXISTS user_role;

-- 6. Tabela de migrations
DROP TABLE IF EXISTS schema_migrations;

-- 7. Extensões
DROP EXTENSION IF EXISTS pgcrypto CASCADE;
DROP EXTENSION IF EXISTS citext CASCADE;