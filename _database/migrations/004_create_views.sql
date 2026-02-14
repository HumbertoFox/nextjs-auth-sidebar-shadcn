-- ============================================================================
-- VIEW: users_admin_public
-- Description: Retorna apenas usuários com role ADMIN sem expor dados sensíveis
-- Security: Exclui campo password
-- Use case: Listagem de administradores do sistema
-- ============================================================================
CREATE OR REPLACE VIEW users_admin_public AS
SELECT
    id,
    name,
    email,
    role,
    avatar,
    email_verified,
    deleted_at,
    created_at,
    updated_at
FROM users
WHERE role = 'ADMIN';

COMMENT ON VIEW users_admin_public IS 'View pública de usuários administradores (exclui password)';

-- ============================================================================
-- VIEW: users_public
-- Description: Todos os usuários sem dados sensíveis (ativos e deletados)
-- Security: Exclui campo password
-- Use case: Listagem geral de usuários para admins
-- ============================================================================
CREATE OR REPLACE VIEW users_public AS
SELECT
    id,
    name,
    email,
    role,
    avatar,
    email_verified,
    deleted_at,
    created_at,
    updated_at
FROM users;

COMMENT ON VIEW users_public IS 'View pública de todos os usuários incluindo deletados (exclui password)';

-- ============================================================================
-- VIEW: users_active
-- Description: Apenas usuários ativos (não deletados) com todos os campos
-- Security: INCLUI password - usar apenas internamente/backend
-- Use case: Autenticação e operações internas que requerem password
-- ============================================================================
CREATE OR REPLACE VIEW users_active AS
SELECT
    id,
    name,
    email,
    password,
    role,
    avatar,
    email_verified,
    created_at,
    updated_at
FROM users
WHERE deleted_at IS NULL;

COMMENT ON VIEW users_active IS 'View de usuários ativos incluindo password (uso interno apenas)';

-- ============================================================================
-- VIEW: users_public_active
-- Description: Apenas usuários ativos sem dados sensíveis
-- Security: Exclui password e deleted_at
-- Use case: Listagem principal de usuários para interfaces públicas
-- Note: Esta é provavelmente a view mais usada no dia a dia
-- ============================================================================
CREATE OR REPLACE VIEW users_public_active AS
SELECT
    id,
    name,
    email,
    role,
    avatar,
    email_verified,
    created_at,
    updated_at
FROM users
WHERE deleted_at IS NULL;

COMMENT ON VIEW users_public_active IS 'View pública de usuários ativos (exclui password e deleted_at) - uso principal';