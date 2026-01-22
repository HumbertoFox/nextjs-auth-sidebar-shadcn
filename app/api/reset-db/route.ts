import { getUser } from '@/_lib/dal';
import pool from '@/_lib/db';
import { deleteSession } from '@/app/api/actions/logoutuser';

export async function GET() {
    try {
        const user = await getUser();

        if (!user || user.role !== 'ADMIN') {
            return Response.json(
                { error: 'Access denied. Only administrators can reset the database.' },
                { status: 403 }
            );
        }

        await pool.query(`
            DROP TABLE IF EXISTS verification_tokens;
            DROP TABLE IF EXISTS users;
            DROP TYPE IF EXISTS user_role;
        `);

        await deleteSession();

        return Response.json({ ok: true, message: 'Bank reset successfully.' });

    } catch (err) {
        return Response.json({
            error: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}