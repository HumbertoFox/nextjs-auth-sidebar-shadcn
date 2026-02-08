import fs from 'fs';
import path from 'path';
import pool from '../_lib/db.ts';

async function migrate() {
    try {
        console.log('🚀 Running database migrations...');

        const migrationsDir = path.join(
            process.cwd(),
            '_database',
            'migrations'
        );

        if (!fs.existsSync(migrationsDir)) {
            console.error('❌ Migrations directory not found.');
            process.exit(1);
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename TEXT PRIMARY KEY,
                executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
        `);

        const files = fs
            .readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql') && !file.includes('reset'))
            .sort();

        if (files.length === 0) {
            console.log('⚠️  No migration files found.');
            process.exit(0);
        }

        const { rows } = await pool.query(
            'SELECT filename FROM schema_migrations'
        );
        const executed = new Set(rows.map(r => r.filename));

        let executedCount = 0;

        for (const file of files) {
            if (executed.has(file)) {
                console.log(`↷ Skipping: ${file}`);
                continue;
            }

            console.log(`→ Running: ${file}`);
            const sql = fs.readFileSync(
                path.join(migrationsDir, file),
                'utf8'
            );

            await pool.query(sql);

            await pool.query(
                'INSERT INTO schema_migrations (filename) VALUES ($1)',
                [file]
            );

            executedCount++;
        }

        if (executedCount === 0) {
            console.log('ℹ️  Database is already up to date.');
        } else {
            console.log(`✅ ${executedCount} migration(s) executed successfully.`);
        }

        process.exit(0);

    } catch (err) {
        console.error('❌ Migration failed.');
        console.error(err instanceof Error ? err.message : err);
        process.exit(1);
    }
}

await migrate();