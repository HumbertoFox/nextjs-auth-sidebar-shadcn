-- ============================================================================
-- TABLE: verification_tokens
-- Description: Armazena tokens temporários para verificação de email e 
--              recuperação de senha
-- Features:
--   - Chave composta (identifier + token) para garantir unicidade
--   - Identifier case-insensitive (CITEXT)
--   - Expiração controlada via expires_at
--   - Sem soft delete (tokens devem ser deletados após uso/expiração)
-- Usage:
--   - Email verification: identifier = email, token = random hash
--   - Password reset: identifier = email, token = random hash
-- Security: Tokens devem ser hasheados antes de armazenar
-- ============================================================================
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier CITEXT NOT NULL,      -- Email ou identificador do usuário
    token TEXT NOT NULL,              -- Token único (recomendado: hash SHA-256)
    expires_at TIMESTAMPTZ NOT NULL,  -- Data/hora de expiração do token
    PRIMARY KEY (identifier, token)
);

COMMENT ON TABLE verification_tokens IS 'Tokens temporários de verificação de email e recuperação de senha com expiração automática';

-- ============================================================================
-- COLUMN COMMENTS
-- ============================================================================
COMMENT ON COLUMN verification_tokens.identifier IS 'Identificador do usuário, geralmente email (case-insensitive)';
COMMENT ON COLUMN verification_tokens.token IS 'Token único de verificação (recomendado armazenar hash, não plaintext)';
COMMENT ON COLUMN verification_tokens.expires_at IS 'Timestamp de expiração - tokens expirados devem ser deletados';

-- ============================================================================
-- INDEX: idx_verification_tokens_expires_at
-- Description: Otimiza limpeza de tokens expirados e validação
-- Usage: DELETE WHERE expires_at < NOW() ou WHERE expires_at > NOW()
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at
    ON verification_tokens(expires_at);

COMMENT ON INDEX idx_verification_tokens_expires_at IS 'Otimiza queries de validação e limpeza de tokens expirados';

-- ============================================================================
-- INDEX: idx_verification_tokens_identifier
-- Description: Otimiza busca de tokens por identificador (email)
-- Usage: SELECT * FROM verification_tokens WHERE identifier = 'user@example.com'
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_verification_tokens_identifier
    ON verification_tokens(identifier);

COMMENT ON INDEX idx_verification_tokens_identifier IS 'Otimiza busca de tokens por identificador/email';