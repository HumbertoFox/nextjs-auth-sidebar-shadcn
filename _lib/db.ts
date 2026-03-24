import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === 'production';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('❌ DATABASE_URL not defined in .env');

// Substitui sslmode=require por verify-full para evitar aviso de deprecação do pg
const connectionString = isProduction
    ? DATABASE_URL.replace('sslmode=require', 'sslmode=verify-full')
    : DATABASE_URL;

const basePool = new Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: true } : false,
});

// Pool "cru" — sem SET ROLE, para uso exclusivo em scripts de migrate/admin.
// Roda como o usuário dono do banco (quem tem permissão de CREATE no schema).
export const rawPool = basePool;

// Cache — verifica a role apenas uma vez usando o primeiro cliente disponível
let backendRoleExists: boolean | null = null;

async function resolveBackendRole(client: pkg.PoolClient): Promise<boolean> {
    if (backendRoleExists !== null) return backendRoleExists;

    try {
        const res = await client.query(`
            SELECT 1
            FROM pg_roles
            WHERE rolname = 'app_backend_role'
        `);
        backendRoleExists = (res.rowCount ?? 0) > 0;
    } catch {
        backendRoleExists = false;
    }

    return backendRoleExists;
}

// Pool padrão da aplicação — aplica SET ROLE app_backend_role em cada query.
// Use este pool em todo código de aplicação (rotas, serviços, etc.).
const pool = {
    async query<T extends pkg.QueryResultRow = pkg.QueryResultRow>(
        text: string | pkg.QueryConfig<unknown[]>,
        values?: unknown[]
    ): Promise<pkg.QueryResult<T>> {
        const client = await basePool.connect();
        try {
            const roleExists = await resolveBackendRole(client);
            if (roleExists) {
                try {
                    await client.query('SET ROLE app_backend_role');
                } catch {
                    if (!isProduction) {
                        console.warn('⚠️  SET ROLE app_backend_role not available.');
                    }
                    backendRoleExists = false;
                }
            }
            return values
                ? await client.query<T>(text as string, values)
                : await client.query<T>(text as string);
        } finally {
            client.release();
        }
    },
};

export default pool;