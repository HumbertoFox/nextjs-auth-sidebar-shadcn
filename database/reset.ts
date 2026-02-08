import fs from 'fs';
import path from 'path';
import pool from '@/_lib/db';

async function resetDatabase() {
    try {
        console.log('⚠️  Starting database reset...');

        const resetFile = path.join(
            process.cwd(),
            'database',
            'migrations',
            '000_reset.sql'
        );

        if (!fs.existsSync(resetFile)) {
            throw new Error('Reset file 000_reset.sql not found.');
        }

        const sql = fs.readFileSync(resetFile, 'utf8');

        await pool.query(sql);

        console.log('✅ Database reset successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Database reset failed.');
        console.error(err instanceof Error ? err.message : err);
        process.exit(1);
    }
}

if (require.main === module) {
    resetDatabase();
}