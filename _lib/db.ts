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

async function setBackendRole(client: pkg.PoolClient) {
    try {
        const res = await client.query(`
            SELECT 1
            FROM pg_roles
            WHERE rolname = 'app_backend_role'
        `);

        if (res.rowCount && res.rowCount > 0) {
            await client.query('SET ROLE app_backend_role');
        }
    } catch {
        // Em ambientes gerenciados (Neon, Supabase) o SET ROLE pode não ser
        // suportado. O banco continua funcionando via permissões diretas ao
        // usuário da conexão. Rode db:migrate para aplicar o GRANT correto.
        if (!isProduction) {
            console.warn('⚠️  SET ROLE app_backend_role not available in this environment.');
        }
    }
}

await createDatabaseIfNotExists();

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.on('connect', (client) => {
    setBackendRole(client);
});

export default pool;