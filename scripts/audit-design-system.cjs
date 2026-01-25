#!/usr/bin/env node

/**
 * Design System Audit Script
 *
 * Scans the codebase for design system inconsistencies and violations.
 * Generates a report with findings and suggestions.
 *
 * Run: npm run audit:design
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

const SRC_DIR = path.join(__dirname, '../src');
const REPORTS_DIR = path.join(__dirname, '../reports');
const REPORT_FILE = path.join(REPORTS_DIR, 'design-audit-report.json');
const REPORT_MD_FILE = path.join(REPORTS_DIR, 'design-audit-report.md');

// Patterns to detect
const PATTERNS = {
  // Hardcoded colors (not using design tokens)
  hardcodedColors: [
    /className="[^"]*\b(text|bg|border)-(blue|indigo|purple|pink|rose|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|violet|fuchsia|slate)-(50|100|200|300|400|500|600|700|800|900|950)\b/g,
  ],

  // Arbitrary values (should use tokens instead)
  arbitraryValues: [
    /className="[^"]*\[[\d.]+(?:px|rem|em)\]/g,
  ],

  // Inconsistent border-radius for cards
  inconsistentCardRadius: [
    /className="[^"]*card[^"]*rounded-(?!2xl\b)/g,
  ],

  // Missing dark mode variants for backgrounds
  missingDarkBg: [
    /className="[^"]*\bbg-(?:white|neutral-(?:50|100))\b(?![^"]*dark:bg-)/g,
  ],

  // Missing dark mode variants for text
  missingDarkText: [
    /className="[^"]*\btext-neutral-(?:600|700|800|900)\b(?![^"]*dark:text-)/g,
  ],

  // Missing dark mode variants for borders
  missingDarkBorder: [
    /className="[^"]*\bborder-neutral-(?:200|300)\b(?![^"]*dark:border-)/g,
  ],

  // Non-semantic classes instead of design tokens
  nonSemanticText: [
    /className="[^"]*\btext-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)\b(?![^"]*(?:text-h\d|text-body|text-label|text-display))/g,
  ],

  // Deprecated slate colors (should use neutral)
  deprecatedSlate: [
    /className="[^"]*\b(text|bg|border)-slate-/g,
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Recursively find all .tsx and .jsx files
 */
function findComponentFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, dist, build directories
      if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
        findComponentFiles(filePath, fileList);
      }
    } else if (file.match(/\.(tsx|jsx)$/)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Scan a file for pattern violations
 */
function scanFile(filePath, patterns) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations = [];

  Object.entries(patterns).forEach(([violationType, regexList]) => {
    regexList.forEach(regex => {
      const matches = [...content.matchAll(new RegExp(regex.source, 'g'))];

      if (matches.length > 0) {
        violations.push({
          type: violationType,
          count: matches.length,
          examples: matches.slice(0, 3).map(m => m[0]), // First 3 examples
        });
      }
    });
  });

  return violations;
}

/**
 * Generate suggestions based on violation type
 */
function getSuggestion(violationType) {
  const suggestions = {
    hardcodedColors: 'Use design tokens: primary, secondary, neutral, success, warning, error, info',
    arbitraryValues: 'Use semantic tokens: text-h1, text-body, text-label, p-6, gap-4, etc.',
    inconsistentCardRadius: 'Use rounded-2xl for all cards',
    missingDarkBg: 'Add dark:bg-neutral-800 or dark:bg-neutral-900 variant',
    missingDarkText: 'Add dark:text-neutral-300 or dark:text-white variant',
    missingDarkBorder: 'Add dark:border-neutral-700 variant',
    nonSemanticText: 'Use semantic tokens: text-h1, text-body, text-label instead of generic text-lg',
    deprecatedSlate: 'Replace slate- with neutral- (e.g., text-slate-600 → text-neutral-600)',
  };

  return suggestions[violationType] || 'Check DESIGN_SYSTEM.md for guidelines';
}

/**
 * Calculate severity score
 */
function calculateSeverity(violationType, count) {
  const weights = {
    hardcodedColors: 3,
    deprecatedSlate: 3,
    missingDarkBg: 2,
    missingDarkText: 2,
    missingDarkBorder: 2,
    arbitraryValues: 2,
    nonSemanticText: 1,
    inconsistentCardRadius: 1,
  };

  return (weights[violationType] || 1) * count;
}

// ============================================
// MAIN AUDIT FUNCTION
// ============================================

