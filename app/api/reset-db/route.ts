import pool from '@/_lib/db';

export async function GET() {
    try {
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