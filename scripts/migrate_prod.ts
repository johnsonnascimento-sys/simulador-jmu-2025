
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

// User inputs: "postgresql://postgres:[qgJOlmk3pEBr3XXo]@db.govzmfpwrbsmqgzjtfmt.supabase.co:5432/postgres"

const RAW_CONNECTION_STRING = "postgresql://postgres:[qgJOlmk3pEBr3XXo]@db.govzmfpwrbsmqgzjtfmt.supabase.co:5432/postgres";

// Remove brackets from password if present.
const connectionString = RAW_CONNECTION_STRING.replace(/:\[(.*?)\]@/, ':$1@');

const client = new Client({
    connectionString: connectionString,
});

async function migrate() {
    try {
        console.log('Connecting to PRODUCTION database...');
        await client.connect();
        console.log('Connected successfully.');

        const schemaPath = path.resolve(process.cwd(), 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

        console.log('Executing schema.sql in PRODUCTION...');
        await client.query(schemaSql);

        console.log('Migration completed successfully in PRODUCTION.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
