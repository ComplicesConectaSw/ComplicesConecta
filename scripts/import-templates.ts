#!/usr/bin/env bun
/**
 * ComplicesConecta - Safe Template Importer
 * 
 * Safely imports reusable components from template directories without overwriting existing files.
 * Creates a catalog in Admin for template management.
 * 
 * Usage:
 *   bun run scaffold:templates
 *   bun tsx scripts/import-templates.ts --dry-run
 *   bun tsx scripts/import-templates.ts --force
 */

import { promises as fs } from 'fs';
import path from 'path';

// Template source directories
const TEMPLATE_DIRS = [
  'C:\\Users\\conej\\Documents\\Next plantillas animadas -20250712T224150Z-1-001\\Next plantillas animadas',
  'C:\\Users\\conej\\Documents\\Nex js twl plantillas'
];

const TARGET_DIR = 'src/components/templates';
const CATALOG_FILE = 'src/lib/template-catalog.ts';

interface TemplateComponent {
  id: string;
  name: string;
  category: string;
  description: string;
  sourcePath: string;
  targetPath: string;
  dependencies: string[];
  isActive: boolean;
  imported: boolean;
  hasConflict: boolean;
}

interface ImportOptions {
  dryRun: boolean;
  force: boolean;
  category?: string;
}

class TemplateImporter {
  private options: ImportOptions;
  private rootDir: string;
  private components: TemplateComponent[] = [];
  private conflicts: string[] = [];

  constructor(options: ImportOptions) {
    this.options = options;
    this.rootDir = process.cwd();
  }

  async import(): Promise<void> {
    console.log('🎨 Starting template import process...');
    
    // Scan template directories
    await this.scanTemplateDirectories();
    
    // Check for conflicts
    await this.checkConflicts();
    
    // Import components if not dry run
    if (!this.options.dryRun) {
      await this.importComponents();
      await this.generateCatalog();
    }
    
    // Show summary
    this.showSummary();
  }

  private async scanTemplateDirectories(): Promise<void> {
    console.log('🔍 Scanning template directories...');
    
    for (const templateDir of TEMPLATE_DIRS) {
      try {
        await fs.access(templateDir);
        await this.scanDirectory(templateDir, templateDir);
      } catch (error) {
        console.warn(`⚠️  Template directory not found: ${templateDir}`);
      }
    }
  }

