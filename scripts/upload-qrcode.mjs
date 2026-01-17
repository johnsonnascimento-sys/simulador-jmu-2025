// Script para fazer upload do QR Code oficial e atualizar configurações
// Execute com: node scripts/upload-qrcode.mjs

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const PIX_KEY = 'ff199161-21ca-4490-89be-78f9644ed6fd';
const QRCODE_FILE = path.join(__dirname, '../novo design/QR Code Pix Oficial.jpeg');

const databases = [
    {
        name: 'Desenvolvimento',
        url: 'https://fdzuykiwqzzmlzjtnbfi.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkenV5a2l3cXp6bWx6anRuYmZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MTc4MzgsImV4cCI6MjA4NDA5MzgzOH0.bo7tyD_S_hVSs_cEuAzBBeQXy8YSQSKdez0b1Z8RNMc'
    },
    {
        name: 'Produção',
        url: 'https://govzmfpwrbsmqgzjtfmt.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdnptZnB3cmJzbXFnemp0Zm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MTc4MzgsImV4cCI6MjA4NDA5MzgzOH0.placeholder'
    }
];

async function uploadAndConfigure(db) {
    const supabase = createClient(db.url, db.key);

    console.log(`\n🔄 Configurando ${db.name}...`);

    try {
        // Ler arquivo
        const fileBuffer = fs.readFileSync(QRCODE_FILE);
        const fileName = `pix-qrcode-oficial-${Date.now()}.jpeg`;
        const filePath = `qrcodes/${fileName}`;

        // Upload para o Storage
        console.log(`📤 Fazendo upload do QR Code...`);
        const { error: uploadError } = await supabase.storage
            .from('assets')
            .upload(filePath, fileBuffer, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error(`❌ Erro no upload:`, uploadError.message);
            return;
        }

        // Obter URL pública
        const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
        const publicUrl = data.publicUrl;
        console.log(`✅ Upload concluído: ${publicUrl}`);

        // Atualizar configurações
        console.log(`📝 Atualizando configurações...`);

        // Atualizar chave Pix
        await supabase.from('site_settings').upsert(
            { key: 'pix_key', value: PIX_KEY, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
        );

        // Atualizar URL do QR Code
        await supabase.from('site_settings').upsert(
            { key: 'pix_qrcode_url', value: publicUrl, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
        );

        console.log(`✅ Configurações atualizadas!`);
        console.log(`   - Chave Pix: ${PIX_KEY}`);
        console.log(`   - QR Code URL: ${publicUrl}`);

    } catch (error) {
        console.error(`❌ Erro:`, error.message);
    }
}

async function main() {
    console.log('🚀 Upload do QR Code Oficial e Configuração do Pix\n');
    console.log(`📁 Arquivo: ${QRCODE_FILE}`);
    console.log(`🔑 Chave Pix: ${PIX_KEY}`);

    // Verificar se arquivo existe
    if (!fs.existsSync(QRCODE_FILE)) {
        console.error(`❌ Arquivo não encontrado: ${QRCODE_FILE}`);
        return;
    }

    // Apenas desenvolvimento por enquanto (produção precisa da chave correta)
    await uploadAndConfigure(databases[0]);

    console.log('\n✨ Configuração concluída!');
    console.log('🔄 Recarregue a página /apoiar para ver as mudanças.');
}

main();
