-- ============================================================================
-- EXTENSION: pgcrypto
-- Description: Fornece funções criptográficas para o PostgreSQL
-- Security: Usado para gerar UUIDs aleatórios e seguros
-- Use case: Geração de IDs primários (gen_random_uuid()) em tabelas do sistema
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

COMMENT ON EXTENSION pgcrypto IS 'Fornece funções criptográficas incluindo gen_random_uuid() para gerar UUIDs. Usado para gerar IDs primários em tabelas do sistema.';

-- ============================================================================
-- EXTENSION: citext
-- Description: Tipo de texto case-insensitive (CITEXT) para colunas como email
-- Security: Garante comparações case-insensitive sem necessidade de LOWER()
-- Use case: Coluna email da tabela users — evita duplicidade tipo email@EXAMPLE.com vs email@example.com
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "citext";

COMMENT ON EXTENSION citext IS 'Tipo de texto case-insensitive (CITEXT) para emails. Garante que email@EXAMPLE.com = email@example.com nas comparações.';