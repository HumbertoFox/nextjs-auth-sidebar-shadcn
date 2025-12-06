import { getUser } from '@/_lib/dal';
import pool from '@/_lib/db';

export async function GET() {
    try {
        const user = await getUser();

        if (!user || user.role !== 'ADMIN') {
            return Response.json(
                { error: 'Acesso negado. Apenas administradores podem resetar o banco.' },
                { status: 403 }
            );
        }

        await pool.query(`
            DROP TABLE IF EXISTS verification_tokens;
            DROP TABLE IF EXISTS users;
            DROP TYPE IF EXISTS user_role;
        `);

        return Response.json({ ok: true, message: 'Banco resetado com sucesso.' });

    } catch (err) {
        return Response.json({
            error: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}