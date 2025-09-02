#!/usr/bin/env node
/**
 * ComplicesConecta - Comprehensive Repository Audit Script
 * 
 * This script performs an exhaustive audit of the repository excluding:
 * - android/, node_modules/, .git/, dist/, build/, .next/, .turbo/, coverage/
 * - *.lock files and other dependency-related files
 * 
 * Usage:
 *   bun tsx scripts/audit-project.ts --report
 *   bun tsx scripts/audit-project.ts --fix --max-size-mb=200
 *   bun tsx scripts/audit-project.ts --csv --json
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Configuration
const EXCLUDE_DIRS = [
  'node_modules', 'android', '.git', 'dist', 'build', '.next', 
  '.turbo', 'coverage', '.pnpm-store', '.yarn', 'target'
];

const EXCLUDE_FILES = [
  '*.lock', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  'bun.lockb', '*.log', '*.tmp', '.DS_Store', 'Thumbs.db'
];

const MAX_FILE_SIZE_MB = 10;
const LARGE_FILE_THRESHOLD = MAX_FILE_SIZE_MB * 1024 * 1024;

interface AuditOptions {
  report: boolean;
  fix: boolean;
  csv: boolean;
  json: boolean;
  maxSizeMb: number;
}

interface FileInfo {
  path: string;
  size: number;
  hash: string;
  extension: string;
  isCorrupt?: boolean;
  isEmpty?: boolean;
}

interface DuplicateGroup {
  hash: string;
  files: FileInfo[];
  totalSize: number;
}

interface BrokenImport {
  file: string;
  line: number;
  import: string;
  resolved: string | null;
}

interface AuditReport {
  timestamp: string;
  summary: {
    totalFiles: number;
    totalSize: number;
    duplicates: number;
    brokenImports: number;
    emptyFolders: number;
    largeFiles: number;
    corruptFiles: number;
  };
  details: {
    duplicates: DuplicateGroup[];
    brokenImports: BrokenImport[];
    emptyFolders: string[];
    largeFiles: FileInfo[];
    corruptFiles: FileInfo[];
    caseConflicts: string[];
  };
}

class ProjectAuditor {
  private options: AuditOptions;
  private rootDir: string;
  private files: FileInfo[] = [];
  private report: AuditReport;

  constructor(options: AuditOptions) {
    this.options = options;
    this.rootDir = process.cwd();
    this.report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: 0,
        totalSize: 0,
        duplicates: 0,
        brokenImports: 0,
        emptyFolders: 0,
        largeFiles: 0,
        corruptFiles: 0,
      },
      details: {
        duplicates: [],
        brokenImports: [],
        emptyFolders: [],
        largeFiles: [],
        corruptFiles: [],
        caseConflicts: [],
      },
    };
  }

  async audit(): Promise<AuditReport> {
    console.log('🔍 Starting comprehensive repository audit...');
    
    // Scan all files
    await this.scanFiles(this.rootDir);
    
    // Perform checks
    await this.findDuplicates();
    await this.findBrokenImports();
    await this.findEmptyFolders();
    await this.findLargeFiles();
    await this.findCorruptFiles();
    await this.findCaseConflicts();
    
    // Generate summary
    this.generateSummary();
    
    console.log('✅ Audit completed!');
    return this.report;
  }

  private async scanFiles(dir: string, relativePath = ''): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip excluded directories
          if (EXCLUDE_DIRS.includes(entry.name)) {
            continue;
          }
          
          await this.scanFiles(fullPath, relPath);
        } else {
          // Skip excluded files
          if (this.shouldExcludeFile(entry.name)) {
            continue;
          }
          
          const stats = await fs.stat(fullPath);
          const hash = await this.calculateFileHash(fullPath);
          
          const fileInfo: FileInfo = {
            path: relPath,
            size: stats.size,
            hash,
            extension: path.extname(entry.name).toLowerCase(),
          };
          
          this.files.push(fileInfo);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan directory: ${dir}`, error);
    }
  }

  private shouldExcludeFile(filename: string): boolean {
    return EXCLUDE_FILES.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(filename);
      }
      return filename === pattern;
    });
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath);
      return crypto.createHash('sha256').update(content).digest('hex');
    } catch (error) {
      console.warn(`⚠️  Could not hash file: ${filePath}`);
      return 'error';
    }
  }

  private async findDuplicates(): Promise<void> {
    console.log('🔍 Finding duplicate files...');
    
    const hashGroups = new Map<string, FileInfo[]>();
    
    for (const file of this.files) {
      if (file.hash === 'error') continue;
      
      if (!hashGroups.has(file.hash)) {
        hashGroups.set(file.hash, []);
      }
      hashGroups.get(file.hash)!.push(file);
    }
    
    for (const [hash, files] of hashGroups) {
      if (files.length > 1) {
        const totalSize = files.reduce((sum, f) => sum + f.size, 0);
        this.report.details.duplicates.push({
          hash,
          files,
          totalSize,
        });
      }
    }
    
    this.report.summary.duplicates = this.report.details.duplicates.length;
  }

  private async findBrokenImports(): Promise<void> {
    console.log('🔍 Checking for broken imports...');
    
    const tsFiles = this.files.filter(f => 
      ['.ts', '.tsx', '.js', '.jsx'].includes(f.extension)
    );
    
    for (const file of tsFiles) {
      try {
        const fullPath = path.join(this.rootDir, file.path);
        const content = await fs.readFile(fullPath, 'utf-8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);
          
          if (importMatch) {
            const importPath = importMatch[1];
            const resolved = await this.resolveImport(fullPath, importPath);
            
            if (!resolved) {
              this.report.details.brokenImports.push({
                file: file.path,
                line: i + 1,
                import: importPath,
                resolved: null,
              });
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️  Could not check imports in: ${file.path}`);
      }
    }
    
    this.report.summary.brokenImports = this.report.details.brokenImports.length;
  }

  private async resolveImport(fromFile: string, importPath: string): Promise<string | null> {
    // Handle relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const dir = path.dirname(fromFile);
      const resolved = path.resolve(dir, importPath);
      
      // Try different extensions
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
      for (const ext of extensions) {
        try {
          await fs.access(resolved + ext);
          return resolved + ext;
        } catch {}
      }
      return null;
    }
    
    // Handle alias imports (@/)
    if (importPath.startsWith('@/')) {
      const srcPath = path.join(this.rootDir, 'src', importPath.slice(2));
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
      for (const ext of extensions) {
        try {
          await fs.access(srcPath + ext);
          return srcPath + ext;
        } catch {}
      }
      return null;
    }
    
    // Assume node_modules imports are valid
    return 'node_modules';
  }

  private async findEmptyFolders(): Promise<void> {
    console.log('🔍 Finding empty folders...');
    
    await this.scanEmptyFolders(this.rootDir);
    this.report.summary.emptyFolders = this.report.details.emptyFolders.length;
  }

  private async scanEmptyFolders(dir: string, relativePath = ''): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      if (entries.length === 0) {
        this.report.details.emptyFolders.push(relativePath);
        return;
      }
      
      for (const entry of entries) {
        if (entry.isDirectory() && !EXCLUDE_DIRS.includes(entry.name)) {
          const fullPath = path.join(dir, entry.name);
          const relPath = path.join(relativePath, entry.name);
          await this.scanEmptyFolders(fullPath, relPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan for empty folders: ${dir}`);
    }
  }

  private async findLargeFiles(): Promise<void> {
    console.log('🔍 Finding large files...');
    
    this.report.details.largeFiles = this.files.filter(f => 
      f.size > LARGE_FILE_THRESHOLD
    );
    
    this.report.summary.largeFiles = this.report.details.largeFiles.length;
  }

  private async findCorruptFiles(): Promise<void> {
    console.log('🔍 Checking for corrupt files...');
    
    for (const file of this.files) {
      try {
        const fullPath = path.join(this.rootDir, file.path);
        
        // Check JSON files
        if (file.extension === '.json') {
          const content = await fs.readFile(fullPath, 'utf-8');
          JSON.parse(content);
        }
        
        // Check TypeScript/JavaScript files
        if (['.ts', '.tsx', '.js', '.jsx'].includes(file.extension)) {
          const content = await fs.readFile(fullPath, 'utf-8');
          // Basic syntax check - look for unmatched brackets
          const openBrackets = (content.match(/[{[(]/g) || []).length;
          const closeBrackets = (content.match(/[}\])]/g) || []).length;
          
          if (Math.abs(openBrackets - closeBrackets) > 5) {
            file.isCorrupt = true;
            this.report.details.corruptFiles.push(file);
          }
        }
        
        // Check for BOM
        if (file.size > 0) {
          const buffer = await fs.readFile(fullPath);
          if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
            console.warn(`⚠️  File has BOM: ${file.path}`);
          }
        }
        
      } catch (error) {
        file.isCorrupt = true;
        this.report.details.corruptFiles.push(file);
      }
    }
    
    this.report.summary.corruptFiles = this.report.details.corruptFiles.length;
  }

  private async findCaseConflicts(): Promise<void> {
    console.log('🔍 Checking for case conflicts...');
    
    const pathMap = new Map<string, string[]>();
    
    for (const file of this.files) {
      const lowerPath = file.path.toLowerCase();
      if (!pathMap.has(lowerPath)) {
        pathMap.set(lowerPath, []);
      }
      pathMap.get(lowerPath)!.push(file.path);
    }
    
    for (const [lowerPath, paths] of pathMap) {
      if (paths.length > 1) {
        this.report.details.caseConflicts.push(...paths);
      }
    }
  }

  private generateSummary(): void {
    this.report.summary.totalFiles = this.files.length;
    this.report.summary.totalSize = this.files.reduce((sum, f) => sum + f.size, 0);
    
    console.log('\n📊 Audit Summary:');
    console.log(`   Total Files: ${this.report.summary.totalFiles}`);
    console.log(`   Total Size: ${(this.report.summary.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Duplicates: ${this.report.summary.duplicates}`);
    console.log(`   Broken Imports: ${this.report.summary.brokenImports}`);
    console.log(`   Empty Folders: ${this.report.summary.emptyFolders}`);
    console.log(`   Large Files: ${this.report.summary.largeFiles}`);
    console.log(`   Corrupt Files: ${this.report.summary.corruptFiles}`);
  }

  async saveReport(): Promise<void> {
    const reportsDir = path.join(this.rootDir, 'reports');
    
    try {
      await fs.mkdir(reportsDir, { recursive: true });
    } catch {}
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    if (this.options.json) {
      const jsonPath = path.join(reportsDir, `audit-${timestamp}.json`);
      await fs.writeFile(jsonPath, JSON.stringify(this.report, null, 2));
      console.log(`📄 JSON report saved: ${jsonPath}`);
    }
    
    if (this.options.csv) {
      const csvPath = path.join(reportsDir, `audit-${timestamp}.csv`);
      await this.generateCSV(csvPath);
      console.log(`📊 CSV report saved: ${csvPath}`);
    }
  }

  private async generateCSV(csvPath: string): Promise<void> {
    const rows = [
      'Type,File,Issue,Details,Size',
      ...this.report.details.duplicates.flatMap(dup => 
        dup.files.map(f => `Duplicate,${f.path},Hash: ${dup.hash},${dup.files.length} copies,${f.size}`)
      ),
      ...this.report.details.brokenImports.map(bi => 
        `Broken Import,${bi.file},Line ${bi.line},${bi.import},0`
      ),
      ...this.report.details.largeFiles.map(f => 
        `Large File,${f.path},Size > ${MAX_FILE_SIZE_MB}MB,,${f.size}`
      ),
      ...this.report.details.corruptFiles.map(f => 
        `Corrupt File,${f.path},Parse/Read Error,,${f.size}`
      ),
    ];
    
    await fs.writeFile(csvPath, rows.join('\n'));
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  const options: AuditOptions = {
    report: args.includes('--report'),
    fix: args.includes('--fix'),
    csv: args.includes('--csv'),
    json: args.includes('--json') || args.includes('--report'),
    maxSizeMb: parseInt(args.find(arg => arg.startsWith('--max-size-mb='))?.split('=')[1] || '200'),
  };
  
  if (!options.report && !options.fix) {
    console.log(`
ComplicesConecta Repository Audit Tool

Usage:
  bun tsx scripts/audit-project.ts --report          Generate audit report
  bun tsx scripts/audit-project.ts --fix             Fix safe issues
  bun tsx scripts/audit-project.ts --csv --json      Export in multiple formats
  bun tsx scripts/audit-project.ts --max-size-mb=50  Set large file threshold

Options:
  --report        Generate comprehensive audit report (default: JSON)
  --fix           Apply safe fixes (empty folders, duplicates outside src/)
  --csv           Export CSV format
  --json          Export JSON format
  --max-size-mb   Large file threshold in MB (default: 200)
`);
    process.exit(1);
  }
  
  const auditor = new ProjectAuditor(options);
  const report = await auditor.audit();
  
  if (options.report || options.csv || options.json) {
    await auditor.saveReport();
  }
  
  if (options.fix) {
    console.log('🔧 Fix mode is not implemented yet for safety reasons.');
    console.log('   Please review the report and apply fixes manually.');
  }
}

if (import.meta.main) {
  main().catch(console.error);
}

export { ProjectAuditor, type AuditReport };
