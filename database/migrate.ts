import fs from 'fs';
import path from 'path';
import pool from '@/_lib/db';

async function migrate() {
    try {
        console.log('🚀 Running database migrations...');

        const migrationsDir = path.join(
            process.cwd(),
            'database',
            'migrations'
        );

        const files = fs
            .readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
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

if (require.main === module) {
    migrate();
}