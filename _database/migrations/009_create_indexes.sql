-- ============================================================================
-- INDEXES
-- Description: Índices extraídos dos arquivos de migration
-- ============================================================================

-- ============================================================================
-- TABLE: users
-- Origin: 003_create_users.sql
-- ============================================================================

-- INDEX: idx_users_deleted_at
-- Description: Otimiza queries que filtram usuários ativos/deletados
-- Usage: WHERE deleted_at IS NULL / IS NOT NULL
CREATE INDEX IF NOT EXISTS idx_users_deleted_at
    ON users(deleted_at);

-- ============================================================================
-- TABLE: verification_tokens
-- Origin: 006_create_verification_tokens.sql
-- ============================================================================

-- INDEX: idx_verification_tokens_expires_at
-- Description: Otimiza limpeza de tokens expirados e validação
-- Usage: DELETE WHERE expires_at < NOW() ou WHERE expires_at > NOW()
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at
    ON verification_tokens(expires_at);

COMMENT ON INDEX idx_verification_tokens_expires_at IS 'Otimiza queries de validação e limpeza de tokens expirados';

-- INDEX: idx_verification_tokens_identifier
-- Description: Otimiza busca de tokens por identificador (email)
-- Usage: SELECT * FROM verification_tokens WHERE identifier = 'user@example.com'
CREATE INDEX IF NOT EXISTS idx_verification_tokens_identifier
    ON verification_tokens(identifier);

COMMENT ON INDEX idx_verification_tokens_identifier IS 'Otimiza busca de tokens por identificador/email';

-- ============================================================================
-- TABLE: rate_limits
-- Origin: 007_create_rate_limits.sql
-- ============================================================================

-- INDEX: idx_rate_limits_reset_at
-- Description: Otimiza limpeza eficiente de entradas expiradas
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at
    ON rate_limits (reset_at);