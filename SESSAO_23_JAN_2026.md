# Sessão de Trabalho - 23 de Janeiro de 2026

## Resumo Executivo

Trabalhamos na correção de bugs críticos na calculadora de salários após a migração para multi-agência. O problema principal era que os cálculos retornavam R$ 0,00 devido a slugs de agência hardcoded no código.

## Problemas Identificados e Resolvidos

### 1. ✅ Async/Await Bug (CRÍTICO)
**Problema:** O método `calculateTotal` em `JmuService.ts` foi refatorado para `async`, mas o hook `useCalculatorResults.ts` chamava-o sem `await`, causando crash da aplicação (white screen).

**Solução:** Envolvemos a chamada em uma IIFE async:
```typescript
(async () => {
    const params = mapStateToJmuParams(state, orgSlug);
    const result = await agencyService.calculateTotal(params);
    // ...
})();
```

**Arquivos Modificados:**
- `src/hooks/calculator/useCalculatorResults.ts`

### 2. ✅ Slug Hardcoded em Todos os Módulos (CRÍTICO)
**Problema:** Todos os módulos de cálculo tinham o slug `'jmu'` hardcoded, então mesmo selecionando PJU, buscava configuração do JMU (que está vazia).

**Solução Implementada:**
1. Adicionamos campo `orgSlug: string` à interface `IJmuCalculationParams`
2. Atualizamos `mapStateToJmuParams` para aceitar `orgSlug` como segundo parâmetro
3. Passamos o `agency` object através da cadeia: `useCalculator` → `useCalculatorResults` → `mapStateToJmuParams`
4. Atualizamos TODOS os módulos de cálculo para usar `params.orgSlug`:
   - `baseCalculations.ts` - `getDataForPeriod(params.periodo, params.orgSlug)`
   - `benefitsCalculations.ts` - Tornamos async e passamos orgSlug
   - `vacationCalculations.ts` - `getEffectiveConfig(params.orgSlug)`
   - `thirteenthCalculations.ts` - `getEffectiveConfig(params.orgSlug)`
   - `overtimeCalculations.ts` - `getEffectiveConfig(params.orgSlug)`
   - `substitutionCalculations.ts` - Tornamos async e passamos orgSlug
   - `leaveCalculations.ts` - `getEffectiveConfig(params.orgSlug)`
   - `deductionsCalculations.ts` - `getEffectiveConfig(params.orgSlug)`

**Arquivos Modificados (10 arquivos):**
- `src/services/agency/implementations/jmu/types.ts`
- `src/services/agency/adapters/stateToParams.ts`
- `src/hooks/calculator/useCalculatorResults.ts`
- `src/hooks/useCalculator.ts`
- `src/services/agency/implementations/JmuService.ts`
- `src/services/agency/implementations/jmu/modules/baseCalculations.ts`
- `src/services/agency/implementations/jmu/modules/benefitsCalculations.ts`
- `src/services/agency/implementations/jmu/modules/vacationCalculations.ts`
- `src/services/agency/implementations/jmu/modules/thirteenthCalculations.ts`
- `src/services/agency/implementations/jmu/modules/overtimeCalculations.ts`
- `src/services/agency/implementations/jmu/modules/substitutionCalculations.ts`
- `src/services/agency/implementations/jmu/modules/leaveCalculations.ts`
- `src/services/agency/implementations/jmu/modules/deductionsCalculations.ts`

### 3. ✅ Dados Faltando no Banco (PARCIAL)
**Problema:** Tabelas `agencies` e `courts` estavam vazias para PJU.

**Solução Aplicada:**
- ✅ Inserimos registro do PJU na tabela `agencies`
- ✅ Inserimos registro do PJU na tabela `courts` com configuração completa

**SQL Executado:**
```sql
-- Agencies
INSERT INTO agencies (slug, name, type, is_active)
VALUES ('pju', 'Poder Judiciário da União', 'JUDICIARY', true)
ON CONFLICT (slug) DO NOTHING;

-- Courts (com config completa)
INSERT INTO courts (slug, name, power, sphere, visible, config)
VALUES ('pju', 'Poder Judiciário da União', 'Judiciário', 'Federal', true, {...})
ON CONFLICT (slug) DO UPDATE SET config = EXCLUDED.config;
```

### 4. ⚠️ Problema Pendente: Tabela `org_config` Vazia
**Status:** IDENTIFICADO, NÃO RESOLVIDO

