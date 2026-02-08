import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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
                executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                hash TEXT NOT NULL
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
            'SELECT filename, hash FROM schema_migrations'
        );
        const executed = new Map(rows.map(r => [r.filename, r.hash]));

        let executedCount = 0;

        for (const file of files) {
            const filepath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filepath, 'utf8');

            const hash = crypto.createHash('sha256').update(sql).digest('hex');

            if (executed.has(file)) {
                if (executed.get(file) !== hash) {
                    console.warn(`⚠️  Migration "${file}" It was modified after it was applied!`);
                } else {
                    console.log(`↷ Skipping: ${file}`);
                }
                continue;
            }

            console.log(`→ Running: ${file}`);
            await pool.query(sql);

            await pool.query(
                'INSERT INTO schema_migrations (filename, hash) VALUES ($1, $2)',
                [file, hash]
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