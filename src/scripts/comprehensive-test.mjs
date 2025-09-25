#!/usr/bin/env node

/**
 * Comprehensive Test Script for ComplicesConecta v2.8.6
 * Tests TypeScript, ESLint, and Build across entire project
 * Excludes: Android directory and node_modules
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${colors.blue}🔍 ${description}...${colors.reset}`);
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    log(`${colors.green}✅ ${description} - PASSED${colors.reset}`);
    return { success: true, output };
  } catch (error) {
    log(`${colors.red}❌ ${description} - FAILED${colors.reset}`);
    log(`${colors.red}Error: ${error.message}${colors.reset}`);
    if (error.stdout) {
      log(`${colors.yellow}Stdout: ${error.stdout}${colors.reset}`);
    }
    if (error.stderr) {
      log(`${colors.yellow}Stderr: ${error.stderr}${colors.reset}`);
    }
    return { success: false, error: error.message };
  }
}

function getProjectStats() {
  const srcDir = path.join(process.cwd(), 'src');
  const supabaseDir = path.join(process.cwd(), 'supabase');
  const testsDir = path.join(process.cwd(), 'tests');
  
  let stats = {
    totalFiles: 0,
    tsxFiles: 0,
    tsFiles: 0,
    jsFiles: 0,
    testFiles: 0
  };

  function countFiles(dir, basePath = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      
      // Skip node_modules, android, and .git directories
      if (item === 'node_modules' || item === 'android' || item === '.git' || item.startsWith('.')) {
        continue;
      }
      
      if (fs.statSync(fullPath).isDirectory()) {
        countFiles(fullPath, relativePath);
      } else {
        stats.totalFiles++;
        const ext = path.extname(item);
        if (ext === '.tsx') stats.tsxFiles++;
        else if (ext === '.ts') stats.tsFiles++;
        else if (ext === '.js' || ext === '.jsx') stats.jsFiles++;
        if (item.includes('.test.') || item.includes('.spec.')) stats.testFiles++;
      }
    }
  }

  countFiles(srcDir, 'src');
  countFiles(supabaseDir, 'supabase');
  countFiles(testsDir, 'tests');
  
  return stats;
}

async function main() {
  log(`${colors.bright}${colors.cyan}🚀 ComplicesConecta v2.8.6 - Comprehensive Test Suite${colors.reset}`);
  log(`${colors.cyan}📅 Fecha: ${new Date().toLocaleString('es-ES')}${colors.reset}`);
  
  const stats = getProjectStats();
  log(`\n${colors.magenta}📊 Project Statistics:${colors.reset}`);
  log(`   Total Files: ${stats.totalFiles}`);
  log(`   TypeScript Files (.ts): ${stats.tsFiles}`);
  log(`   React Components (.tsx): ${stats.tsxFiles}`);
  log(`   JavaScript Files (.js/.jsx): ${stats.jsFiles}`);
  log(`   Test Files: ${stats.testFiles}`);

  const tests = [
    {
      command: 'npx tsc --noEmit',
      description: 'TypeScript Type Check (No Emit)'
    },
    {
      command: 'npx tsc --noEmit --skipLibCheck',
      description: 'TypeScript Type Check (Skip Lib Check)'
    },
    {
      command: 'npm run lint',
      description: 'ESLint Code Quality Check'
    },
    {
      command: 'npm run lint -- --max-warnings 0',
      description: 'ESLint Strict Mode (Zero Warnings)'
    },
    {
      command: 'npm test -- --run',
      description: 'Unit Test Suite'
    },
    {
      command: 'npm run build',
      description: 'Production Build'
    }
  ];

  const results = [];
  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    const result = runCommand(test.command, test.description);
    results.push({ ...test, ...result });
    if (result.success) passedTests++;
  }

  // Summary Report
  log(`\n${colors.bright}${colors.cyan}📋 TEST SUMMARY REPORT${colors.reset}`);
  log(`${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  
  results.forEach(result => {
    const status = result.success ? 
      `${colors.green}✅ PASSED${colors.reset}` : 
      `${colors.red}❌ FAILED${colors.reset}`;
    log(`${result.description}: ${status}`);
  });

  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  const overallStatus = passedTests === totalTests ? 
    `${colors.green}🎉 ALL TESTS PASSED${colors.reset}` : 
    `${colors.red}⚠️  SOME TESTS FAILED${colors.reset}`;

  log(`\n${colors.bright}${overallStatus}${colors.reset}`);
  log(`${colors.cyan}Success Rate: ${successRate}% (${passedTests}/${totalTests})${colors.reset}`);

  if (passedTests === totalTests) {
    log(`\n${colors.green}${colors.bright}🚀 Project is ready for production deployment!${colors.reset}`);
    log(`${colors.green}✨ Zero TypeScript errors, zero lint warnings, all tests passing${colors.reset}`);
  } else {
    log(`\n${colors.red}${colors.bright}🔧 Please fix the failing tests before deployment${colors.reset}`);
    process.exit(1);
  }

  // Generate detailed report
  const reportPath = path.join(process.cwd(), 'test-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    version: '2.8.6',
    projectStats: stats,
    testResults: results,
    summary: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: parseFloat(successRate)
    }
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n${colors.blue}📄 Detailed report saved to: test-report.json${colors.reset}`);
}

main().catch(console.error);
