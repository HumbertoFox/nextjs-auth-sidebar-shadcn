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

    if (!DATABASE_URL) throw new Error('❌ DATABASE_URL not defined in .env');
    const tmpUrl = new URL(DATABASE_URL);
    tmpUrl.pathname = '/postgres';
    const client = new Client({
        connectionString: tmpUrl.toString(),
        ssl: false,
    });

    await client.connect();

    const res = await client.query(
        `SELECT 1
        FROM pg_database
        WHERE datname = $1`,
        [DB_NAME]
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

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.on('connect', (client) => {
    client
        .query(`
            SELECT 1 FROM pg_roles WHERE rolname = 'app_backend_role'
        `)
        .then((res) => {
            if (res.rowCount && res.rowCount > 0) {
                return client.query('SET ROLE app_backend_role');
            }
        })
        .catch((err) => {
            console.error('❌ Failed to SET ROLE app_backend_role:', err);
        });
});

export default pool;