import pool from '@/_lib/db';

export async function getIsAdmin() {
    try {
        const result = await pool.query(
            'SELECT 1 FROM "User" WHERE role = $1 LIMIT 1',
            ['ADMIN']
        );

        return result.rows.length > 0;
    } catch (error) {
        console.error('Erro ao acessar o banco:', error);
        return null;
    }
}