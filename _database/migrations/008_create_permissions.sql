-- ============================================================================
-- ROLES
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_backend_role') THEN
        CREATE ROLE app_backend_role NOLOGIN;
    END IF;
END $$;

-- Garante que o usuário da conexão pode usar SET ROLE app_backend_role
-- Necessário no Neon e em ambientes gerenciados onde o superuser não é o owner
DO $$
DECLARE
    current_user_name TEXT := current_user;
BEGIN
    EXECUTE format('GRANT app_backend_role TO %I', current_user_name);
EXCEPTION WHEN others THEN
    RAISE NOTICE 'GRANT app_backend_role TO % skipped: %', current_user_name, SQLERRM;
END $$;

-- ============================================================================
-- GRANT: acesso ao schema public
-- Necessário no PostgreSQL 15+ onde CREATE/USAGE no public não é mais automático
-- para roles que não são superuser ou owner do schema.
-- Sem isso: "permissão negada para esquema public"
-- ============================================================================
GRANT USAGE ON SCHEMA public TO app_backend_role;

-- ============================================================================
-- REVOKE: bloqueia acesso direto à tabela users para todos
-- ============================================================================
REVOKE ALL ON users FROM PUBLIC;
REVOKE ALL ON users_active FROM PUBLIC;

-- ============================================================================
-- GRANT views públicas → PUBLIC (sem password)
-- ============================================================================
GRANT SELECT ON users_public        TO PUBLIC;
GRANT SELECT ON users_admin_public  TO PUBLIC;
GRANT SELECT ON users_public_active TO PUBLIC;

-- ============================================================================
-- GRANT view com password → somente backend
-- ============================================================================
REVOKE ALL ON users_active FROM PUBLIC;
GRANT SELECT ON users_active TO app_backend_role;

-- ============================================================================
-- GRANT operações na tabela users → somente backend
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO app_backend_role;

-- ============================================================================
-- GRANT operações em verification_tokens → somente backend
-- ============================================================================
REVOKE ALL ON verification_tokens FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON verification_tokens TO app_backend_role;

-- ============================================================================
-- RLS: bloqueia acesso direto à tabela users (segunda camada)
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Backend vê tudo
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'users' AND policyname = 'policy_users_backend'
    ) THEN
        CREATE POLICY policy_users_backend
            ON users FOR ALL
            TO app_backend_role
            USING (true);
    END IF;
END $$;

-- PUBLIC não acessa a tabela diretamente (só via views)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'users' AND policyname = 'policy_users_public'
    ) THEN
        CREATE POLICY policy_users_public
            ON users FOR SELECT
            TO PUBLIC
            USING (false);
    END IF;
END $$;

-- ============================================================================
-- GRANT operações em rate_limits → somente backend
-- ============================================================================
REVOKE ALL ON rate_limits FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON rate_limits TO app_backend_role;

-- ============================================================================
-- RLS: bloqueia acesso direto à tabela rate_limits
-- ============================================================================
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'rate_limits' AND policyname = 'policy_rate_limits_backend'
    ) THEN
        CREATE POLICY policy_rate_limits_backend
            ON rate_limits FOR ALL
            TO app_backend_role
            USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'rate_limits' AND policyname = 'policy_rate_limits_public'
    ) THEN
        CREATE POLICY policy_rate_limits_public
            ON rate_limits FOR SELECT
            TO PUBLIC
            USING (false);
    END IF;
END $$;