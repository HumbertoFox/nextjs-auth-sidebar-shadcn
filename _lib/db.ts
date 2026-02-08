import pkg from 'pg';
const { Pool, Client } = pkg;

const isProduction = process.env.NODE_ENV === 'production';
const DATABASE_URL = process.env.DATABASE_URL!;

const dbUrl = new URL(DATABASE_URL);
const DB_NAME = dbUrl.pathname.replace(/^\//, '');

async function createDatabaseIfNotExists() {
    if (isProduction) return;

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

export default pool;