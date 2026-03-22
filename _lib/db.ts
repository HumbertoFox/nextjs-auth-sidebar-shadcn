import pkg from 'pg';
import 'dotenv/config';
const { Pool, Client } = pkg;

const isProduction = process.env.NODE_ENV === 'production';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('❌ DATABASE_URL not defined in .env');

const dbUrl = new URL(DATABASE_URL);
const DB_NAME = dbUrl.pathname.replace(/^\//, '');

async function createDatabaseIfNotExists() {
    if (isProduction) return;

    const tmpUrl = new URL(DATABASE_URL!);
    tmpUrl.pathname = '/postgres';
    const client = new Client({
        connectionString: tmpUrl.toString(),
        ssl: false,
    });

    await client.connect();

    const res = await client.query(`
        SELECT 1
        FROM pg_database
        WHERE datname = $1
    `,
        [
            DB_NAME
        ]
    );

    if (res.rowCount === 0) {
        await client.query(`
            CREATE DATABASE "${DB_NAME}"
        `);
        console.log(`Database "${DB_NAME}" created.`);
    } else {
        console.log(`Database "${DB_NAME}" It already exists.`);
    }

    await client.end();
}

await createDatabaseIfNotExists();

const basePool = new Pool({
    connectionString: DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Verifica uma vez se a role existe para evitar query extra a cada conexão
let backendRoleExists: boolean | null = null;

async function checkRoleExists(): Promise<boolean> {
    if (backendRoleExists !== null) return backendRoleExists;
    try {
        const client = await basePool.connect();
        try {
            const res = await client.query(`
                SELECT 1
                FROM pg_roles
                WHERE rolname = 'app_backend_role'
            `);
            backendRoleExists = (res.rowCount ?? 0) > 0;
        } finally {
            client.release();
        }
    } catch {
        backendRoleExists = false;
    }
    return backendRoleExists;
}

const pool = {
    async query<T extends pkg.QueryResultRow = pkg.QueryResultRow>(
        text: string | pkg.QueryConfig<unknown[]>,
        values?: unknown[]
    ): Promise<pkg.QueryResult<T>> {
        const client = await basePool.connect();
        try {
            const roleExists = await checkRoleExists();
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