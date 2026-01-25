#!/usr/bin/env node

/**
 * Verifica se os dados do seed PJU (global_config, power_config, org_config) estao presentes.
 * Uso: node scripts/verify_pju_seed.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: variaveis de ambiente nao encontradas.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'ok' : 'missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'ok' : 'missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySeed() {
  console.log('\nVerificando seed PJU...\n');
  let allChecksPass = true;

  const requiredGlobal = ['dependent_deduction', 'pss_tables', 'ir_deduction'];
  const requiredPower = ['cj1_integral_base', 'salary_bases', 'aq_rules', 'gratification_percentages', 'benefits'];
  const requiredOrgs = ['jmu', 'stm'];

  console.log('1) GLOBAL_CONFIG:');
  const { data: globalData, error: globalError } = await supabase
    .from('global_config')
    .select('config_key')
    .is('valid_to', null);

  if (globalError) {
    console.error('   Erro ao buscar global_config:', globalError.message);
    allChecksPass = false;
  } else {
    const keys = globalData.map((row) => row.config_key);
    requiredGlobal.forEach((key) => {
      if (keys.includes(key)) {
        console.log(`   OK ${key}`);
      } else {
        console.log(`   FALTA ${key}`);
        allChecksPass = false;
      }
    });
  }

  console.log('\n2) POWER_CONFIG (PJU):');
  const { data: powerData, error: powerError } = await supabase
    .from('power_config')
    .select('config_key')
    .eq('power_name', 'PJU')
    .is('valid_to', null);

  if (powerError) {
    console.error('   Erro ao buscar power_config:', powerError.message);
    allChecksPass = false;
  } else {
    const keys = powerData.map((row) => row.config_key);
    requiredPower.forEach((key) => {
      if (keys.includes(key)) {
        console.log(`   OK ${key}`);
      } else {
        console.log(`   FALTA ${key}`);
        allChecksPass = false;
      }
    });
  }

  console.log('\n3) ORG_CONFIG (JMU/STM):');
  const { data: orgData, error: orgError } = await supabase
    .from('org_config')
    .select('org_slug, power_name')
    .in('org_slug', requiredOrgs);

  if (orgError) {
    console.error('   Erro ao buscar org_config:', orgError.message);
    allChecksPass = false;
  } else {
    const orgMap = new Map(orgData.map((row) => [row.org_slug, row.power_name]));
    requiredOrgs.forEach((slug) => {
      const powerName = orgMap.get(slug);
      if (!powerName) {
        console.log(`   FALTA ${slug}`);
        allChecksPass = false;
      } else if (powerName !== 'PJU') {
        console.log(`   ${slug} com power_name ${powerName} (esperado PJU)`);
        allChecksPass = false;
      } else {
        console.log(`   OK ${slug} (PJU)`);
      }
    });
  }

  console.log('\nResumo:');
  if (allChecksPass) {
    console.log('Seed PJU OK. Dados completos.');
    process.exit(0);
  } else {
    console.log('Seed PJU incompleto. Rode supabase/seeds/001_seed_pju_data.sql');
    process.exit(1);
  }
}

verifySeed().catch((err) => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
