CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier CITEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);