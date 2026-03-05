-- ============================================================================
-- ROLES
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_backend_role') THEN
        CREATE ROLE app_backend_role NOLOGIN;
    END IF;
END $$;

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
CREATE POLICY policy_users_backend
    ON users FOR ALL
    TO app_backend_role
    USING (true);

-- PUBLIC não acessa a tabela diretamente (só via views)
CREATE POLICY policy_users_public
    ON users FOR SELECT
    TO PUBLIC
    USING (false);