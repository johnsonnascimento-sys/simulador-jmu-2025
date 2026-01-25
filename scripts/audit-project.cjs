#!/usr/bin/env node

/**
 * Script de Auditoria do Projeto - Salário do Servidor
 *
 * Analisa automaticamente a estrutura do projeto e gera relatórios
 * JSON + Markdown com métricas, validações e status atual.
 *
 * Uso:
 *   node scripts/audit-project.js
 *   npm run audit
 *
 * Saída:
 *   - reports/audit-report.json (dados estruturados)
 *   - reports/audit-report.md (relatório legível)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ==================== CONFIGURAÇÃO ====================

const PROJECT_ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports');

// Arquivos principais a auditar
const KEY_FILES = {
  jmuService: 'src/services/agency/implementations/JmuService.ts',
  useCalculator: 'src/hooks/useCalculator.ts',
  configService: 'src/services/config/ConfigService.ts',
  dataTs: 'src/data.ts',
  calculatorPage: 'src/pages/Calculator.tsx',
};

// Diretórios a auditar
const KEY_DIRECTORIES = {
  jmuModules: 'src/services/agency/implementations/jmu/modules',
  calculatorHooks: 'src/hooks/calculator',
  uiComponents: 'src/components/ui',
  calculatorComponents: 'src/components/Calculator',
  configService: 'src/services/config',
};

// Expectativas baseadas no IMPLEMENTATION_PLAN.md
const EXPECTATIONS = {
  jmuService: { maxLines: 200, target: 140 },
  useCalculator: { maxLines: 200, target: 99 },
  jmuModulesCount: 9,
  calculatorHooksCount: 4,
  uiComponentsMin: 4, // Button, Input, Select, Card mínimo
};

// ==================== UTILIDADES ====================

/**
 * Conta linhas de um arquivo (excluindo vazias e comentários)
 */
function countLines(filePath) {
  try {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    // Linhas totais
    const total = lines.length;

    // Linhas não-vazias (código + comentários)
    const nonEmpty = lines.filter(line => line.trim() !== '').length;

    // Aproximação de linhas de código (excluindo comentários de linha)
    const codeLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed !== '' && !trimmed.startsWith('//') && !trimmed.startsWith('*');
    }).length;

    return { total, nonEmpty, codeLines };
  } catch (error) {
    return { total: 0, nonEmpty: 0, codeLines: 0, error: error.message };
  }
}

/**
 * Lista arquivos em um diretório
 */
function listFiles(dirPath, extension = '.ts') {
  try {
    const fullPath = path.join(PROJECT_ROOT, dirPath);
    if (!fs.existsSync(fullPath)) {
      return { files: [], count: 0, error: 'Directory not found' };
    }

    const files = fs.readdirSync(fullPath)
      .filter(f => f.endsWith(extension) || f.endsWith('.tsx'))
      .sort();

    return { files, count: files.length };
  } catch (error) {
    return { files: [], count: 0, error: error.message };
  }
}

/**
 * Executa comando git e retorna output
 */