function runAudit() {
  console.log('🎨 Design System Audit\n');
  console.log('Scanning codebase for design system violations...\n');

  // Find all component files
  const componentFiles = findComponentFiles(SRC_DIR);
  console.log(`Found ${componentFiles.length} component files\n`);

  // Scan each file
  const results = {};
  let totalViolations = 0;
  let totalSeverity = 0;

  componentFiles.forEach(filePath => {
    const violations = scanFile(filePath, PATTERNS);

    if (violations.length > 0) {
      const relativePath = path.relative(process.cwd(), filePath);
      results[relativePath] = violations;

      violations.forEach(v => {
        totalViolations += v.count;
        totalSeverity += calculateSeverity(v.type, v.count);
      });
    }
  });

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    filesScanned: componentFiles.length,
    filesWithViolations: Object.keys(results).length,
    totalViolations,
    totalSeverity,
    healthScore: Math.max(0, 100 - (totalSeverity / componentFiles.length)),
    violations: results,
  };

  // Ensure reports directory exists
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  // Write JSON report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`✅ JSON report saved: ${path.relative(process.cwd(), REPORT_FILE)}\n`);

  // Generate Markdown report
  generateMarkdownReport(report);

  // Print summary
  printSummary(report);
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(report) {
  const lines = [];

  lines.push('# Design System Audit Report\n');
  lines.push(`**Generated:** ${new Date(report.timestamp).toLocaleString('pt-BR')}\n`);
  lines.push('---\n');

  // Summary
  lines.push('## 📊 Summary\n');
  lines.push(`- **Files Scanned:** ${report.filesScanned}`);
  lines.push(`- **Files with Violations:** ${report.filesWithViolations}`);
  lines.push(`- **Total Violations:** ${report.totalViolations}`);
  lines.push(`- **Health Score:** ${report.healthScore.toFixed(1)}/100`);

  if (report.healthScore >= 90) {
    lines.push('- **Status:** ✅ Excellent');
  } else if (report.healthScore >= 70) {
    lines.push('- **Status:** ⚠️ Good (some improvements needed)');
  } else if (report.healthScore >= 50) {
    lines.push('- **Status:** ⚠️ Fair (multiple violations)');
  } else {
    lines.push('- **Status:** ❌ Poor (needs attention)');
  }

  lines.push('\n---\n');

  // Violations by type
  const violationsByType = {};
  Object.entries(report.violations).forEach(([file, violations]) => {
    violations.forEach(v => {
      if (!violationsByType[v.type]) {
        violationsByType[v.type] = { count: 0, files: [] };
      }
      violationsByType[v.type].count += v.count;
      violationsByType[v.type].files.push({ file, count: v.count, examples: v.examples });
    });
  });

  if (Object.keys(violationsByType).length > 0) {
    lines.push('## 🚨 Violations by Type\n');

    Object.entries(violationsByType)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([type, data]) => {
        lines.push(`### ${type} (${data.count} occurrences)\n`);
        lines.push(`**Suggestion:** ${getSuggestion(type)}\n`);
        lines.push('**Files:**\n');

        data.files.forEach(({ file, count, examples }) => {
          lines.push(`- \`${file}\` (${count} violations)`);
          if (examples && examples.length > 0) {
            lines.push(`  - Example: \`${examples[0]}\``);
          }
        });

        lines.push('');
      });
  } else {
    lines.push('## ✅ No Violations Found!\n');
    lines.push('Your codebase follows the design system guidelines perfectly.\n');
  }

  lines.push('---\n');
  lines.push('## 📚 Resources\n');
  lines.push('- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) - Complete design system documentation');
  lines.push('- [tailwind.config.js](../tailwind.config.js) - Design tokens configuration');
  lines.push('\n---\n');
  lines.push('*Generated by `npm run audit:design`*\n');

  fs.writeFileSync(REPORT_MD_FILE, lines.join('\n'));
  console.log(`✅ Markdown report saved: ${path.relative(process.cwd(), REPORT_MD_FILE)}\n`);
}

/**
 * Print summary to console
 */
function printSummary(report) {
  console.log('━'.repeat(60));
  console.log('📊 AUDIT SUMMARY');
  console.log('━'.repeat(60));
  console.log(`Files Scanned:        ${report.filesScanned}`);
  console.log(`Files with Violations: ${report.filesWithViolations}`);
  console.log(`Total Violations:     ${report.totalViolations}`);
  console.log(`Health Score:         ${report.healthScore.toFixed(1)}/100`);
  console.log('━'.repeat(60));

  if (report.healthScore >= 90) {
    console.log('✅ Status: EXCELLENT - Design system is well maintained!');
  } else if (report.healthScore >= 70) {
    console.log('⚠️  Status: GOOD - Some improvements recommended');
  } else if (report.healthScore >= 50) {
    console.log('⚠️  Status: FAIR - Multiple violations found');
  } else {
    console.log('❌ Status: POOR - Needs immediate attention');
  }

  console.log('━'.repeat(60));
  console.log(`\nView detailed report: ${path.relative(process.cwd(), REPORT_MD_FILE)}\n`);
}

// ============================================
// RUN
// ============================================

try {
  runAudit();
} catch (error) {
  console.error('❌ Error running audit:', error.message);
  process.exit(1);
}
