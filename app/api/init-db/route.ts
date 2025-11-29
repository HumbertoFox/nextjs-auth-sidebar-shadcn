import pool from '@/lib/db';

export async function GET() {
    try {
        /* 1. Criar ENUM user_role */
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

        /* 2. Criar tabela users */
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role user_role NOT NULL DEFAULT 'USER',
                email_verified TIMESTAMP NULL,
                avatar TEXT NULL,
                deleted_at TIMESTAMP NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        /* 3. Função update_updated_at */
        await pool.query(`
            CREATE OR REPLACE FUNCTION update_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        /* 4. Trigger para atualizar updated_at */
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

        /* 5. Tabela verification_tokens */
        await pool.query(`
            CREATE TABLE IF NOT EXISTS verification_tokens (
                identifier TEXT NOT NULL,
                token TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                PRIMARY KEY (identifier, token)
            );
        `);

        return Response.json({
            ok: true,
            message: 'Banco verificado e configurado.'
        });

    } catch (err) {
        return Response.json({
            error: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}