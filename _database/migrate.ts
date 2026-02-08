import fs from 'fs';
import path from 'path';
import pool from '../_lib/db.ts';

async function migrate() {
    try {
        console.log('🚀 Running database migrations...');

        const existingTables = await pool.query(`
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public';
        `);

        if ((existingTables.rowCount ?? 0) > 0) {
            console.log('⚠️  The database already has tables. No migration will be executed.');
            process.exit(0);
        }

        const migrationsDir = path.join(
            process.cwd(),
            '_database',
            'migrations'
        );

        const files = fs
            .readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql') && !file.includes('reset'))
            .sort();

        if (files.length === 0) {
            console.log('⚠️  No migration files found.');
            process.exit(0);
        }

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            console.log(`→ Running: ${file}`);
            const sql = fs.readFileSync(filePath, 'utf8');
            await pool.query(sql);
        }

        console.log('✅ All migrations executed successfully.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Migration failed.');
        console.error(err instanceof Error ? err.message : err);
        process.exit(1);
    }
}

await migrate();