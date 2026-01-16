# Guia de Atualização Segura do Banco de Dados (Produção)

Este guia explica como atualizar as configurações do sistema (ex: tabelas salariais) sem colocar em risco os dados dos usuários.

---

## Regra de Ouro: Jamais Delete

Para garantir que nenhum dado de usuário seja perdido:
1.  **NUNCA** use comandos `DROP TABLE` ou `DROP DATABASE`.
2.  **NUNCA** use scripts de "Seed" (reinicialização) em produção, pois eles geralmente apagam tudo antes de inserir.
3.  **SEMPRE** use comandos de `UPDATE` (Atualização) ou `ALTER` (Modificação).

---

## Cenário 1: Atualizar Valores (Ex: Reajuste Salarial 2026)

Quando o governo publica um aumento, você quer mudar o JSON de configuração do tribunal, mas manter o resto intacto.

### Script SQL Seguro
No Supabase SQL Editor (Produção), você rodaria algo assim:

```sql
-- Atualiza APENAS a configuração do STM, mantendo IDs e outros dados
UPDATE courts
SET config = jsonb_set(
    config, 
    '{bases, salario, analista, C13}', -- Caminho para o dado exato
    '10000.00' -- Novo valor
)
WHERE slug = 'stm';
```

Ou, se for mudar a configuração inteira (mais fácil), você prepara o JSON completo no seu computador e roda:

```sql
UPDATE courts
SET config = '{ "bases": { ... todo o json novo ... } }'
WHERE slug = 'stm';
```

**Por que é seguro?**
O comando `UPDATE` só mexe na linha que você pediu. Se houver 1 milhão de usuários salvos em outras tabelas, eles não são afetados.

---

## Cenário 2: Mudança de Estrutura (Ex: Novo Recurso)

Imagine que criamos uma funcionalidade de "Salvar Cálculo". Precisamos criar uma tabela nova.

### Migration Aditiva (Safe)
Em vez de apagar o banco, você roda um comando que **adiciona**:

```sql
-- Cria a tabela nova (se não existir)
CREATE TABLE IF NOT EXISTS saved_calculations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    court_id uuid REFERENCES courts(id),
    result_data jsonb,
    created_at timestamp DEFAULT now()
);

-- Adiciona uma coluna nova em uma tabela existente
ALTER TABLE courts 
ADD COLUMN IF NOT EXISTS last_updated timestamp;
```

**Por que é seguro?**
O comando `CREATE IF NOT EXISTS` e `ALTER TABLE ADD` apenas somam ao banco. O que já existe continua lá funcionando.

---

## Fluxo Recomendado de Trabalho

1.  **Teste Local (Dev)**:
    *   Faça a alteração no código (`data.ts`).
    *   Rode o script de seed local (`npm run seed:dev`) para ver se funciona no simulador.
    *   *Nota: Em Dev, tudo bem apagar e recriar se precisar, mas tente habituar-se a atualizar.*

2.  **Preparação para Produção**:
    *   Escreva o SQL de atualização (como nos exemplos acima).

3.  **Execução em Produção**:
    *   Faça backup (Supabase faz backups diários automáticos, mas você pode fazer um manual no Dashboard -> Database -> Backups).
    *   Rode o SQL no "SQL Editor" do projeto de Produção.
    *   Verifique se o site atualizou.

## Ferramenta Avançada: Supabase Migrations (CLI)

Futuramente, se o projeto crescer, recomenda-se usar a CLI do Supabase. Ela permite que você salve os arquivos `.sql` na pasta do projeto e o Supabase aplica eles automaticamente em ordem.

Exemplo de arquivo: `supabase/migrations/20260101_reajuste_salario.sql`

Isso cria um histórico auditável de tudo que mudou no banco.
