#!/usr/bin/env node

/**
 * Script to replace console.log and console.debug calls with proper logger
 * for production builds in ComplicesConecta
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src');
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/tests/**',
  '**/lib/logger.ts' // Don't modify the logger itself
];

// Patterns to replace
const REPLACEMENTS = [
  {
    // console.log(...) -> logger.info(...)
    pattern: /console\.log\(/g,
    replacement: 'logger.info(',
    needsImport: true
  },
  {
    // console.debug(...) -> logger.debug(...)
    pattern: /console\.debug\(/g,
    replacement: 'logger.debug(',
    needsImport: true
  },
  {
    // console.warn(...) -> logger.warn(...)
    pattern: /console\.warn\(/g,
    replacement: 'logger.warn(',
    needsImport: true
  },
  {
    // console.error(...) -> logger.error(...)
    pattern: /console\.error\(/g,
    replacement: 'logger.error(',
    needsImport: true
  }
];

function addLoggerImport(content) {
  // Check if logger import already exists
  if (content.includes("from '@/lib/logger'") || content.includes("import { logger }")) {
    return content;
  }

  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') && !lines[i].includes('//')) {
      lastImportIndex = i;
    }
  }

  // Add logger import after the last import
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, "import { logger } from '@/lib/logger';");
  } else {
    // No imports found, add at the beginning
    lines.unshift("import { logger } from '@/lib/logger';");
  }

  return lines.join('\n');
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let needsImport = false;

    // Apply replacements
    for (const replacement of REPLACEMENTS) {
      if (replacement.pattern.test(content)) {
        content = content.replace(replacement.pattern, replacement.replacement);
        modified = true;
        if (replacement.needsImport) {
          needsImport = true;
        }
      }
    }

    // Add logger import if needed
    if (needsImport && modified) {
      content = addLoggerImport(content);
    }

    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.relative(SRC_DIR, filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔄 Replacing console.* calls with logger...\n');

  // Find all TypeScript and TSX files
  const pattern = path.join(SRC_DIR, '**/*.{ts,tsx}').replace(/\\/g, '/');
  const files = await glob(pattern, {
    ignore: EXCLUDE_PATTERNS
  });

  let processedCount = 0;
  let modifiedCount = 0;

  for (const file of files) {
    processedCount++;
    if (processFile(file)) {
      modifiedCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${processedCount}`);
  console.log(`   Files modified: ${modifiedCount}`);
  console.log(`   Files unchanged: ${processedCount - modifiedCount}`);

  if (modifiedCount > 0) {
    console.log('\n✅ Console logs successfully replaced with logger!');
    console.log('💡 Remember to test the application to ensure everything works correctly.');
  } else {
    console.log('\n✅ No console.* calls found that needed replacement.');
  }
}

// Run the script
main();
