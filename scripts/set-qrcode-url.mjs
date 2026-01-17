// Script para inserir URL do QR Code diretamente no banco
// Execute com: node scripts/set-qrcode-url.mjs

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

// Vamos usar uma abordagem diferente: hospedar a imagem no repositório ou em um CDN público
// Por enquanto, vamos usar um placeholder ou converter a imagem para base64

async function setQrCodeUrl(db) {
    const client = new Client({
        connectionString: db.connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log(`\n🔄 Conectando ao banco ${db.name}...`);
        await client.connect();
        console.log(`✅ Conectado!`);

        // Verificar configurações atuais
        const result = await client.query(`SELECT * FROM site_settings`);
        console.log(`📋 Configurações atuais:`, result.rows);

        // Atualizar/Inserir chave Pix
        await client.query(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('pix_key', 'ff199161-21ca-4490-89be-78f9644ed6fd', NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);
        console.log(`✅ Chave Pix atualizada!`);

    } catch (error) {
        console.error(`❌ Erro no banco ${db.name}:`, error.message);
    } finally {
        await client.end();
    }
}

async function main() {
    console.log('🚀 Verificando e atualizando configurações do Pix...\n');

    for (const db of databases) {
        await setQrCodeUrl(db);
    }

    console.log('\n✨ Verificação concluída!');
}

main();
