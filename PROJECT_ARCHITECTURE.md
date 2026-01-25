# Project Architecture - Salario do Servidor (v2.0)
Atualizado em: 25/01/2026

## 1. Visao Geral
Arquitetura modular, data-driven e multi-tenancy para simulacao de holerites.
O fluxo principal parte da UI, carrega configuracoes remotas e executa calculos
em modulos isolados, sem valores hardcoded.

## 2. Camadas Principais

### 2.1 Interface (React + Vite)
- `src/pages/Calculator.tsx`: orquestra o layout e integra cards e resultados.
- `src/components/Calculator/`: componentes estruturais (Header, GlobalSettings,
  Results, Observations, Deductions).
- `src/components/Calculator/cards/`: cards atomicos (VacationCard, ThirteenthCard,
  SubstitutionCard, OvertimeCard, DailiesCard, LicenseCard, FoodAllowanceCard,
  PreschoolCard).

### 2.2 Estado e Orquestracao
- `src/hooks/useCalculator.ts`: estado central da calculadora.
- `src/hooks/calculator/useCalculatorResults.ts`: executa calculos e atualiza o estado.
- `src/services/agency/adapters/stateToParams.ts`: converte estado para params do motor.

### 2.3 Motor de Calculo (JMU)
- `src/services/agency/implementations/JmuService.ts`: orquestra os calculos.
- `src/services/agency/implementations/jmu/modules/`: calculos por dominio
  (base, beneficios, ferias, 13o, HE, substituicao, diarias, licenca, deducoes).
- Todos os modulos usam `params.agencyConfig` (nao usam data.ts).

### 2.4 Configuracao e Multi-Tenancy
- `src/services/config/ConfigService.ts`: carrega config do Supabase e faz deep merge
  (global -> power -> org) gerando a `EffectiveConfig`.
- `src/services/config/mapEffectiveConfig.ts`: adapta para `CourtConfig` usado na UI.
- `src/services/courtService.ts`: fallback legado (courts table) quando necessario.

### 2.5 Painel Administrativo (Admin)
- `src/services/admin/AdminService.ts`: CRUD das tabelas `global_config`, `power_config`, `org_config`.
- `src/types/admin.ts`: tipos de registros e DTOs para o admin.
- `src/components/Admin/JsonEditor.tsx`: editor JSON simples com validacao.
- `src/components/Admin/ConfigTable.tsx`: tabela generica de configuracoes.
- Paginas protegidas: `AdminHub`, `AdminGlobal`, `AdminPower`, `AdminOrg`.
- Rotas: `/admin`, `/admin/global`, `/admin/power`, `/admin/org`.

### 2.6 Utils e Calculos Comuns
- `src/utils/calculations.ts`: helpers (IR, PSS, reajustes e tabelas por periodo).
- `src/core/calculations/`: funcoes puras para calculos tributarios.

## 3. Fluxo de Dados (Alto Nivel)
1) UI escolhe orgao (slug) e periodo.
2) `ConfigService` carrega configuracoes do banco e faz merge.
3) `mapEffectiveConfigToCourtConfig` converte para formato consumido pela UI.
4) `useCalculatorResults` mapeia estado -> params e chama `JmuService`.
5) `JmuService` executa modulos e retorna breakdown completo.
6) UI renderiza resultados e cards.

## 4. Principios de Design
- Data-Driven: regras no banco (global/power/org).
- Modularizacao: calculos isolados por dominio.
- Atomizacao: UI em cards independentes.
- Multi-Tenancy: configs por orgao, poder e esfera.

## 5. Pontos de Extensao
- Novo orgao: adicionar em `org_config` e mapear slug.
- Nova carreira/poder: adicionar em `power_config`.
- Novas regras globais: adicionar em `global_config`.
- Seeds e historico: usar scripts em `supabase/seeds/` (ex: regras AQ e bases PJU).

## 6. Seeds e Dados Iniciais
- `supabase/seeds/001_seed_pju_data.sql`: dados base (PJU 2025).
- `supabase/seeds/002_update_pju_aq_rules.sql`: historico de AQ (pre-2026 e 2026+).
