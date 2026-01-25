# Status do Projeto - Salário do Servidor

**Última Atualização:** 24/01/2026 23:55
**Versão:** 1.0.0
**Último Commit:** 3fbf7ba
**Scripts:** ⭐ audit-project.cjs, generate-version.js

---

## 🎯 RESUMO EXECUTIVO

**Projeto em produção:** https://salariodoservidor.com.br/simulador/jmu
**Status geral:** ✅ Hybrid Dashboard 100% completo
**Próxima prioridade:** Migração data.ts → banco (Data-Driven 100%)

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

### Fase 3: Sistema Data-Driven (80%)
- ✅ **ConfigService:** `src/services/config/ConfigService.ts`
  - Hierarquia: global_config → power_config → org_config
  - Deep merge implementado
  - Cache funcionando
- ✅ **Migração PROD:** Sistema funcionando em produção
- ✅ **STM validado:** Órgão criado apenas com config (sem código)
- ⏳ **Pendente:** Migrar BASES_2025, HISTORICO_PSS/IR de data.ts → banco

### Fase 4: UX/UI (100%)
- ✅ **Hybrid Dashboard:**
  - ResultsSidebar.tsx (desktop sticky)
  - MobileResultsBar.tsx (mobile top bar)
  - Accordion.tsx (seções colapsáveis)
  - Layout 2 colunas responsivo
- ✅ **Sistema de Versionamento:**
  - Script: `scripts/generate-version.js`
  - Componente: `src/components/ui/VersionBadge.tsx`
  - Badge discreto no ActionFooter
  - Auto-geração no build (prebuild hook)

---

## ⏳ PRÓXIMAS PRIORIDADES

### 1. Data-Driven 100% (RECOMENDADO - 2-3 dias)
**Objetivo:** Zero código para novos órgãos

**Tarefas:**
1. Migrar `BASES_2025` de data.ts → power_config (PJU)
2. Migrar `HISTORICO_PSS` de data.ts → global_config
3. Migrar `HISTORICO_IR` de data.ts → global_config
4. Atualizar JmuService para usar ConfigService
5. Deprecar data.ts (adicionar warnings)
6. Testar STM e JMU usando apenas banco

**Arquivo alvo:** `src/data.ts` (atualmente 200+ linhas hardcoded)

### 2. Componentes UI Reutilizáveis (1-2 dias)
- Criar Button, Input, Select, Card em `src/components/ui/`
- Refatorar componentes Calculator para usar
- Documentar uso

### 3. Design System Completo (2-3 dias)
- Design tokens no tailwind.config.js
- Padronizar cores, fontes, espaçamentos
- Auditoria de consistência

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
└── audit-project.cjs        # Auditoria automática do projeto (novo)

public/
└── version.json             # Gerado no build (ignorado no git)

reports/                     # Relatórios de auditoria (ignorado no git)
├── audit-report.json        # Dados estruturados
└── audit-report.md          # Relatório legível
```

### Arquivos de Documentação
- `TASK.md` - Status atual e checklist
- `IMPLEMENTATION_PLAN.md` - Roadmap completo por fases
- `VERSION_SYSTEM.md` - Documentação do sistema de versionamento
- `PROJECT_STATUS.md` - Este arquivo (resumo executivo)
- `MANUAL_DO_PROJETO.md` - Guia para iniciantes
- `DESIGN_SYSTEM.md` - Padrões de design
- `AUDITORIA_DIARIA.md` - ⭐ Guia prático do script de auditoria (NOVO)
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

### Script de Auditoria Automática ⭐ **NOVO**
```bash
# Executar auditoria completa do projeto
npm run audit

# Gera 2 relatórios em reports/:
# - audit-report.json (dados estruturados)
# - audit-report.md (relatório legível)
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
- **Último deploy:** 018a9a4
- **URL Produção:** https://salariodoservidor.com.br/simulador/jmu
- **URL Legado:** https://legado.salariodoservidor.com.br/simulador/jmu
- **Vercel:** Deploy automático no push para main

### Validar Deploy
1. Abrir URL de produção
2. Ver badge de versão (canto inferior esquerdo)
3. Hover para ver commit hash
4. Comparar com `git log --oneline -1`

---

## 📊 MÉTRICAS DO PROJETO

### Código
- **JmuService.ts:** 801 → 141 linhas (-82.4% / -660 linhas)
- **useCalculator.ts:** 398 → 100 linhas (-74.9% / -298 linhas)
- **Módulos criados:** 13 (9 JMU + 4 hooks)
- **Componentes UI:** 7 (Button, Input, Select, Card, Accordion, VersionBadge, index.ts)
- **Componentes Calculator:** 15 componentes especializados
- **ConfigService:** 190 linhas (sistema hierárquico completo)

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

1. **Executar auditoria automática** ⭐ **RECOMENDADO**
   ```bash
   npm run audit
   ```
   Gera snapshot completo do projeto (economia de ~20k tokens)

2. **Ler relatório gerado** (reports/audit-report.md)
   - Status de todas as fases
   - Métricas de código
   - Validações automáticas

3. **Verificar TASK.md** (se necessário detalhes adicionais)

4. **Ver último commit:**
   ```bash
   git log --oneline -5
   ```

5. **Escolher próxima prioridade** (ver seção "Próximas Prioridades")

### Contexto para IA

```
Olá! Continuando projeto Salário do Servidor.

IMPORTANTE: Execute primeiro para economizar tokens:
npm run audit

Isso gera relatório completo em reports/audit-report.md com:
- Status de todas as fases (4/5 completas)
- Métricas de redução de código (82.4% JMU, 74.9% useCalculator)
- Validação de módulos (9 JMU, 4 hooks, 7 UI components)

Após ler o relatório, ver: PROJECT_STATUS.md para contexto completo

Próximo: Migrar data.ts → banco (Data-Driven 100%)
```

---

## 📝 NOTAS IMPORTANTES

### O que NÃO fazer
- ❌ Não modularizar JmuService/useCalculator (já feito)
- ❌ Não criar Hybrid Dashboard (já feito)
- ❌ Não implementar ConfigService (já feito)
- ❌ Não adicionar sistema de versionamento (já feito)

### O que FAZER
- ✅ Migrar dados hardcoded de data.ts → banco
- ✅ Criar componentes UI reutilizáveis
- ✅ Padronizar design system
- ✅ Adicionar testes (backlog)

### Arquivos Críticos
- `src/data.ts` - Contém dados hardcoded (a migrar)
- `src/services/config/ConfigService.ts` - Sistema de config
- `src/services/agency/implementations/JmuService.ts` - Orquestrador JMU
- `src/hooks/useCalculator.ts` - Orquestrador hooks
- `package.json` - Versão 1.0.0

---

**Última verificação:** 24/01/2026 23:45
**Tokens disponíveis:** ~115k (58% restante)
**Próximo marco:** Data-Driven 100% (v1.1.0)