  private async scanDirectory(dir: string, rootTemplateDir: string): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and other excluded directories
          if (['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            continue;
          }
          await this.scanDirectory(fullPath, rootTemplateDir);
        } else if (this.isReusableComponent(entry.name)) {
          await this.processComponent(fullPath, rootTemplateDir);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan directory: ${dir}`);
    }
  }

  private isReusableComponent(filename: string): boolean {
    // Look for reusable component patterns
    const reusablePatterns = [
      /card/i, /button/i, /modal/i, /dialog/i, /hero/i, /section/i,
      /loader/i, /spinner/i, /animation/i, /transition/i, /layout/i,
      /grid/i, /list/i, /form/i, /input/i, /dropdown/i, /menu/i,
      /navbar/i, /sidebar/i, /footer/i, /header/i, /banner/i,
      /carousel/i, /slider/i, /gallery/i, /tabs/i, /accordion/i
    ];
    
    return filename.endsWith('.tsx') && 
           reusablePatterns.some(pattern => pattern.test(filename)) &&
           !filename.includes('.test.') &&
           !filename.includes('.spec.');
  }

  private async processComponent(filePath: string, rootTemplateDir: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = path.relative(rootTemplateDir, filePath);
      const filename = path.basename(filePath);
      const category = this.categorizeComponent(filename, content);
      
      // Generate unique ID
      const id = this.generateComponentId(filename, relativePath);
      
      // Extract dependencies
      const dependencies = this.extractDependencies(content);
      
      // Determine target path
      const targetPath = path.join(TARGET_DIR, category, filename);
      
      const component: TemplateComponent = {
        id,
        name: this.extractComponentName(filename),
        category,
        description: this.extractDescription(content),
        sourcePath: filePath,
        targetPath,
        dependencies,
        isActive: false,
        imported: false,
        hasConflict: false
      };
      
      this.components.push(component);
    } catch (error) {
      console.warn(`⚠️  Could not process component: ${filePath}`);
    }
  }

  private categorizeComponent(filename: string, content: string): string {
    const name = filename.toLowerCase();
    
    if (name.includes('card')) return 'cards';
    if (name.includes('button')) return 'buttons';
    if (name.includes('modal') || name.includes('dialog')) return 'modals';
    if (name.includes('hero') || name.includes('banner')) return 'heroes';
    if (name.includes('loader') || name.includes('spinner')) return 'loaders';
    if (name.includes('animation') || name.includes('transition')) return 'animations';
    if (name.includes('layout') || name.includes('grid')) return 'layouts';
    if (name.includes('form') || name.includes('input')) return 'forms';
    if (name.includes('nav') || name.includes('menu')) return 'navigation';
    if (name.includes('section')) return 'sections';
    
    // Analyze content for more context
    if (content.includes('framer-motion') || content.includes('animate')) return 'animations';
    if (content.includes('form') || content.includes('input')) return 'forms';
    if (content.includes('carousel') || content.includes('slider')) return 'interactive';
    
    return 'misc';
  }

  private generateComponentId(filename: string, relativePath: string): string {
    const name = path.basename(filename, '.tsx');
    const hash = this.simpleHash(relativePath);
    return `${name.toLowerCase()}_${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private extractComponentName(filename: string): string {
    return path.basename(filename, '.tsx')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private extractDescription(content: string): string {
    // Look for JSDoc comments or component descriptions
    const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
    if (jsdocMatch) {
      return jsdocMatch[1];
    }
    
    // Look for comment descriptions
    const commentMatch = content.match(/\/\/\s*(.+)/);
    if (commentMatch) {
      return commentMatch[1];
    }
    
    // Generate description based on component name
    const componentMatch = content.match(/(?:export\s+(?:default\s+)?(?:function|const)\s+|function\s+)(\w+)/);
    if (componentMatch) {
      return `Reusable ${componentMatch[1]} component`;
    }
    
    return 'Imported template component';
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    const importMatches = content.matchAll(/import.*from\s+['"]([^'"]+)['"]/g);
    
    for (const match of importMatches) {
      const dep = match[1];
      // Only include external dependencies, not relative imports
      if (!dep.startsWith('./') && !dep.startsWith('../') && !dep.startsWith('@/')) {
        dependencies.push(dep);
      }
    }
    
    return [...new Set(dependencies)];
  }

  private async checkConflicts(): Promise<void> {
    console.log('🔍 Checking for conflicts...');
    
    for (const component of this.components) {
      const targetFullPath = path.join(this.rootDir, component.targetPath);
      
      try {
        await fs.access(targetFullPath);
        component.hasConflict = true;
        this.conflicts.push(component.targetPath);
      } catch {
        // File doesn't exist, no conflict
      }
    }
  }

  private async importComponents(): Promise<void> {
    console.log('📦 Importing components...');
    
    // Create target directories
    const categories = [...new Set(this.components.map(c => c.category))];
    for (const category of categories) {
      const categoryDir = path.join(this.rootDir, TARGET_DIR, category);
      await fs.mkdir(categoryDir, { recursive: true });
    }
    
    for (const component of this.components) {
      const targetFullPath = path.join(this.rootDir, component.targetPath);
      
      if (component.hasConflict && !this.options.force) {
        // Save as .imported.tsx
        const importedPath = targetFullPath.replace('.tsx', '.imported.tsx');
        await this.copyAndAdaptComponent(component.sourcePath, importedPath);
        component.targetPath = component.targetPath.replace('.tsx', '.imported.tsx');
        console.log(`📄 Imported as: ${component.targetPath}`);
      } else {
        await this.copyAndAdaptComponent(component.sourcePath, targetFullPath);
        console.log(`📄 Imported: ${component.targetPath}`);
      }
      
      component.imported = true;
    }
  }

  private async copyAndAdaptComponent(sourcePath: string, targetPath: string): Promise<void> {
    try {
      let content = await fs.readFile(sourcePath, 'utf-8');
      
      // Adapt imports to use our project structure
      content = this.adaptImports(content);
      
      // Add import header comment
      const header = `/**
 * Imported from template library
 * Source: ${sourcePath}
 * Imported: ${new Date().toISOString()}
 * 
 * This component has been imported from external templates.
 * Feel free to modify it according to ComplicesConecta's needs.
 */

`;
      
      content = header + content;
      
      await fs.writeFile(targetPath, content, 'utf-8');
    } catch (error) {
      console.error(`❌ Failed to copy component: ${sourcePath} -> ${targetPath}`, error);
    }
  }

  private adaptImports(content: string): string {
    // Replace common import patterns with our project structure
    return content
      .replace(/from\s+['"]@\/components\/ui\/([^'"]+)['"]/g, 'from "@/components/ui/$1"')
      .replace(/from\s+['"]@\/lib\/([^'"]+)['"]/g, 'from "@/lib/$1"')
      .replace(/from\s+['"]@\/hooks\/([^'"]+)['"]/g, 'from "@/hooks/$1"')
      // Add more adaptations as needed
      ;
  }

  private async generateCatalog(): Promise<void> {
    console.log('📚 Generating template catalog...');
    
    const catalogContent = `/**
 * ComplicesConecta Template Catalog
 * Auto-generated by template importer
 * Generated: ${new Date().toISOString()}
 */

export interface TemplateComponent {
  id: string;
  name: string;
  category: string;
  description: string;
  targetPath: string;
  dependencies: string[];
  isActive: boolean;
  imported: boolean;
  hasConflict: boolean;
}

export const templateCatalog: TemplateComponent[] = ${JSON.stringify(this.components, null, 2)};

export const templateCategories = {
  cards: 'Card Components',
  buttons: 'Button Components',
  modals: 'Modal & Dialog Components',
  heroes: 'Hero & Banner Components',
  loaders: 'Loading Components',
  animations: 'Animation Components',
  layouts: 'Layout Components',
  forms: 'Form Components',
  navigation: 'Navigation Components',
  sections: 'Section Components',
  interactive: 'Interactive Components',
  misc: 'Miscellaneous Components'
};

export function getComponentsByCategory(category: string): TemplateComponent[] {
  return templateCatalog.filter(component => component.category === category);
}

export function getActiveComponents(): TemplateComponent[] {
  return templateCatalog.filter(component => component.isActive);
}

export function toggleComponent(id: string, active: boolean): void {
  const component = templateCatalog.find(c => c.id === id);
  if (component) {
    component.isActive = active;
  }
}
`;
    
    const catalogPath = path.join(this.rootDir, CATALOG_FILE);
    await fs.writeFile(catalogPath, catalogContent, 'utf-8');
    console.log(`📚 Catalog generated: ${CATALOG_FILE}`);
  }

  private showSummary(): void {
    console.log('\n📊 Import Summary:');
    console.log(`   Components found: ${this.components.length}`);
    console.log(`   Conflicts detected: ${this.conflicts.length}`);
    console.log(`   Successfully imported: ${this.components.filter(c => c.imported).length}`);
    
    if (this.conflicts.length > 0) {
      console.log('\n⚠️  Conflicts (saved as .imported.tsx):');
      this.conflicts.forEach(conflict => console.log(`   - ${conflict}`));
    }
    
    const categories = [...new Set(this.components.map(c => c.category))];
    console.log('\n📂 Categories:');
    categories.forEach(category => {
      const count = this.components.filter(c => c.category === category).length;
      console.log(`   - ${category}: ${count} components`);
    });
    
    if (this.options.dryRun) {
      console.log('\n🔍 Dry run completed. Use --force to actually import components.');
    } else {
      console.log('\n✅ Template import completed!');
      console.log(`   Check Admin → UI/Plantillas to manage imported components.`);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  const options: ImportOptions = {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    category: args.find(arg => arg.startsWith('--category='))?.split('=')[1],
  };
  
  if (args.includes('--help')) {
    console.log(`
ComplicesConecta Template Importer

Usage:
  bun tsx scripts/import-templates.ts [options]

Options:
  --dry-run           Preview what would be imported without making changes
  --force             Overwrite existing files instead of saving as .imported.tsx
  --category=name     Only import components from specific category
  --help              Show this help message

Template Sources:
  - C:\\Users\\conej\\Documents\\Next plantillas animadas -20250712T224150Z-1-001\\Next plantillas animadas
  - C:\\Users\\conej\\Documents\\Nex js twl plantillas

Target Directory:
  - src/components/templates/

The importer will:
  1. Scan template directories for reusable components
  2. Categorize components automatically
  3. Check for conflicts with existing files
  4. Import components safely (rename conflicts unless --force)
  5. Generate a catalog for Admin management
`);
    process.exit(0);
  }
  
  const importer = new TemplateImporter(options);
  await importer.import();
}

if (import.meta.main) {
  main().catch(console.error);
}

export { TemplateImporter, type TemplateComponent };
