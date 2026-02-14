-- ============================================================================
-- TABLE: users
-- Description: Armazena informações dos usuários do sistema
-- Features:
--   - Soft delete habilitado via deleted_at
--   - Suporte a autenticação por senha e OAuth (password nullable)
--   - Email case-insensitive (CITEXT)
--   - Timestamps automáticos de auditoria
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                              -- Nome completo do usuário
    email CITEXT UNIQUE NOT NULL,                    -- Email único (case-insensitive)
    password TEXT NULL,                              -- Hash da senha (NULL para OAuth/SSO)
    role user_role NOT NULL DEFAULT 'USER',          -- Nível de acesso do usuário
    email_verified TIMESTAMPTZ NULL,                 -- Data/hora de verificação do email
    avatar TEXT NULL,                                -- URL ou path do avatar
    deleted_at TIMESTAMPTZ NULL,                     -- Soft delete timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),   -- Data de criação do registro
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()    -- Data da última atualização
);

-- ============================================================================
-- TABLE COMMENT
-- ============================================================================
COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema com suporte a soft delete e autenticação múltipla';

-- ============================================================================
-- COLUMN COMMENTS
-- ============================================================================
COMMENT ON COLUMN users.id IS 'Identificador único do usuário (UUID v4)';
COMMENT ON COLUMN users.name IS 'Nome completo do usuário';
COMMENT ON COLUMN users.email IS 'Email único do usuário (case-insensitive via CITEXT)';
COMMENT ON COLUMN users.password IS 'Hash bcrypt da senha (NULL para autenticação OAuth/SSO)';
COMMENT ON COLUMN users.role IS 'Nível de acesso: ADMIN ou USER';
COMMENT ON COLUMN users.email_verified IS 'Timestamp de verificação do email (NULL = não verificado)';
COMMENT ON COLUMN users.avatar IS 'URL ou caminho do arquivo de avatar do usuário';
COMMENT ON COLUMN users.deleted_at IS 'Timestamp de soft delete (NULL = ativo, NOT NULL = deletado)';
COMMENT ON COLUMN users.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN users.updated_at IS 'Data e hora da última atualização (atualizado automaticamente)';

-- ============================================================================
-- INDEX: idx_users_deleted_at
-- Description: Otimiza queries que filtram usuários ativos/deletados
-- Usage: WHERE deleted_at IS NULL / IS NOT NULL
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_deleted_at
    ON users(deleted_at);