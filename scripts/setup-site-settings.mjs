// Script para criar tabela site_settings nos bancos Supabase
// Execute com: node scripts/setup-site-settings.mjs

import pg from 'pg';
const { Client } = pg;

const SQL = `
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (key, value) 
VALUES ('pix_key', 'seu-pix-aqui@email.com')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON site_settings;
CREATE POLICY "Allow public read" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated update" ON site_settings;
CREATE POLICY "Allow authenticated update" ON site_settings FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated insert" ON site_settings;
CREATE POLICY "Allow authenticated insert" ON site_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
`;

const databases = [
    {
        name: 'Desenvolvimento',
        connectionString: 'postgresql://postgres:TYeDN3JhvglQsQtu@db.fdzuykiwqzzmlzjtnbfi.supabase.co:5432/postgres'
    },
    {
        name: 'Produção',
        connectionString: 'postgresql://postgres:qgJOlmk3pEBr3XXo@db.govzmfpwrbsmqgzjtfmt.supabase.co:5432/postgres'
    }
];

async function setupDatabase(db) {
    const client = new Client({
        connectionString: db.connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log(`\n🔄 Conectando ao banco ${db.name}...`);
        await client.connect();
        console.log(`✅ Conectado!`);

        console.log(`📝 Executando SQL...`);
        await client.query(SQL);
        console.log(`✅ Tabela site_settings criada/atualizada com sucesso!`);
    } catch (error) {
        console.error(`❌ Erro no banco ${db.name}:`, error.message);
    } finally {
        await client.end();
    }
}

async function main() {
    console.log('🚀 Configurando tabela site_settings nos bancos Supabase...\n');

    for (const db of databases) {
        await setupDatabase(db);
    }

    console.log('\n✨ Configuração concluída!');
}

main();
