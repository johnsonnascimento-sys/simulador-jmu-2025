# Status do Projeto - Salário do Servidor

**Última Atualização:** 25/01/2026 13:30
**Versão:** 1.1.0
**Último Commit:** 7b07b90
**Scripts:** ⭐ audit-project.cjs, audit-design-system.cjs, generate-version.js, verify-migration.js

---

## 🎯 RESUMO EXECUTIVO

**Projeto em produção:** https://salariodoservidor.com.br/simulador/jmu
**Status geral:** ✅ Sistema 100% Data-Driven + Design System Completo!
**Próxima prioridade:** Refatoração para usar tokens do Design System

---

## ✅ FASES COMPLETAS

### Fase 1: Modularização (100%)
- ✅ **JmuService.ts:** 801 → 140 linhas
  - Localização: `src/services/agency/implementations/JmuService.ts`
  - 9 módulos em `jmu/modules/`:
    - baseCalculations.ts
    - benefitsCalculations.ts
    - vacationCalculations.ts
    - thirteenthCalculations.ts
    - overtimeCalculations.ts
    - substitutionCalculations.ts
    - dailiesCalculations.ts
    - leaveCalculations.ts
    - deductionsCalculations.ts

- ✅ **useCalculator.ts:** 398 → 99 linhas
  - Localização: `src/hooks/useCalculator.ts`
  - 4 hooks especializados em `hooks/calculator/`:
    - useCalculatorConfig.ts
    - useCalculatorExport.ts
    - useCalculatorResults.ts
    - useCalculatorState.ts

### Fase 3: Sistema Data-Driven (100%) ✨
- ✅ **ConfigService:** `src/services/config/ConfigService.ts`
  - Hierarquia: global_config → power_config → org_config
  - Deep merge implementado
  - Cache funcionando
- ✅ **Migração PROD:** Sistema funcionando em produção
- ✅ **STM validado:** Órgão criado apenas com config (sem código)
- ✅ **Migration SQL:** BASES_2025, HISTORICO_PSS/IR migrados para banco
- ✅ **Módulos JMU:** Todos os 9 módulos usam ConfigService
- ✅ **Data.ts:** Deprecated (mantido apenas como fallback)

### Fase 4: UX/UI (100%)
- ✅ **Hybrid Dashboard:**
  - ResultsSidebar.tsx (desktop sticky)
  - MobileResultsBar.tsx (mobile bottom bar - movida de top para bottom)
  - Accordion.tsx (seções colapsáveis)
  - Layout 2 colunas responsivo
- ✅ **Sistema de Versionamento:**
  - Script: `scripts/generate-version.js`
  - Componente: `src/components/ui/VersionBadge.tsx`
  - Badge discreto no ActionFooter e MobileResultsBar
  - Auto-geração no build (prebuild hook)
- ✅ **Design System Completo:**
  - tailwind.config.js: 58 → 373 linhas com tokens completos
  - 7 famílias de cores × 11 tonalidades (primary, secondary, neutral, success, warning, error, info)
  - Sistema tipográfico semântico (display, headings, body, labels)
  - Z-index organizado, animações, transições
  - DESIGN_SYSTEM.md: Documentação completa (800+ linhas)
  - Script: `scripts/audit-design-system.cjs`
  - Health Score inicial: 60.5/100 (679 violações em 29 arquivos)

---

## ⏳ PRÓXIMAS PRIORIDADES

### 1. Migração slate → neutral (URGENTE - Health Score Impact)
**Objetivo:** Substituir cores deprecated por tokens do Design System

**Impacto:** 223 violações (maior categoria)

**Tarefas:**
1. Buscar e substituir `slate-` por `neutral-` em todos os componentes
2. Validar visualmente em ambos os modos (light/dark)
3. Re-executar audit:design para verificar melhoria

**Benefício:** +15-20 pontos no Health Score

### 2. Tokens Semânticos de Tipografia (RECOMENDADO)
**Objetivo:** Substituir classes genéricas por tokens semânticos

**Impacto:** 206 violações

**Tarefas:**
1. Substituir `text-xs`, `text-sm`, `text-lg` por `text-body`, `text-label`, `text-h*`
2. Garantir consistência de line-height (já incluído nos tokens)
3. Documentar padrões de uso por contexto

**Benefício:** +10-15 pontos no Health Score, melhor manutenibilidade

### 3. Migração de Cores Hardcoded (IMPORTANTE)
**Objetivo:** Usar design tokens em vez de cores diretas

**Impacto:** 250 violações

**Tarefas:**
1. Substituir `blue-600`, `indigo-500`, etc. por `secondary`, `primary`
2. Usar cores semânticas (`success`, `error`, `warning`) onde apropriado
3. Validar contraste e acessibilidade

**Benefício:** +20-25 pontos no Health Score, consistência visual

---

## 📁 ESTRUTURA DO PROJETO

