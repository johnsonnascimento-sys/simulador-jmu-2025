#!/usr/bin/env node

/**
 * Script para verificar se a migration de dados foi executada no banco
 *
 * Verifica se os dados de data.ts foram migrados para:
 * - global_config (PSS, IR, deduções)
 * - power_config (bases salariais, AQ, benefícios)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: Variáveis de ambiente não encontradas');
    console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
    console.log('\n🔍 Verificando Migration de Dados...\n');
    console.log('='.repeat(60));

    let allChecksPass = true;

    // 1. Verificar global_config
    console.log('\n1️⃣  GLOBAL_CONFIG:');
    const { data: globalData, error: globalError } = await supabase
        .from('global_config')
        .select('config_key')
        .is('valid_to', null);

    if (globalError) {
        console.error('   ❌ Erro ao buscar global_config:', globalError.message);
        allChecksPass = false;
    } else {
        const keys = globalData.map(r => r.config_key);
        const expected = ['dependent_deduction', 'pss_tables', 'ir_deduction'];

        expected.forEach(key => {
            if (keys.includes(key)) {
                console.log(`   ✅ ${key}`);
            } else {
                console.log(`   ❌ ${key} - NÃO ENCONTRADO`);
                allChecksPass = false;
            }
        });
    }

    // 2. Verificar power_config (PJU)
    console.log('\n2️⃣  POWER_CONFIG (PJU):');
    const { data: powerData, error: powerError } = await supabase
        .from('power_config')
        .select('config_key')
        .eq('power_name', 'PJU')
        .is('valid_to', null);

    if (powerError) {
        console.error('   ❌ Erro ao buscar power_config:', powerError.message);
        allChecksPass = false;
    } else {
        const keys = powerData.map(r => r.config_key);
        const expected = ['cj1_integral_base', 'salary_bases', 'aq_rules', 'gratification_percentages', 'benefits'];

        expected.forEach(key => {
            if (keys.includes(key)) {
                console.log(`   ✅ ${key}`);
            } else {
                console.log(`   ❌ ${key} - NÃO ENCONTRADO`);
                allChecksPass = false;
            }
        });
    }

    // 3. Verificar org_config (JMU)
    console.log('\n3️⃣  ORG_CONFIG (JMU):');
    const { data: orgData, error: orgError } = await supabase
        .from('org_config')
        .select('org_slug, org_name, power_name')
        .eq('org_slug', 'jmu')
        .single();

    if (orgError) {
        console.error('   ❌ Erro ao buscar org_config:', orgError.message);
        allChecksPass = false;
    } else {
        console.log(`   ✅ org_slug: ${orgData.org_slug}`);
        console.log(`   ✅ org_name: ${orgData.org_name}`);
        console.log(`   ✅ power_name: ${orgData.power_name}`);
    }

    // 4. Summary
    console.log('\n' + '='.repeat(60));
    if (allChecksPass) {
        console.log('\n✅ MIGRATION COMPLETA - Todos os dados foram migrados!');
        console.log('\n📝 Próximos passos:');
        console.log('   1. data.ts pode ser completamente deprecado');
        console.log('   2. ConfigService está pronto para uso');
        console.log('   3. Sistema 100% data-driven ✨\n');
    } else {
        console.log('\n⚠️  MIGRATION INCOMPLETA - Execute a migration:');
        console.log('   1. Abra Supabase Dashboard → SQL Editor');
        console.log('   2. Execute: migrations/002_migrate_hardcoded_data.sql');
        console.log('   3. Execute este script novamente para verificar\n');
    }
}

verifyMigration().catch(console.error);