**Problema:** O código busca configurações de `org_config`, mas essa tabela está vazia para `pju` e `jmu`. Por isso, mesmo com todas as correções de código, o cálculo ainda retorna apenas benefícios (R$ 1.784,42 = Auxílio Alimentação).

**Erro no Console:**
```
PGRST116 - 0 rows returned for query: org_config?org_slug=eq.pju
```

**Próximos Passos Necessários:**
1. Verificar estrutura da tabela `org_config` na migração
2. Popular `org_config` com dados das agências (PJU, JMU, STM)
3. Garantir que os dados incluem:
   - Bases salariais (analista/técnico)
   - Funções comissionadas
   - Valores de benefícios
   - Configurações específicas da agência

## Estado Atual da Aplicação

### ✅ Funcionando
- Interface carrega sem crash
- Navegação entre agências (PJU, JMU, STM)
- Dropdowns populados corretamente
- Benefícios calculados (Auxílio Alimentação)
- Service mapping correto (PJU usa JmuService)

### ❌ Não Funcionando
- Vencimento Básico = R$ 0,00
- GAJ = R$ 0,00
- Funções Comissionadas = R$ 0,00
- Resultado Líquido = apenas benefícios

**Causa:** Tabela `org_config` vazia

## Estrutura de Dados Necessária

### Hierarquia de Configuração
```
global_config (Federal)
    ├── PSS tables
    ├── IR tables
    └── Deduções de dependentes

power_config (Poder - PJU)
    ├── Bases salariais
    ├── Gratificações
    └── CJ1 integral base

org_config (Órgão - JMU, STM, etc)
    └── Configurações específicas do órgão
```

## Arquivos de Referência

### Migrações Executadas
- ✅ `001_create_agency_schema.sql` - Estrutura base
- ✅ `002_migrate_hardcoded_data.sql` - Dados do PJU

### Dados Inseridos Manualmente
- Via SQL Editor do Supabase:
  - `agencies` table: registro PJU
  - `courts` table: registro PJU com config completa

## Comandos Git Executados (Final)

```bash
# Sincronização Completa (Add All + Leletions)
git add .
git commit -m "chore: full sync - add config service, docs and remove obsolete files"
git push origin main
```

**Status:** ✅ Sincronizado (Local == Remote)

## Próxima Sessão - Checklist

### Alta Prioridade
- [ ] Investigar estrutura da tabela `org_config`
- [ ] Popular `org_config` com dados do PJU
- [ ] Popular `org_config` com dados do JMU
- [ ] Popular `org_config` com dados do STM
- [ ] Testar cálculo completo para Analista A1 (esperado: ~R$ 15.000+)

### Média Prioridade
- [ ] Verificar se `power_config` tem todos os dados necessários
- [ ] Validar hierarquia de configuração (global → power → org)
- [ ] Testar mudança de níveis (A1 → C13)
- [ ] Testar diferentes períodos salariais

### Baixa Prioridade
- [ ] Corrigir erros de lint (React namespace)
- [ ] Documentar estrutura de dados no README
- [ ] Criar testes unitários para cálculos

## Métricas da Sessão

- **Duração:** ~2 horas
- **Arquivos Modificados:** 13
- **Bugs Críticos Resolvidos:** 2
- **Bugs Pendentes:** 1
- **Linhas de Código Alteradas:** ~150
- **Build Status:** ✅ APROVADO (npm run build passou localmente em 5.6s)
- **Commits Preparados:** 1

## Notas Técnicas

### Padrão Async/Await
Todos os módulos de cálculo que chamam `getDataForPeriod` ou `getEffectiveConfig` agora são `async` e retornam `Promise`. Isso é necessário porque o ConfigService busca dados do Supabase de forma assíncrona.

### Propagação do orgSlug
O slug da agência agora flui através de toda a cadeia:
```
URL (/simulador/pju)
  ↓
useCalculatorConfig (carrega agency)
  ↓
useCalculator (passa agency)
  ↓
useCalculatorResults (extrai slug)
  ↓
mapStateToJmuParams (adiciona ao params)
  ↓
JmuService.calculateTotal
  ↓
Módulos de cálculo (usam params.orgSlug)
  ↓
ConfigService.getEffectiveConfig(orgSlug)
```

### Estrutura de Configuração
O sistema usa 3 níveis de configuração que são mesclados:
1. **Global** - Regras federais (PSS, IR)
2. **Power** - Regras do poder (PJU - bases salariais)
3. **Org** - Regras do órgão (JMU, STM - específicas)

Atualmente, apenas os níveis Global e Power estão populados.
