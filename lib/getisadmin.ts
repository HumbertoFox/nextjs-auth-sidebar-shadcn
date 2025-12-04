import pool from '@/lib/db';

export async function getIsAdmin() {
    const result = await pool.query(
        'SELECT 1 FROM "User" WHERE role = $1 LIMIT 1',
        ['ADMIN']
    );

    return result.rows.length > 0;
}