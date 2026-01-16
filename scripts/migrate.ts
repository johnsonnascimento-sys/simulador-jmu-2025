
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

// Connection String provided by user
// Warning: If password contains special chars it might need encoding, but usually works.
// Detailed parsing might be needed if the brackets are literal.
// User inputs: "postgresql://postgres:[TYeDN3JhvglQsQtu]@db.fdzuykiwqzzmlzjtnbfi.supabase.co:5432/postgres"

const RAW_CONNECTION_STRING = "postgresql://postgres:[TYeDN3JhvglQsQtu]@db.fdzuykiwqzzmlzjtnbfi.supabase.co:5432/postgres";

// Fix: Remove brackets from password if present.
// Regex to capture password between : and @
const connectionString = RAW_CONNECTION_STRING.replace(/:\[(.*?)\]@/, ':$1@');

console.log('Connecting to database...');
// console.log('Using connection string:', connectionString); // Don't log credentials

const client = new Client({
    connectionString: connectionString,
});

async function migrate() {
    try {
        await client.connect();
        console.log('Connected successfully.');

        const schemaPath = path.resolve(process.cwd(), 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

        console.log('Executing schema.sql...');
        await client.query(schemaSql);

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
