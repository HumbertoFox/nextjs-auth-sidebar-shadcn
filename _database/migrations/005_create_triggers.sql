-- ============================================================================
-- FUNCTION: update_updated_at
-- Description: Função trigger para atualizar automaticamente o campo updated_at
-- Behavior: 
--   - Compara NEW com OLD para detectar mudanças reais
--   - Só atualiza updated_at se algum campo foi realmente modificado
--   - Evita updates desnecessários quando valores permanecem iguais
-- Usage: Associada a triggers em tabelas com campo updated_at
-- Returns: NEW record com updated_at modificado (se houve mudança)
-- Example: UPDATE users SET name = name → NÃO atualiza updated_at
--          UPDATE users SET name = 'New' → atualiza updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW IS DISTINCT FROM OLD THEN
        NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at() IS 'Atualiza updated_at apenas quando há mudança real nos dados (NEW IS DISTINCT FROM OLD)';

-- ============================================================================
-- TRIGGER: trigger_update_users_updated_at
-- Description: Aplica a função update_updated_at() na tabela users
-- Timing: BEFORE UPDATE (antes da atualização ser commitada)
-- Scope: FOR EACH ROW (executa para cada linha afetada)
-- Effect: Garante que updated_at reflita apenas modificações reais
-- Performance: Evita writes desnecessários quando nenhum campo muda
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'trigger_update_users_updated_at'
    ) THEN
        CREATE TRIGGER trigger_update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    END IF;
END$$;

COMMENT ON TRIGGER trigger_update_users_updated_at ON users IS 'Atualiza updated_at automaticamente apenas quando há mudança real nos dados';