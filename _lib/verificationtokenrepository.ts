import pool from '@/_lib/db';

export interface VerificationToken {
    identifier: string;
    token: string;
    expires_at: Date;
}

export const VerificationTokenRepository = {
    async findByIdentifier(identifier: string) {
        const result = await pool.query<VerificationToken>(`
            SELECT *
            FROM verification_tokens
            WHERE identifier = $1
                AND expires_at > NOW()
            ORDER BY expires_at DESC
            LIMIT 1
            `,
            [identifier]
        );

        return result.rows[0] ?? null;
    },

    async findValidToken(identifier: string, token: string) {
        const result = await pool.query<VerificationToken>(`
            SELECT *
            FROM verification_tokens
            WHERE identifier = $1
              AND token = $2
              AND expires_at > NOW()
            LIMIT 1
            `,
            [
                identifier,
                token
            ]
        );

        return result.rows[0] ?? null;
    },

    async create(data: {
        identifier: string;
        token: string;
        expires_at: Date;
    }) {
        const result = await pool.query<VerificationToken>(`
            INSERT INTO verification_tokens (
                identifier,
                token,
                expires_at
            )
            VALUES (
                $1,
                $2,
                $3
            )
            RETURNING *
            `,
            [
                data.identifier,
                data.token,
                data.expires_at
            ]
        );

        return result.rows[0];
    },

    async deleteByIdentifier(identifier: string) {
        await pool.query(`
            DELETE FROM verification_tokens
            WHERE identifier = $1
            `,
            [identifier]
        );
    },

    async delete(identifier: string, token: string) {
        await pool.query(`
            DELETE FROM verification_tokens
            WHERE identifier = $1
              AND token = $2
            `,
            [identifier, token]
        );
    },
}