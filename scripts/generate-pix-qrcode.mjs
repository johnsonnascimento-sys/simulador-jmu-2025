// Script para gerar QR Code Pix limpo a partir do código EMV
// Execute com: node scripts/generate-pix-qrcode.mjs

import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Código EMV oficial do Pix
const PIX_EMV_CODE = '00020126580014br.gov.bcb.pix0136ff199161-21ca-4490-89be-78f9644ed6fd5204000053039865802BR5924johnson teixeira do nasc6009Sao Paulo62220518daqr7570640620247363043E04';

const OUTPUT_PATH = path.join(__dirname, '../src/assets/pix-qrcode-clean.png');

async function generateQRCode() {
    console.log('🚀 Gerando QR Code Pix limpo...\n');
    console.log('📋 Código EMV:', PIX_EMV_CODE.substring(0, 50) + '...');

    try {
        // Gerar QR Code com opções de alta qualidade
        await QRCode.toFile(OUTPUT_PATH, PIX_EMV_CODE, {
            type: 'png',
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
        });

        console.log(`\n✅ QR Code gerado com sucesso!`);
        console.log(`📁 Arquivo: ${OUTPUT_PATH}`);

    } catch (error) {
        console.error('❌ Erro ao gerar QR Code:', error.message);
    }
}

generateQRCode();
