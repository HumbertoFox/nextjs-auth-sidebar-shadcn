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