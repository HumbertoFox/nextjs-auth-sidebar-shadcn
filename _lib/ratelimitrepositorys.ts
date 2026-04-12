import pool from '@/_lib/db';
import { RateLimitEntry } from '@/_types';

export const rateLimitRepository = {
    async incrementAndCheck(
        key: string,
        reset_at: string
    ): Promise<RateLimitEntry> {
        const result = await pool.query<RateLimitEntry>(`
            INSERT INTO rate_limits (
                key,
                count,
                reset_at
            )
            VALUES (
                $1,
                1,
                $2
            )
            ON CONFLICT (key) DO UPDATE
                SET count = CASE
                                   WHEN rate_limits.reset_at <= NOW() THEN 1
                                   ELSE rate_limits.count + 1
                               END,
                    reset_at = CASE
                                   WHEN rate_limits.reset_at <= NOW() THEN $2
                                   ELSE rate_limits.reset_at
                               END
            RETURNING count, reset_at
        `,
            [
                key,
                reset_at
            ]);

        return result.rows[0];
    },

    async deleteByKey(
        key: string
    ): Promise<void> {
        await pool.query(`
            DELETE FROM rate_limits
            WHERE key = $1
        `, [key]);
    },
};