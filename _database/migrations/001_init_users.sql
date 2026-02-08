CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'user_role'
    ) THEN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    password TEXT NULL,
    role user_role NOT NULL DEFAULT 'USER',
    email_verified TIMESTAMPTZ NULL,
    avatar TEXT NULL,
    deleted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

REVOKE ALL ON users FROM PUBLIC;
GRANT SELECT ON users_public TO PUBLIC;
GRANT SELECT ON users_admin_public TO PUBLIC;
GRANT SELECT ON users_public_active TO PUBLIC;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier CITEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);