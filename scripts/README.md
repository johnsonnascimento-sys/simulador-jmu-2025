# Scripts do Projeto

Scripts utilitários para automação de tarefas no projeto Salário do Servidor.

---

## 📊 audit-project.cjs

**Comando:** `npm run audit`

### O que faz

Script de auditoria automática que analisa o estado completo do projeto e gera relatórios detalhados.

### Saída

Gera 2 arquivos em `reports/`:
- **audit-report.json** - Dados estruturados (útil para parsing automático)
- **audit-report.md** - Relatório legível em Markdown

### O que analisa

✅ **Arquivos principais:**
- JmuService.ts (linhas, validação)
- useCalculator.ts (linhas, validação)
- ConfigService.ts (existência, linhas)
- data.ts (linhas, status de depreciação)
- Calculator.tsx (linhas)

✅ **Diretórios e módulos:**
- 9 módulos JMU em `jmu/modules/`
- 4 hooks calculator em `hooks/calculator/`
- 7+ componentes UI em `components/ui/`
- 15 componentes Calculator
- 4 arquivos ConfigService

✅ **Métricas de redução:**
- JmuService: 801 → 141 linhas (-82.4%)
- useCalculator: 398 → 100 linhas (-74.9%)

✅ **Validação de fases:**
- Fase 1.1: Modularizar JmuService
- Fase 1.2: Modularizar useCalculator
- Fase 1.3: Componentes UI reutilizáveis
- Fase 3.1: ConfigService
- Fase 3.3: Migração data.ts

✅ **Informações Git:**
- Branch atual
- Último commit (hash + mensagem)
- Git status (arquivos modificados/não-versionados)

### Quando usar

✅ **Início de cada sessão** - Obter snapshot instantâneo do projeto
✅ **Após mudanças estruturais** - Validar que tudo está correto
✅ **Para economizar tokens** - Em vez de ler múltiplos arquivos manualmente
✅ **Gerar relatórios de progresso** - Para documentação

### Exemplo de uso

```bash
# Executar auditoria
npm run audit

# Ver relatório
cat reports/audit-report.md

# Ver dados estruturados
cat reports/audit-report.json
```

### Exit codes

- **0** - Todas as validações críticas passaram
- **1** - Alguma validação crítica falhou

Validações críticas:
- JmuService ≤ 200 linhas
- useCalculator ≤ 200 linhas
- 9 módulos JMU presentes
- 4 hooks calculator presentes

---

## 🏷️ generate-version.js

**Comando:** `npm run prebuild` (executa automaticamente antes de `npm run build`)

### O que faz

Gera arquivo `public/version.json` com informações da versão atual do projeto baseado em Git.

### Saída

Arquivo `public/version.json`:
```json
{
  "version": "1.0.0",
  "commit": "3fbf7ba",
  "branch": "main",
  "buildDate": "2026-01-24T23:45:00.000Z"
}
```

### Quando executar

✅ **Automaticamente no build** - Hook `prebuild` já configurado
✅ **Manualmente para debug** - `node scripts/generate-version.js`

### Usado por

- **VersionBadge.tsx** - Mostra badge de versão no footer

---

## 📝 Adicionando novos scripts

### Convenções

1. **Extensão:**
   - `.cjs` para CommonJS (require/module.exports)
   - `.mjs` para ES Modules (import/export)
   - `.js` segue o `"type"` do package.json (atualmente "module")

2. **Shebang:**
   ```javascript
   #!/usr/bin/env node
   ```

3. **Documentação:**
   - Cabeçalho com descrição e uso
   - Comentários em seções principais
   - Adicionar ao package.json scripts
   - Documentar neste README

4. **Outputs:**
   - Relatórios em `reports/` (gitignored)
   - Arquivos temporários em `.cache/` ou `.tmp/` (gitignored)
   - Assets gerados em `public/` (comitados se necessário)

### Exemplo de template

```javascript
#!/usr/bin/env node

/**
 * Nome do Script
 *
 * Descrição do que faz
 *
 * Uso:
 *   node scripts/nome-do-script.cjs [args]
 *   npm run script-name
 */

const fs = require('fs');
const path = require('path');

function main() {
  try {
    // Lógica aqui
    console.log('✅ Script executado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { /* exports */ };
```

---

**Última atualização:** 24/01/2026
