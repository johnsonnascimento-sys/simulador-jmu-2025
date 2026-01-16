
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = envContent.split('\n').reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        acc[match[1].trim()] = value;
    }
    return acc;
}, {} as Record<string, string>);

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Data from src/data.ts
const BASES_2025 = {
    salario: {
        'analista': { 'C13': 9292.14, 'C12': 9021.50, 'C11': 8758.73, 'B10': 8503.62, 'B9': 8255.95, 'B8': 7810.73, 'B7': 7583.23, 'B6': 7362.37, 'A5': 7147.92, 'A4': 6939.75, 'A3': 6565.50, 'A2': 6374.26, 'A1': 6188.61 },
        'tec': { 'C13': 5663.47, 'C12': 5498.51, 'C11': 5338.36, 'B10': 5182.88, 'B9': 5031.90, 'B8': 4760.56, 'B7': 4621.90, 'B6': 4487.29, 'A5': 4356.59, 'A4': 4229.69, 'A3': 4001.60, 'A2': 3885.06, 'A1': 3771.88 }
    },
    funcoes: {
        'fc1': 1215.34, 'fc2': 1413.14, 'fc3': 1644.51, 'fc4': 2313.27, 'fc5': 2662.06, 'fc6': 3663.71,
        'cj1': 7143.98, 'cj2': 8822.98, 'cj3': 10029.94, 'cj4': 11322.60
    }
};

const HISTORICO_PSS = {
    '2026': {
        teto_rgps: 8475.55,
        faixas: [
            { min: 0.00, max: 1621.00, rate: 0.075 },
            { min: 1621.01, max: 2902.84, rate: 0.090 },
            { min: 2902.85, max: 4354.27, rate: 0.120 },
            { min: 4354.28, max: 8475.55, rate: 0.140 },
            { min: 8475.56, max: 14514.30, rate: 0.145 },
            { min: 14514.31, max: 29028.58, rate: 0.165 },
            { min: 29028.59, max: 56605.73, rate: 0.190 },
            { min: 56605.74, max: Infinity, rate: 0.220 }
        ]
    },
    '2025': {
        teto_rgps: 8157.41,
        faixas: [
            { min: 0.00, max: 1518.00, rate: 0.075 },
            { min: 1518.01, max: 2793.88, rate: 0.090 },
            { min: 2793.89, max: 4190.83, rate: 0.120 },
            { min: 4190.84, max: 8157.41, rate: 0.140 },
            { min: 8157.42, max: 13969.49, rate: 0.145 },
            { min: 13969.50, max: 27938.96, rate: 0.165 },
            { min: 27938.97, max: 54480.97, rate: 0.190 },
            { min: 54480.98, max: Infinity, rate: 0.220 }
        ]
    },
    '2024': {
        teto_rgps: 7786.02,
        faixas: [
            { min: 0.00, max: 1412.00, rate: 0.075 },
            { min: 1412.01, max: 2666.68, rate: 0.090 },
            { min: 2666.69, max: 4000.03, rate: 0.120 },
            { min: 4000.04, max: 7786.02, rate: 0.140 },
            { min: 7786.03, max: 13333.48, rate: 0.145 },
            { min: 13333.49, max: 26666.94, rate: 0.165 },
            { min: 26666.95, max: 52000.54, rate: 0.190 },
            { min: 52000.55, max: Infinity, rate: 0.220 }
        ]
    }
};

const HISTORICO_IR = {
    '2025_maio': 908.73,
    '2024_fev': 896.00
};

const VALUES = {
    food_allowance: 1784.42,
    pre_school: 1235.77,
    deducao_dep: 189.59,
    cj1_integral_base: 10990.74
};

const MENUS = {
    food_allowance: [
        { label: '1.784,42 (Atual)', value: 1784.42 },
        { label: '1.460,40', value: 1460.40 },
        { label: '1.300,00', value: 1300.00 },
        { label: '1.235,77', value: 1235.77 }
    ],
    preschool_allowance: [
        { label: '1.235,77 (Atual)', value: 1235.77 },
        { label: '1.178,82', value: 1178.82 },
        { label: '935,22', value: 935.22 }
    ]
}

async function seed() {
    console.log('Seeding development database...');

    // 1. Create Root "Poder Judiciário da União" (if not exists)
    // We check by slug
    let rootId;
    const { data: existingRoot } = await supabase.from('courts').select('id').eq('slug', 'pju').single();

    if (existingRoot) {
        console.log('Root court "pju" already exists.');
        rootId = existingRoot.id;
    } else {
        // Create Root
        const { data: newRoot, error: rootError } = await supabase.from('courts').insert([{
            name: 'Poder Judiciário da União',
            slug: 'pju',
            power: 'Judiciário',
            sphere: 'Federal',
            visible: false, // Not a simulator itself, just a parent
            config: {
                bases: BASES_2025,
                historico_pss: HISTORICO_PSS,
                historico_ir: HISTORICO_IR,
                values: VALUES,
                menus: MENUS
            }
        }]).select().single();

        if (rootError) {
            console.error('Error creating root court:', rootError);
            return;
        }
        console.log('Created root court: Poder Judiciário da União');
        rootId = newRoot.id;
    }

    // 2. Create "Superior Tribunal Militar" (JMU)
    const { data: existingStm } = await supabase.from('courts').select('id').eq('slug', 'stm').single();

    if (existingStm) {
        console.log('Court "stm" already exists.');
    } else {
        const { error: stmError } = await supabase.from('courts').insert([{
            name: 'Superior Tribunal Militar',
            slug: 'stm',
            power: 'Judiciário',
            sphere: 'Federal',
            visible: true,
            parent_id: rootId,
            config: {
                // Inherits most things, maybe overrides specific things if needed
                // For now empty config meaning full inheritance
            }
        }]);

        if (stmError) {
            console.error('Error creating STM:', stmError);
        } else {
            console.log('Created court: Superior Tribunal Militar');
        }
    }

    // 3. Create "Demo Tribunal" (just for testing /simulador/demo if we want that slug to work specifically)
    const { data: existingDemo } = await supabase.from('courts').select('id').eq('slug', 'demo').single();

    if (existingDemo) {
        console.log('Court "demo" already exists.');
    } else {
        const { error: demoError } = await supabase.from('courts').insert([{
            name: 'Simulador Demo',
            slug: 'demo',
            power: 'Judiciário',
            sphere: 'Federal',
            visible: true,
            parent_id: rootId,
            config: {}
        }]);

        if (demoError) {
            console.error('Error creating Demo:', demoError);
        } else {
            console.log('Created court: Simulador Demo');
        }
    }

    console.log('Seeding completed.');
}

seed();