### Principais Diretórios
```
src/
├── components/
│   ├── Calculator/          # Componentes da calculadora
│   │   ├── ActionFooter.tsx  # Footer fixo com VersionBadge
│   │   ├── ResultsSidebar.tsx # Sidebar desktop
│   │   ├── MobileResultsBar.tsx # Top bar mobile
│   │   └── ...
│   └── ui/                  # Componentes reutilizáveis
│       ├── Accordion.tsx
│       └── VersionBadge.tsx
├── hooks/
│   ├── useCalculator.ts     # 99 linhas (orquestrador)
│   └── calculator/          # Hooks especializados
├── services/
│   ├── agency/
│   │   └── implementations/
│   │       ├── JmuService.ts  # 140 linhas (orquestrador)
│   │       └── jmu/modules/   # 9 módulos de cálculo
│   └── config/
│       ├── ConfigService.ts   # Sistema hierárquico
│       ├── types.ts
│       └── mergeConfig.ts
├── pages/
│   └── Calculator.tsx       # Layout 2 colunas + mobile bar
└── data.ts                  # ⚠️ A DEPRECAR (hardcoded data)

scripts/
├── generate-version.js      # Geração automática de versão
├── audit-project.cjs        # Auditoria automática do projeto
└── audit-design-system.cjs  # ⭐ Auditoria de Design System (NOVO)

public/
└── version.json             # Gerado no build (ignorado no git)

reports/                     # Relatórios de auditoria (ignorado no git)
├── audit-report.json        # Dados estruturados (projeto)
├── audit-report.md          # Relatório legível (projeto)
├── design-audit-report.json # ⭐ Dados estruturados (design) (NOVO)
└── design-audit-report.md   # ⭐ Relatório legível (design) (NOVO)
```

### Arquivos de Documentação
- `TASK.md` - Status atual e checklist
- `IMPLEMENTATION_PLAN.md` - Roadmap completo por fases
- `VERSION_SYSTEM.md` - Documentação do sistema de versionamento
- `PROJECT_STATUS.md` - Este arquivo (resumo executivo)
- `MANUAL_DO_PROJETO.md` - Guia para iniciantes
- `DESIGN_SYSTEM.md` - Padrões de design
- `DATA_DRIVEN_MIGRATION.md` - ⭐ Guia completo da migração Data-Driven (NOVO)
- `AUDITORIA_DIARIA.md` - Guia prático do script de auditoria
- `AUDIT_SCRIPT.md` - Documentação técnica do script de auditoria
- `scripts/README.md` - Documentação de scripts utilitários

---

## 🔧 COMANDOS ÚTEIS

### Desenvolvimento
```bash
npm run dev              # Servidor local (localhost:5173)
npm run build            # Build de produção (gera version.json)
npm run preview          # Preview do build
```

### Git
```bash
git status               # Ver mudanças
git add .                # Adicionar tudo
git commit -m "msg"      # Commit
git push origin main     # Deploy automático
```

### Scripts de Auditoria ⭐
```bash
# Auditoria completa do projeto (estrutura, módulos, métricas)
npm run audit

# Gera em reports/:
# - audit-report.json (dados estruturados)
# - audit-report.md (relatório legível)

# Auditoria de Design System (violações visuais) ⭐ **NOVO**
npm run audit:design

# Gera em reports/:
# - design-audit-report.json (violações por tipo)
# - design-audit-report.md (relatório com sugestões)
# Health Score: 60.5/100 (baseline atual)
```

**O que o script faz:**
- ✅ Conta linhas de arquivos principais
- ✅ Lista todos os módulos JMU (9)
- ✅ Lista todos os hooks calculator (4)
- ✅ Lista componentes UI criados
- ✅ Valida fases do IMPLEMENTATION_PLAN
- ✅ Calcula métricas de redução de código
- ✅ Mostra git status e último commit
- ✅ Gera relatórios JSON + Markdown

**Benefícios:**
- 🚀 **Zero tokens** - não precisa ler múltiplos arquivos
- 📊 **Snapshot instantâneo** - estado completo do projeto em 1 comando
- 📈 **Métricas automáticas** - JmuService 82.4% reduzido, useCalculator 74.9%
- ✅ **Validação de fases** - 4/5 completas automaticamente

**Quando usar:**
- Início de cada sessão (ao invés de ler vários arquivos)
- Após mudanças estruturais
- Para validar se fases estão completas
- Para gerar relatórios de progresso

### Verificações Rápidas (Manual - use npm run audit em vez disso)
```bash
# Contar linhas de arquivos principais
wc -l src/services/agency/implementations/JmuService.ts
wc -l src/hooks/useCalculator.ts

# Listar módulos JMU
ls src/services/agency/implementations/jmu/modules/

# Listar hooks calculator
ls src/hooks/calculator/

# Ver versão atual
cat package.json | grep version
```

---

## 🚀 DEPLOY

### Status Atual
- **Último deploy:** 7b07b90
- **URL Produção:** https://salariodoservidor.com.br/simulador/jmu
- **URL Legado:** https://legado.salariodoservidor.com.br/simulador/jmu
- **Vercel:** Deploy automático no push para main

### Validar Deploy
1. Abrir URL de produção
2. Ver badge de versão (canto inferior direito desktop / expandido mobile)
3. Hover para ver commit hash
4. Comparar com `git log --online -1`

