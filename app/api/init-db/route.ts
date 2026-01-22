import pool from '@/_lib/db';

export async function GET() {
    try {
        /* 0. Required extension for UUID e email */
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "pgcrypto";
            CREATE EXTENSION IF NOT EXISTS "citext";
        `);

        /* 1. Create ENUM user_role */
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_type WHERE typname = 'user_role'
                ) THEN
                    CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
                END IF;
            END$$;
        `);

        /* 2. Create table users */
        await pool.query(`
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
        `);

        /* 3. Function update_updated_at */
        await pool.query(`
            CREATE OR REPLACE FUNCTION update_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        /* 4. Trigger to update updated_at */
        await pool.query(`
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
        `);

        /* 5. Table verification_tokens */
        await pool.query(`
            CREATE TABLE IF NOT EXISTS verification_tokens (
                identifier CITEXT NOT NULL,
                token TEXT NOT NULL,
                expires_at TIMESTAMPTZ NOT NULL,
                PRIMARY KEY (identifier, token)
            );
        `);

        return Response.json({
            ok: true,
            message: 'Verified and configured bank.'
        });

    } catch (err) {
        return Response.json({
            error: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}