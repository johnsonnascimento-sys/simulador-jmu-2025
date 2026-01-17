// Script para criar bucket de storage no Supabase
// Execute com: node scripts/setup-storage.mjs

import pg from 'pg';
const { Client } = pg;

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

const SQL = `
-- Criar bucket de assets se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assets', 'assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Política para permitir leitura pública
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'assets');

-- Política para permitir upload por usuários autenticados
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');

-- Política para permitir update por usuários autenticados
DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
CREATE POLICY "Authenticated update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'assets' AND auth.role() = 'authenticated');
`;

async function setupStorage(db) {
    const client = new Client({
        connectionString: db.connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log(`\n🔄 Conectando ao banco ${db.name}...`);
        await client.connect();
        console.log(`✅ Conectado!`);

        console.log(`📝 Criando bucket de storage...`);
        await client.query(SQL);
        console.log(`✅ Bucket 'assets' configurado com sucesso!`);
    } catch (error) {
        console.error(`❌ Erro no banco ${db.name}:`, error.message);
    } finally {
        await client.end();
    }
}

async function main() {
    console.log('🚀 Configurando Storage nos bancos Supabase...\n');

    for (const db of databases) {
        await setupStorage(db);
    }

    console.log('\n✨ Configuração concluída!');
}

main();
