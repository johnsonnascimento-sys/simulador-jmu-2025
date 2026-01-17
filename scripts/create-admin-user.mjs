// Script para criar usuário admin no Supabase
// Execute com: node scripts/create-admin-user.mjs

import pg from 'pg';
const { Client } = pg;

// Configuração - ALTERE ESTES VALORES
const ADMIN_EMAIL = 'admin@salariodoservidor.com.br';
const ADMIN_PASSWORD = 'Admin@2024!';  // Senha forte para o admin

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

async function createAdminUser(db) {
    const client = new Client({
        connectionString: db.connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log(`\n🔄 Conectando ao banco ${db.name}...`);
        await client.connect();
        console.log(`✅ Conectado!`);

        // Verificar se usuário já existe
        const checkResult = await client.query(
            `SELECT id FROM auth.users WHERE email = $1`,
            [ADMIN_EMAIL]
        );

        if (checkResult.rows.length > 0) {
            console.log(`ℹ️ Usuário ${ADMIN_EMAIL} já existe no banco ${db.name}`);
            return;
        }

        // Criar usuário usando a função do Supabase Auth
        // Nota: Esta é uma abordagem simplificada, normalmente usaria a API de Admin
        console.log(`📝 Criando usuário admin...`);

        // Criar hash da senha usando pgcrypto (se disponível) ou inserir diretamente
        // Como o Supabase Auth gerencia isso, vamos usar uma abordagem via SQL direta
        const userId = crypto.randomUUID();
        const now = new Date().toISOString();

        // Insert into auth.users - isso funciona mas precisa de cuidado
        // Melhor é usar a API de Admin do Supabase ou o Dashboard
        console.log(`⚠️ Para criar usuários com senha, use o Supabase Dashboard ou a API de Admin.`);
        console.log(`\n📋 Instruções para criar usuário no Supabase Dashboard:`);
        console.log(`   1. Acesse: https://supabase.com/dashboard/project/${db.connectionString.includes('fdzuykiwqzzmlzjtnbfi') ? 'fdzuykiwqzzmlzjtnbfi' : 'govzmfpwrbsmqgzjtfmt'}/auth/users`);
        console.log(`   2. Clique em "Add user" → "Create new user"`);
        console.log(`   3. Email: ${ADMIN_EMAIL}`);
        console.log(`   4. Password: Escolha uma senha forte`);
        console.log(`   5. Marque "Auto Confirm User"`);

    } catch (error) {
        console.error(`❌ Erro no banco ${db.name}:`, error.message);
    } finally {
        await client.end();
    }
}

async function main() {
    console.log('🚀 Configurando usuário admin nos bancos Supabase...');
    console.log(`📧 Email do admin: ${ADMIN_EMAIL}\n`);

    for (const db of databases) {
        await createAdminUser(db);
    }

    console.log('\n✨ Processo concluído!');
    console.log('\n📌 Lembrete: Crie o usuário manualmente via Dashboard do Supabase para maior segurança.');
}

main();
