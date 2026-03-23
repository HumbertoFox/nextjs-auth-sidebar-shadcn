-- Garante que estamos operando como o owner das tabelas
SET ROLE NONE;

-- 1. Trigger
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;

-- 2. Function
DROP FUNCTION IF EXISTS update_updated_at;

-- 3. Views
DROP VIEW IF EXISTS users_public_active CASCADE;
DROP VIEW IF EXISTS users_active CASCADE;
DROP VIEW IF EXISTS users_public CASCADE;
DROP VIEW IF EXISTS users_admin_public CASCADE;

-- 4. Tables
DROP TABLE IF EXISTS rate_limits CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 5. Enum
DROP TYPE IF EXISTS user_role CASCADE;

-- 6. Tabela de migrations
DROP TABLE IF EXISTS schema_migrations CASCADE;

-- 7. Extensões
DROP EXTENSION IF EXISTS pgcrypto CASCADE;
DROP EXTENSION IF EXISTS citext CASCADE;

-- 8. Role
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_backend_role') THEN
        REASSIGN OWNED BY app_backend_role TO CURRENT_USER;
        DROP OWNED BY app_backend_role;
        DROP ROLE app_backend_role;
    END IF;
END $$;