function gitCommand(command) {
  try {
    return execSync(command, { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

/**
 * Obtém informações do Git
 */
function getGitInfo() {
  return {
    branch: gitCommand('git branch --show-current'),
    lastCommit: gitCommand('git log --oneline -1'),
    commitHash: gitCommand('git rev-parse --short HEAD'),
    status: gitCommand('git status --short'),
  };
}

/**
 * Lê versão do package.json
 */
function getPackageVersion() {
  try {
    const packagePath = path.join(PROJECT_ROOT, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Verifica se arquivo existe
 */
function fileExists(filePath) {
  return fs.existsSync(path.join(PROJECT_ROOT, filePath));
}

// ==================== AUDITORIA ====================

/**
 * Audita arquivos principais
 */
function auditKeyFiles() {
  const results = {};

  for (const [key, filePath] of Object.entries(KEY_FILES)) {
    const lines = countLines(filePath);
    const exists = fileExists(filePath);

    results[key] = {
      path: filePath,
      exists,
      ...lines,
    };

    // Validações específicas
    if (key === 'jmuService') {
      results[key].isValid = lines.total <= EXPECTATIONS.jmuService.maxLines;
      results[key].meetsTarget = lines.total <= EXPECTATIONS.jmuService.target;
    } else if (key === 'useCalculator') {
      results[key].isValid = lines.total <= EXPECTATIONS.useCalculator.maxLines;
      results[key].meetsTarget = lines.total <= EXPECTATIONS.useCalculator.target;
    }
  }

  return results;
}

/**
 * Audita diretórios de módulos
 */
function auditDirectories() {
  const results = {};

  for (const [key, dirPath] of Object.entries(KEY_DIRECTORIES)) {
    const listing = listFiles(dirPath);

    results[key] = {
      path: dirPath,
      ...listing,
    };

    // Validações específicas
    if (key === 'jmuModules') {
      results[key].isValid = listing.count === EXPECTATIONS.jmuModulesCount;
      results[key].expected = EXPECTATIONS.jmuModulesCount;
    } else if (key === 'calculatorHooks') {
      results[key].isValid = listing.count === EXPECTATIONS.calculatorHooksCount;
      results[key].expected = EXPECTATIONS.calculatorHooksCount;
    } else if (key === 'uiComponents') {
      results[key].isValid = listing.count >= EXPECTATIONS.uiComponentsMin;
      results[key].expected = `>= ${EXPECTATIONS.uiComponentsMin}`;
    }
  }

  return results;
}

/**
 * Calcula métricas do projeto
 */
function calculateMetrics(keyFiles) {
  const jmuBefore = 801;
  const jmuAfter = keyFiles.jmuService.total;
  const jmuReduction = ((jmuBefore - jmuAfter) / jmuBefore * 100).toFixed(1);

  const calcBefore = 398;
  const calcAfter = keyFiles.useCalculator.total;
  const calcReduction = ((calcBefore - calcAfter) / calcBefore * 100).toFixed(1);

  return {
    jmuService: {
      before: jmuBefore,
      after: jmuAfter,
      reduction: jmuReduction,
      reductionLines: jmuBefore - jmuAfter,
    },
    useCalculator: {
      before: calcBefore,
      after: calcAfter,
      reduction: calcReduction,
      reductionLines: calcBefore - calcAfter,
    },
  };
}

/**
 * Valida fases do IMPLEMENTATION_PLAN
 */
function validatePhases(keyFiles, directories) {
  return {
    phase_1_1_modularize_jmu: {
      complete: keyFiles.jmuService.exists &&
                keyFiles.jmuService.total <= 200 &&
                directories.jmuModules.count === 9,
      details: `JmuService: ${keyFiles.jmuService.total} linhas, ${directories.jmuModules.count} módulos`,
    },
    phase_1_2_modularize_hooks: {
      complete: keyFiles.useCalculator.exists &&
                keyFiles.useCalculator.total <= 200 &&
                directories.calculatorHooks.count === 4,
      details: `useCalculator: ${keyFiles.useCalculator.total} linhas, ${directories.calculatorHooks.count} hooks`,
    },
    phase_1_3_ui_components: {
      complete: directories.uiComponents.count >= 4,
      details: `${directories.uiComponents.count} componentes UI encontrados`,
    },
    phase_3_1_config_service: {
      complete: keyFiles.configService.exists,
      details: `ConfigService: ${keyFiles.configService.total} linhas`,
    },
    phase_3_3_migrate_data: {
      complete: false, // Manual check needed
      details: `data.ts ainda existe com ${keyFiles.dataTs.total} linhas (a deprecar)`,
    },
  };
}

/**
 * Gera relatório completo
 */
function generateReport() {
  console.log('🔍 Iniciando auditoria do projeto...\n');

  const timestamp = new Date().toISOString();
  const gitInfo = getGitInfo();
  const version = getPackageVersion();
  const keyFiles = auditKeyFiles();
  const directories = auditDirectories();
  const metrics = calculateMetrics(keyFiles);
  const phases = validatePhases(keyFiles, directories);

  const report = {
    meta: {
      timestamp,
      version,
      git: gitInfo,
    },
    files: keyFiles,
    directories,
    metrics,
    phases,
    summary: {
      totalFiles: Object.keys(keyFiles).length,
      totalDirectories: Object.keys(directories).length,
      phasesComplete: Object.values(phases).filter(p => p.complete).length,
      phasesTotal: Object.keys(phases).length,
    },
  };

  return report;
}

// ==================== FORMATAÇÃO ====================

/**
 * Gera relatório Markdown
 */
function generateMarkdownReport(report) {
  const { meta, files, directories, metrics, phases, summary } = report;

  let md = `# Relatório de Auditoria do Projeto\n\n`;
  md += `**Data:** ${new Date(meta.timestamp).toLocaleString('pt-BR')}\n`;
  md += `**Versão:** ${meta.version}\n`;
  md += `**Branch:** ${meta.git.branch}\n`;
  md += `**Último Commit:** ${meta.git.lastCommit}\n\n`;
  md += `---\n\n`;

  // Sumário Executivo
  md += `## 📊 Sumário Executivo\n\n`;
  md += `- ✅ Fases completas: **${summary.phasesComplete}/${summary.phasesTotal}**\n`;
  md += `- 📁 Arquivos auditados: **${summary.totalFiles}**\n`;
  md += `- 📂 Diretórios auditados: **${summary.totalDirectories}**\n\n`;

  // Métricas de Redução
  md += `## 📉 Métricas de Redução de Código\n\n`;
  md += `### JmuService.ts\n`;
  md += `- **Antes:** ${metrics.jmuService.before} linhas\n`;
  md += `- **Depois:** ${metrics.jmuService.after} linhas\n`;
  md += `- **Redução:** ${metrics.jmuService.reduction}% (-${metrics.jmuService.reductionLines} linhas)\n`;
  md += `- **Status:** ${files.jmuService.isValid ? '✅' : '❌'} ${files.jmuService.meetsTarget ? 'Meta atingida!' : 'Acima da meta'}\n\n`;

  md += `### useCalculator.ts\n`;
  md += `- **Antes:** ${metrics.useCalculator.before} linhas\n`;
  md += `- **Depois:** ${metrics.useCalculator.after} linhas\n`;
  md += `- **Redução:** ${metrics.useCalculator.reduction}% (-${metrics.useCalculator.reductionLines} linhas)\n`;
  md += `- **Status:** ${files.useCalculator.isValid ? '✅' : '❌'} ${files.useCalculator.meetsTarget ? 'Meta atingida!' : 'Acima da meta'}\n\n`;

  // Arquivos Principais
  md += `## 📄 Arquivos Principais\n\n`;
  md += `| Arquivo | Linhas | Status | Caminho |\n`;
  md += `|---------|--------|--------|----------|\n`;
  for (const [key, file] of Object.entries(files)) {
    const status = file.exists ? '✅' : '❌';
    md += `| ${key} | ${file.total} | ${status} | \`${file.path}\` |\n`;
  }
  md += `\n`;

  // Diretórios e Módulos
  md += `## 📁 Diretórios e Módulos\n\n`;
  for (const [key, dir] of Object.entries(directories)) {
    const status = dir.isValid !== undefined ? (dir.isValid ? '✅' : '⚠️') : '📂';
    const expected = dir.expected ? ` (esperado: ${dir.expected})` : '';
    md += `### ${status} ${key}\n`;
    md += `**Caminho:** \`${dir.path}\`\n`;
    md += `**Arquivos encontrados:** ${dir.count}${expected}\n\n`;

    if (dir.files && dir.files.length > 0) {
      md += `<details>\n<summary>Ver arquivos (${dir.count})</summary>\n\n`;
      dir.files.forEach(f => md += `- ${f}\n`);
      md += `\n</details>\n\n`;
    }
  }

  // Validação de Fases
  md += `## ✅ Validação de Fases (IMPLEMENTATION_PLAN)\n\n`;
  md += `| Fase | Status | Detalhes |\n`;
  md += `|------|--------|----------|\n`;
  for (const [key, phase] of Object.entries(phases)) {
    const status = phase.complete ? '✅ Completo' : '⏳ Pendente';
    const phaseName = key.replace(/_/g, ' ').replace(/phase (\d+) (\d+)/, 'Fase $1.$2');
    md += `| ${phaseName} | ${status} | ${phase.details} |\n`;
  }
  md += `\n`;

  // Git Status
  if (meta.git.status) {
    md += `## 🔧 Git Status\n\n`;
    md += `\`\`\`\n${meta.git.status}\n\`\`\`\n\n`;
  }

  // Footer
  md += `---\n\n`;
  md += `*Relatório gerado automaticamente por \`scripts/audit-project.js\`*\n`;

  return md;
}

// ==================== MAIN ====================

function main() {
  try {
    // Criar diretório de reports se não existir
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
      console.log(`✅ Diretório criado: ${REPORTS_DIR}\n`);
    }

    // Gerar relatório
    const report = generateReport();

    // Salvar JSON
    const jsonPath = path.join(REPORTS_DIR, 'audit-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`✅ Relatório JSON: ${path.relative(PROJECT_ROOT, jsonPath)}`);

    // Salvar Markdown
    const mdReport = generateMarkdownReport(report);
    const mdPath = path.join(REPORTS_DIR, 'audit-report.md');
    fs.writeFileSync(mdPath, mdReport);
    console.log(`✅ Relatório Markdown: ${path.relative(PROJECT_ROOT, mdPath)}`);

    // Sumário no console
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMÁRIO DA AUDITORIA');
    console.log('='.repeat(60));
    console.log(`Versão: ${report.meta.version}`);
    console.log(`Commit: ${report.meta.git.lastCommit}`);
    console.log(`Fases completas: ${report.summary.phasesComplete}/${report.summary.phasesTotal}`);
    console.log('\nMétricas de Redução:');
    console.log(`  JmuService.ts:     ${report.metrics.jmuService.before} → ${report.metrics.jmuService.after} linhas (-${report.metrics.jmuService.reduction}%)`);
    console.log(`  useCalculator.ts:  ${report.metrics.useCalculator.before} → ${report.metrics.useCalculator.after} linhas (-${report.metrics.useCalculator.reduction}%)`);
    console.log('\nMódulos:');
    console.log(`  JMU modules:       ${report.directories.jmuModules.count}/9 ${report.directories.jmuModules.isValid ? '✅' : '❌'}`);
    console.log(`  Calculator hooks:  ${report.directories.calculatorHooks.count}/4 ${report.directories.calculatorHooks.isValid ? '✅' : '❌'}`);
    console.log(`  UI components:     ${report.directories.uiComponents.count} ${report.directories.uiComponents.isValid ? '✅' : '⚠️'}`);
    console.log('='.repeat(60));
    console.log('\n✅ Auditoria concluída com sucesso!\n');

    // Exit code baseado em validações críticas
    const criticalChecks = [
      report.files.jmuService.isValid,
      report.files.useCalculator.isValid,
      report.directories.jmuModules.isValid,
      report.directories.calculatorHooks.isValid,
    ];

    const allPassed = criticalChecks.every(check => check);
    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('❌ Erro ao executar auditoria:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { generateReport, generateMarkdownReport };
