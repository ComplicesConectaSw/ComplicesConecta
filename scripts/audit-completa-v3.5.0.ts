#!/usr/bin/env tsx
/**
 * 🔍 AUDITORÍA COMPLETA v3.5.0 - ComplicesConecta
 * 
 * Script de auditoría exhaustiva para apps sociales en fase beta
 * 
 * REGLAS DE SEGURIDAD:
 * - SOLO LECTURA: No modifica archivos ni código
 * - NO DESTRUCTIVO: No ejecuta operaciones destructivas
 * - VALIDACIÓN: Solo verifica y reporta
 * - REPORTE: Genera reporte HTML/JSON con resultados
 * 
 * @author ComplicesConecta DevOps Team
 * @version 3.5.0
 * @date 2025-11-02
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Configuración
const CONFIG = {
  projectRoot: PROJECT_ROOT,
  outputDir: join(PROJECT_ROOT, 'scripts', 'reports'),
  timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
  version: '3.5.0'
};

// Tipos
interface AuditResult {
  category: string;
  subcategory: string;
  check: string;
  status: 'pass' | 'fail' | 'warning' | 'skip';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  solution?: string;
  file?: string;
  line?: number;
}

interface AuditReport {
  timestamp: string;
  version: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    score: number; // 0-100
  };
  results: AuditResult[];
  categories: Record<string, {
    passed: number;
    failed: number;
    warnings: number;
    total: number;
    score: number;
  }>;
}

// Utilidades
function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function checkFileExists(path: string): boolean {
  return existsSync(join(PROJECT_ROOT, path));
}

function readJsonFile(path: string): any {
  try {
    const content = readFileSync(join(PROJECT_ROOT, path), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function readTextFile(path: string): string | null {
  try {
    return readFileSync(join(PROJECT_ROOT, path), 'utf-8');
  } catch {
    return null;
  }
}

function executeCommand(command: string, silent = false): { success: boolean; output?: string; error?: string } {
  try {
    const output = execSync(command, { 
      cwd: PROJECT_ROOT, 
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output: output.toString() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Auditorías
class CompleteAuditor {
  private results: AuditResult[] = [];

  // 1. ESTRUCTURA Y ORGANIZACIÓN
  auditStructure(): void {
    log('\n📁 [1] Auditing Structure and Organization...', 'info');
    
    // 1.1 Directorios críticos
    const criticalDirs = ['src', 'supabase', 'public', 'scripts', 'tests'];
    criticalDirs.forEach(dir => {
      const exists = checkFileExists(dir);
      this.addResult('1.1', 'Estructura de Directorios', `Directorio crítico: ${dir}`, exists ? 'pass' : 'fail', 
        'high', exists ? 'Existe' : `Falta directorio crítico: ${dir}`, 
        !exists ? `Crear directorio ${dir} según estándares del proyecto` : undefined);
    });

    // 1.2 Archivos de configuración
    const configFiles = ['package.json', 'tsconfig.json', 'vite.config.ts', '.gitignore'];
    configFiles.forEach(file => {
      const exists = checkFileExists(file);
      this.addResult('1.2', 'Archivos Configuración', `Archivo: ${file}`, exists ? 'pass' : 'fail',
        'critical', exists ? 'Existe' : `Falta archivo crítico: ${file}`,
        !exists ? `Crear ${file} con configuración estándar` : undefined, file);
    });
  }

  // 2. CÓDIGO Y CALIDAD
  auditCode(): void {
    log('\n💻 [2] Auditing Code Quality...', 'info');
    
    // 2.1 TypeScript
    const typeCheck = executeCommand('npm run type-check', true);
    this.addResult('2.1', 'TypeScript', 'TypeScript errors', typeCheck.success ? 'pass' : 'fail',
      'critical', typeCheck.success ? '0 errores TypeScript' : 'Errores TypeScript encontrados',
      !typeCheck.success ? 'Corregir errores TypeScript con `npm run type-check`' : undefined);

    // 2.2 Linting
    const lintCheck = executeCommand('npm run lint', true);
    this.addResult('2.2', 'Linting', 'ESLint errors', lintCheck.success ? 'pass' : 'warning',
      'high', lintCheck.success ? '0 errores linting' : 'Errores linting encontrados',
      !lintCheck.success ? 'Corregir errores linting con `npm run lint:fix`' : undefined);

    // 2.3 Package.json
    const pkg = readJsonFile('package.json');
    if (pkg) {
      this.addResult('2.3', 'Package.json', 'Package.json válido', 'pass', 'low', 'Archivo válido');
      
      // Verificar scripts críticos
      const criticalScripts = ['dev', 'build', 'test', 'type-check'];
      criticalScripts.forEach(script => {
        const exists = !!pkg.scripts?.[script];
        this.addResult('2.3', 'Package.json', `Script: ${script}`, exists ? 'pass' : 'fail',
          'medium', exists ? 'Existe' : `Falta script: ${script}`,
          !exists ? `Agregar script "${script}" en package.json` : undefined);
      });
    }
  }

  // 3. BASE DE DATOS
  auditDatabase(): void {
    log('\n🗄️ [3] Auditing Database...', 'info');
    
    // 3.1 Migraciones
    const migrationsDir = join(PROJECT_ROOT, 'supabase', 'migrations');
    let migrationCount = 0;
    if (existsSync(migrationsDir)) {
      try {
        const files = readdirSync(migrationsDir);
        migrationCount = files.filter(f => f.endsWith('.sql')).length;
      } catch {}
    }
    
    this.addResult('3.1', 'Migraciones', 'Migraciones existentes', migrationCount > 0 ? 'pass' : 'warning',
      'medium', `${migrationCount} migraciones encontradas`,
      migrationCount === 0 ? 'Verificar que existan migraciones en supabase/migrations/' : undefined);

    // 3.2 Configuración Supabase
    const supabaseConfig = checkFileExists('supabase/config.toml');
    this.addResult('3.2', 'Supabase Config', 'config.toml', supabaseConfig ? 'pass' : 'fail',
      'high', supabaseConfig ? 'Existe' : 'Falta configuración Supabase',
      !supabaseConfig ? 'Crear supabase/config.toml con configuración del proyecto' : undefined);
  }

  // 15. PRIVACIDAD Y PROTECCIÓN DE DATOS
  auditPrivacy(): void {
    log('\n🔒 [15] Auditing Privacy and Data Protection...', 'info');
    
    // 15.1 Política de privacidad
    const privacyPolicy = checkFileExists('legal/PRIVACY_POLICY.md');
    this.addResult('15.1', 'Privacy Policy', 'Política de privacidad', privacyPolicy ? 'pass' : 'fail',
      'critical', privacyPolicy ? 'Existe' : 'Falta política de privacidad',
      !privacyPolicy ? 'Crear legal/PRIVACY_POLICY.md con política completa' : undefined);

    // 15.2 Términos de servicio
    const terms = checkFileExists('legal/TERMS_OF_SERVICE.md');
    this.addResult('15.2', 'Terms of Service', 'Términos de servicio', terms ? 'pass' : 'fail',
      'critical', terms ? 'Existe' : 'Falta términos de servicio',
      !terms ? 'Crear legal/TERMS_OF_SERVICE.md con términos completos' : undefined);

    // 15.3 Variables de entorno sensibles
    const envExample = readTextFile('.env.example');
    if (envExample) {
      const hasSupabase = envExample.includes('VITE_SUPABASE');
      this.addResult('15.3', 'Environment Variables', 'Variables documentadas', hasSupabase ? 'pass' : 'warning',
        'medium', hasSupabase ? 'Variables documentadas' : 'Faltan variables en .env.example',
        !hasSupabase ? 'Documentar todas las variables en .env.example' : undefined);
    }
  }

  // 17. VERIFICACIÓN DE IDENTIDAD
  auditVerification(): void {
    log('\n✅ [17] Auditing Identity Verification...', 'info');
    
    // 17.1 World ID integration
    const worldIdHook = checkFileExists('src/hooks/useWorldID.ts');
    this.addResult('17.1', 'World ID', 'Hook useWorldID', worldIdHook ? 'pass' : 'skip',
      'medium', worldIdHook ? 'Existe' : 'No encontrado (opcional)',
      !worldIdHook ? 'Implementar integración World ID si es necesaria' : undefined);

    // 17.2 Sistema de verificación
    const verificationService = checkFileExists('src/services/VerificationService.ts') ||
                                 checkFileExists('src/services/UserVerificationService.ts');
    this.addResult('17.2', 'Verification System', 'Servicio de verificación', verificationService ? 'pass' : 'warning',
      'high', verificationService ? 'Existe' : 'No encontrado servicio de verificación',
      !verificationService ? 'Implementar servicio de verificación de identidad' : undefined);
  }

  // 18. MODERACIÓN
  auditModeration(): void {
    log('\n🛡️ [18] Auditing Content Moderation...', 'info');
    
    // 18.1 ContentModerationService
    const moderationService = checkFileExists('src/services/ContentModerationService.ts');
    this.addResult('18.1', 'Moderation Service', 'ContentModerationService', moderationService ? 'pass' : 'fail',
      'critical', moderationService ? 'Existe' : 'Falta servicio de moderación',
      !moderationService ? 'Crear ContentModerationService.ts con detección automática' : undefined);

    // 18.2 AdvancedModerationPanel
    const moderationPanel = checkFileExists('src/components/admin/AdvancedModerationPanel.tsx');
    this.addResult('18.2', 'Moderation Panel', 'AdvancedModerationPanel', moderationPanel ? 'pass' : 'warning',
      'high', moderationPanel ? 'Existe' : 'No encontrado panel de moderación',
      !moderationPanel ? 'Implementar panel de moderación avanzado para admins' : undefined);
  }

  // 20. CHAT Y MENSAJERÍA
  auditChat(): void {
    log('\n💬 [20] Auditing Chat System...', 'info');
    
    // 20.1 Chat components
    const chatComponents = [
      'src/components/chat/ChatRoom.tsx',
      'src/components/chat/MessageList.tsx'
    ];
    chatComponents.forEach(comp => {
      const exists = checkFileExists(comp);
      this.addResult('20.1', 'Chat Components', `Componente: ${comp}`, exists ? 'pass' : 'skip',
        'medium', exists ? 'Existe' : 'No encontrado',
        !exists ? `Implementar componente de chat: ${comp}` : undefined, comp);
    });

    // 20.2 Chat summaries
    const chatSummaryService = checkFileExists('src/lib/ai/chatSummaries.ts') ||
                               checkFileExists('src/services/ChatSummaryService.ts') ||
                               checkFileExists('src/services/ai/ChatSummaryService.ts');
    this.addResult('20.2', 'Chat Summaries', 'Servicio de resúmenes', chatSummaryService ? 'pass' : 'warning',
      'medium', chatSummaryService ? 'Existe' : 'No encontrado servicio de resúmenes',
      !chatSummaryService ? 'Implementar servicio de resúmenes de chat con IA' : undefined);
  }

  // 21. MATCHING
  auditMatching(): void {
    log('\n💕 [21] Auditing Matching System...', 'info');
    
    // 21.1 SmartMatchingService
    const matchingService = checkFileExists('src/services/SmartMatchingService.ts');
    this.addResult('21.1', 'Matching Service', 'SmartMatchingService', matchingService ? 'pass' : 'fail',
      'critical', matchingService ? 'Existe' : 'Falta servicio de matching',
      !matchingService ? 'Implementar SmartMatchingService.ts con algoritmo de matching' : undefined);

    // 21.2 AI Matching
    const aiMatching = checkFileExists('src/lib/ai/smartMatching.ts') ||
                      checkFileExists('src/services/AILayerService.ts');
    this.addResult('21.2', 'AI Matching', 'Servicio AI matching', aiMatching ? 'pass' : 'warning',
      'high', aiMatching ? 'Existe' : 'No encontrado servicio AI',
      !aiMatching ? 'Implementar servicio de matching con IA' : undefined);
  }

  // 23. MONETIZACIÓN
  auditMonetization(): void {
    log('\n💰 [23] Auditing Monetization...', 'info');
    
    // 23.1 Token system
    const tokenService = checkFileExists('src/services/TokenService.ts') ||
                        checkFileExists('src/services/TokenManagementService.ts');
    this.addResult('23.1', 'Token System', 'Servicio de tokens', tokenService ? 'pass' : 'warning',
      'medium', tokenService ? 'Existe' : 'No encontrado',
      !tokenService ? 'Implementar servicio de gestión de tokens CMPX/GTK' : undefined);

    // 23.2 Stripe integration
    const stripeConfig = readTextFile('.env.example');
    const hasStripe = stripeConfig?.includes('STRIPE') || stripeConfig?.includes('STRIPE_SECRET');
    this.addResult('23.2', 'Stripe Integration', 'Configuración Stripe', hasStripe ? 'pass' : 'skip',
      'medium', hasStripe ? 'Configurado' : 'No configurado (opcional)',
      !hasStripe ? 'Configurar Stripe para pagos premium si es necesario' : undefined);
  }

  // 24. MÉTRICAS
  auditMetrics(): void {
    log('\n📊 [24] Auditing Metrics...', 'info');
    
    // 24.1 Analytics Dashboard
    const analyticsDashboard = checkFileExists('src/components/admin/AnalyticsDashboard.tsx');
    this.addResult('24.1', 'Analytics Dashboard', 'AnalyticsDashboard', analyticsDashboard ? 'pass' : 'warning',
      'high', analyticsDashboard ? 'Existe' : 'No encontrado',
      !analyticsDashboard ? 'Implementar dashboard de analytics con métricas clave' : undefined);

    // 24.2 Performance Monitoring
    const perfMonitoring = checkFileExists('src/services/PerformanceMonitoringService.ts');
    this.addResult('24.2', 'Performance Monitoring', 'PerformanceMonitoringService', perfMonitoring ? 'pass' : 'warning',
      'medium', perfMonitoring ? 'Existe' : 'No encontrado',
      !perfMonitoring ? 'Implementar servicio de monitoreo de performance' : undefined);
  }

  // 25. MOBILE Y PWA
  auditMobile(): void {
    log('\n📱 [25] Auditing Mobile & PWA...', 'info');
    
    // 25.1 Service Worker
    const serviceWorker = checkFileExists('public/sw-notifications.js') ||
                         checkFileExists('public/service-worker.js');
    this.addResult('25.1', 'Service Worker', 'Service Worker', serviceWorker ? 'pass' : 'warning',
      'high', serviceWorker ? 'Existe' : 'No encontrado',
      !serviceWorker ? 'Implementar service worker para notificaciones push' : undefined);

    // 25.2 Manifest
    const manifest = checkFileExists('public/manifest.json');
    this.addResult('25.2', 'PWA Manifest', 'manifest.json', manifest ? 'pass' : 'warning',
      'medium', manifest ? 'Existe' : 'No encontrado',
      !manifest ? 'Crear manifest.json para PWA' : undefined);

    // 25.3 Android
    const androidDir = checkFileExists('android');
    this.addResult('25.3', 'Android App', 'Directorio android', androidDir ? 'pass' : 'skip',
      'low', androidDir ? 'Existe' : 'No encontrado (opcional)',
      !androidDir ? 'Configurar proyecto Android si es necesario' : undefined);
  }

  // Helper methods
  private addResult(
    category: string,
    subcategory: string,
    check: string,
    status: 'pass' | 'fail' | 'warning' | 'skip',
    severity: 'critical' | 'high' | 'medium' | 'low',
    message: string,
    solution?: string,
    file?: string,
    line?: number
  ): void {
    this.results.push({
      category,
      subcategory,
      check,
      status,
      severity,
      message,
      solution,
      file,
      line
    });
  }

  // Ejecutar todas las auditorías
  async run(): Promise<AuditReport> {
    log('\n🔍 INICIANDO AUDITORÍA COMPLETA v3.5.0', 'info');
    log('='.repeat(60), 'info');

    // Ejecutar todas las auditorías
    this.auditStructure();
    this.auditCode();
    this.auditDatabase();
    this.auditPrivacy();
    this.auditVerification();
    this.auditModeration();
    this.auditChat();
    this.auditMatching();
    this.auditMonetization();
    this.auditMetrics();
    this.auditMobile();

    // Calcular resumen
    const summary = this.calculateSummary();
    const categories = this.calculateCategories();

    return {
      timestamp: CONFIG.timestamp,
      version: CONFIG.version,
      summary,
      results: this.results,
      categories
    };
  }

  private calculateSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;
    const critical = this.results.filter(r => r.severity === 'critical').length;
    const high = this.results.filter(r => r.severity === 'high').length;
    const medium = this.results.filter(r => r.severity === 'medium').length;
    const low = this.results.filter(r => r.severity === 'low').length;

    // Calcular score (0-100)
    const score = total > 0 
      ? Math.round((passed / total) * 100)
      : 0;

    return {
      total,
      passed,
      failed,
      warnings,
      skipped,
      critical,
      high,
      medium,
      low,
      score
    };
  }

  private calculateCategories(): Record<string, any> {
    const categories: Record<string, any> = {};
    
    this.results.forEach(result => {
      if (!categories[result.category]) {
        categories[result.category] = {
          passed: 0,
          failed: 0,
          warnings: 0,
          total: 0,
          score: 0
        };
      }
      
      const cat = categories[result.category];
      cat.total++;
      if (result.status === 'pass') cat.passed++;
      else if (result.status === 'fail') cat.failed++;
      else if (result.status === 'warning') cat.warnings++;
      
      cat.score = cat.total > 0 ? Math.round((cat.passed / cat.total) * 100) : 0;
    });

    return categories;
  }
}

// Generar reportes
function generateHTMLReport(report: AuditReport): string {
  const criticalIssues = report.results.filter(r => r.status === 'fail' && r.severity === 'critical');
  const highIssues = report.results.filter(r => r.status === 'fail' && r.severity === 'high');
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auditoría Completa v${report.version} - ${new Date(report.timestamp).toLocaleDateString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 20px; }
    h2 { color: #555; margin-top: 30px; margin-bottom: 15px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
    .stat-card { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff; }
    .stat-card.critical { border-color: #dc3545; }
    .stat-card.warning { border-color: #ffc107; }
    .stat-card.success { border-color: #28a745; }
    .stat-value { font-size: 2em; font-weight: bold; color: #333; }
    .stat-label { color: #666; font-size: 0.9em; }
    .score { font-size: 3em; text-align: center; margin: 20px 0; }
    .score.high { color: #28a745; }
    .score.medium { color: #ffc107; }
    .score.low { color: #dc3545; }
    .issues { margin: 30px 0; }
    .issue { padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid; }
    .issue.critical { background: #fff5f5; border-color: #dc3545; }
    .issue.high { background: #fff8f0; border-color: #ff9800; }
    .issue.medium { background: #fffef0; border-color: #ffc107; }
    .issue.low { background: #f0f8ff; border-color: #2196f3; }
    .issue-header { font-weight: bold; margin-bottom: 8px; }
    .issue-message { color: #555; margin: 5px 0; }
    .issue-solution { background: #e8f5e9; padding: 10px; border-radius: 4px; margin-top: 10px; }
    .solution-label { font-weight: bold; color: #2e7d32; margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f8f9fa; font-weight: 600; }
    .status-pass { color: #28a745; font-weight: bold; }
    .status-fail { color: #dc3545; font-weight: bold; }
    .status-warning { color: #ffc107; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Auditoría Completa v${report.version}</h1>
    <p><strong>Fecha:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
    
    <div class="score ${report.summary.score >= 80 ? 'high' : report.summary.score >= 60 ? 'medium' : 'low'}">
      Puntuación: ${report.summary.score}/100
    </div>
    
    <div class="summary">
      <div class="stat-card success">
        <div class="stat-value">${report.summary.passed}</div>
        <div class="stat-label">✅ Aprobados</div>
      </div>
      <div class="stat-card critical">
        <div class="stat-value">${report.summary.failed}</div>
        <div class="stat-label">❌ Fallidos</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">${report.summary.warnings}</div>
        <div class="stat-label">⚠️ Advertencias</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${report.summary.total}</div>
        <div class="stat-label">📊 Total</div>
      </div>
    </div>
    
    ${criticalIssues.length > 0 ? `
    <h2>🔴 Problemas Críticos (${criticalIssues.length})</h2>
    <div class="issues">
      ${criticalIssues.map(issue => `
        <div class="issue critical">
          <div class="issue-header">[${issue.category}] ${issue.check}</div>
          <div class="issue-message">${issue.message}</div>
          ${issue.solution ? `
            <div class="issue-solution">
              <div class="solution-label">💡 Solución:</div>
              <div>${issue.solution}</div>
            </div>
          ` : ''}
          ${issue.file ? `<div style="margin-top: 5px; font-size: 0.9em; color: #666;">📄 ${issue.file}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${highIssues.length > 0 ? `
    <h2>🟠 Problemas de Alta Prioridad (${highIssues.length})</h2>
    <div class="issues">
      ${highIssues.map(issue => `
        <div class="issue high">
          <div class="issue-header">[${issue.category}] ${issue.check}</div>
          <div class="issue-message">${issue.message}</div>
          ${issue.solution ? `
            <div class="issue-solution">
              <div class="solution-label">💡 Solución:</div>
              <div>${issue.solution}</div>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    <h2>📊 Resultados por Categoría</h2>
    <table>
      <thead>
        <tr>
          <th>Categoría</th>
          <th>Aprobados</th>
          <th>Fallidos</th>
          <th>Advertencias</th>
          <th>Total</th>
          <th>Puntuación</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(report.categories).map(([cat, data]: [string, any]) => `
          <tr>
            <td>${cat}</td>
            <td class="status-pass">${data.passed}</td>
            <td class="status-fail">${data.failed}</td>
            <td class="status-warning">${data.warnings}</td>
            <td>${data.total}</td>
            <td><strong>${data.score}%</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h2>📝 Todos los Resultados</h2>
    <table>
      <thead>
        <tr>
          <th>Categoría</th>
          <th>Verificación</th>
          <th>Estado</th>
          <th>Severidad</th>
          <th>Mensaje</th>
        </tr>
      </thead>
      <tbody>
        ${report.results.map(r => `
          <tr>
            <td>${r.category}</td>
            <td>${r.check}</td>
            <td class="status-${r.status}">${r.status.toUpperCase()}</td>
            <td>${r.severity}</td>
            <td>${r.message}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}

// Main
async function main() {
  try {
    const auditor = new CompleteAuditor();
    const report = await auditor.run();

    // Crear directorio de reportes
    const fs = await import('fs');
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Guardar JSON
    const jsonPath = join(CONFIG.outputDir, `audit-${CONFIG.timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    log(`\n✅ Reporte JSON guardado: ${jsonPath}`, 'success');

    // Guardar HTML
    const htmlPath = join(CONFIG.outputDir, `audit-${CONFIG.timestamp}.html`);
    fs.writeFileSync(htmlPath, generateHTMLReport(report));
    log(`✅ Reporte HTML guardado: ${htmlPath}`, 'success');

    // Mostrar resumen
    log('\n' + '='.repeat(60), 'info');
    log(`📊 RESUMEN DE AUDITORÍA`, 'info');
    log(`Puntuación: ${report.summary.score}/100`, report.summary.score >= 80 ? 'success' : report.summary.score >= 60 ? 'warning' : 'error');
    log(`✅ Aprobados: ${report.summary.passed}`, 'success');
    log(`❌ Fallidos: ${report.summary.failed}`, report.summary.failed > 0 ? 'error' : 'success');
    log(`⚠️ Advertencias: ${report.summary.warnings}`, report.summary.warnings > 0 ? 'warning' : 'success');
    log(`🔴 Críticos: ${report.summary.critical}`, report.summary.critical > 0 ? 'error' : 'success');
    
    process.exit(report.summary.failed > 0 ? 1 : 0);
  } catch (error: any) {
    log(`❌ Error en auditoría: ${error.message}`, 'error');
    process.exit(1);
  }
}

main();

