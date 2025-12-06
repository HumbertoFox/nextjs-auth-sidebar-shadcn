import pool from '@/_lib/db';

export async function getIsAdmin() {
    try {
        const result = await pool.query(
            'SELECT 1 FROM users WHERE role = $1 LIMIT 1',
            ['ADMIN']
        );

        return result.rows.length > 0;
    } catch (error) {
        console.error('Error accessing the database:', error);
        return null;
    }
}