---

## 📊 MÉTRICAS DO PROJETO

### Código
- **JmuService.ts:** 801 → 141 linhas (-82.4% / -660 linhas)
- **useCalculator.ts:** 398 → 100 linhas (-74.9% / -298 linhas)
- **tailwind.config.js:** 58 → 373 linhas (+543% - Design System completo)
- **DESIGN_SYSTEM.md:** 316 → 800+ linhas (documentação completa)
- **Módulos criados:** 13 (9 JMU + 4 hooks)
- **Componentes UI:** 7 (Button, Input, Select, Card, Accordion, VersionBadge, index.ts)
- **Componentes Calculator:** 15 componentes especializados
- **ConfigService:** 190 linhas (sistema hierárquico completo)

### Design System
- **Famílias de cores:** 7 (primary, secondary, neutral, success, warning, error, info)
- **Tonalidades por família:** 11 (50-950)
- **Tokens tipográficos:** 23 (display, headings, body, labels)
- **Z-index semânticos:** 8 camadas organizadas
- **Animações:** 3 (fade-in, slide-up, slide-down)
- **Health Score atual:** 60.5/100 (baseline)
- **Violações detectadas:** 679 em 29 arquivos
  - Cores hardcoded: 250
  - Deprecated slate: 223
  - Tipografia não-semântica: 206

### UX
- **Redução de scroll:** 60%
- **Cards visíveis:** 10+ → 4 + 3 accordions
- **Feedback:** Imediato (sidebar sempre visível)

---

## 🔍 TROUBLESHOOTING

### Build falha
```bash
# Regenerar version.json
node scripts/generate-version.js

# Limpar e rebuildar
rm -rf dist
npm run build
```

### Badge de versão não aparece
```bash
# Verificar se version.json existe
ls public/version.json

# Verificar se está no build
ls dist/version.json
```

### ConfigService não funciona
```bash
# Verificar estrutura do banco
# Tabelas: global_config, power_config, org_config
# Ver: src/services/config/ConfigService.ts
```

---

## 🎯 PRÓXIMA SESSÃO

### Como Retomar

1. **Executar auditorias** ⭐ **RECOMENDADO**
   ```bash
   npm run audit          # Estrutura e métricas
   npm run audit:design   # Violações de Design System
   ```
   Gera snapshots completos (economia de ~20k tokens)

2. **Ler relatórios gerados**
   - `reports/audit-report.md` - Status de fases e métricas
   - `reports/design-audit-report.md` - Violações e sugestões (Health Score: 60.5/100)

3. **Verificar PROJECT_STATUS.md** para contexto completo

4. **Ver últimos commits:**
   ```bash
   git log --oneline -5
   ```

5. **Escolher próxima prioridade** (ver seção "Próximas Prioridades")

### Contexto para IA

```
Olá! Continuando projeto Salário do Servidor.

IMPORTANTE: Execute primeiro para economizar tokens:
npm run audit && npm run audit:design

Relatórios gerados:
- reports/audit-report.md: Fases 1-4 completas (100%)
- reports/design-audit-report.md: Health Score 60.5/100

Estado atual:
- ✅ Sistema Data-Driven 100%
- ✅ Design System completo (tokens, documentação, auditoria)
- ⏳ Health Score 60.5/100 (679 violações)

Próximo: Migração slate→neutral (223 violações, +15-20 pontos no score)
Ver: PROJECT_STATUS.md seção "Próximas Prioridades"
```

---

## 📝 NOTAS IMPORTANTES

### O que NÃO fazer
- ❌ Não modularizar JmuService/useCalculator (já feito - Fase 1)
- ❌ Não criar Hybrid Dashboard (já feito - Fase 4)
- ❌ Não implementar ConfigService (já feito - Fase 3)
- ❌ Não adicionar sistema de versionamento (já feito - Fase 4)
- ❌ Não criar design tokens/documentação (já feito - Fase 4)

### O que FAZER
- 🎯 **Migrar slate → neutral** (223 violações, maior impacto)
- 🎯 **Tokens semânticos de tipografia** (206 violações)
- 🎯 **Substituir cores hardcoded** (250 violações)
- ✅ Migrar dados hardcoded de data.ts → banco (quando necessário)
- ✅ Adicionar testes (backlog)

### Arquivos Críticos
- `tailwind.config.js` - 373 linhas de design tokens
- `DESIGN_SYSTEM.md` - 800+ linhas de documentação
- `src/data.ts` - Contém dados hardcoded (a migrar eventualmente)
- `src/services/config/ConfigService.ts` - Sistema de config
- `src/services/agency/implementations/JmuService.ts` - Orquestrador JMU
- `src/hooks/useCalculator.ts` - Orquestrador hooks
- `scripts/audit-design-system.cjs` - Auditoria de consistência visual

---

**Última verificação:** 25/01/2026 13:30
**Versão:** 1.1.0
**Health Score:** 60.5/100 (baseline - melhorar para 90+)
**Próximo marco:** Refatoração para tokens do Design System
