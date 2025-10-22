/**
 * Test de integración para verificar que los servicios funcionan con datos reales de Supabase
 * Este archivo puede ser ejecutado para probar la funcionalidad básica de cada servicio
 */

import { TokenAnalyticsService } from './TokenAnalyticsService';
import { postsService } from './postsService';
import { securityService } from './SecurityService';
import { coupleProfilesService } from './CoupleProfilesService';
import { referralTokensService } from './ReferralTokensService';
import { invitationsService } from './InvitationsService';

class IntegrationTester {
  private results: Array<{
    service: string;
    test: string;
    success: boolean;
    error?: string;
    duration: number;
  }> = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 Iniciando tests de integración con Supabase...\n');

    // Test TokenAnalyticsService
    await this.testTokenAnalyticsService();
    
    // Test PostsService
    await this.testPostsService();
    
    // Test SecurityService
    await this.testSecurityService();
    
    // Test CoupleProfilesService
    await this.testCoupleProfilesService();
    
    // Test ReferralTokensService
    await this.testReferralTokensService();
    
    // Test InvitationsService
    await this.testInvitationsService();

    // Mostrar resultados
    this.showResults();
  }

  private async testTokenAnalyticsService(): Promise<void> {
    console.log('📊 Probando TokenAnalyticsService...');
    
    const service = TokenAnalyticsService.getInstance();
    
    // Test 1: Generar métricas actuales
    await this.runTest('TokenAnalyticsService', 'generateCurrentMetrics', async () => {
      const result = await service.generateCurrentMetrics();
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }
      console.log('  ✅ Métricas generadas:', result.metrics);
    });

    // Test 2: Obtener analytics históricos
    await this.runTest('TokenAnalyticsService', 'getHistoricalAnalytics', async () => {
      const result = await service.getHistoricalAnalytics('daily', 5);
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }
      console.log('  ✅ Analytics históricos obtenidos:', result.analytics?.length || 0, 'registros');
    });
  }

  private async testPostsService(): Promise<void> {
    console.log('📝 Probando PostsService...');
    
    // Test 1: Obtener feed
    await this.runTest('PostsService', 'getFeed', async () => {
      const posts = await postsService.getFeed(0, 5);
      console.log('  ✅ Feed obtenido:', posts.length, 'posts');
    });

    // Test 2: Obtener comentarios (si hay posts)
    await this.runTest('PostsService', 'getComments', async () => {
      const posts = await postsService.getFeed(0, 1);
      if (posts.length > 0) {
        const comments = await postsService.getComments(posts[0].id, 0, 5);
        console.log('  ✅ Comentarios obtenidos:', comments.length, 'comentarios');
      } else {
        console.log('  ⚠️ No hay posts para probar comentarios');
      }
    });
  }

  private async testSecurityService(): Promise<void> {
    console.log('🛡️ Probando SecurityService...');
    
    const testUserId = 'test-user-id';
    
    // Test 1: Obtener logs de auditoría
    await this.runTest('SecurityService', 'getAuditLogs', async () => {
      const result = await securityService.getAuditLogs(testUserId, 5);
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }
      console.log('  ✅ Logs de auditoría obtenidos:', result.logs?.length || 0, 'registros');
    });

    // Test 2: Analizar actividad del usuario
    await this.runTest('SecurityService', 'analyzeUserActivity', async () => {
      const result = await securityService.analyzeUserActivity(testUserId, 'day');
      console.log('  ✅ Análisis de actividad completado:', result.riskLevel);
    });
  }

  private async testCoupleProfilesService(): Promise<void> {
    console.log('👫 Probando CoupleProfilesService...');
    
    // Test 1: Obtener perfiles de parejas
    await this.runTest('CoupleProfilesService', 'getCoupleProfiles', async () => {
      const profiles = await coupleProfilesService.getCoupleProfiles(0, 5);
      console.log('  ✅ Perfiles de parejas obtenidos:', profiles.length, 'perfiles');
    });

    // Test 2: Obtener estadísticas
    await this.runTest('CoupleProfilesService', 'getCoupleProfileStats', async () => {
      const stats = await coupleProfilesService.getCoupleProfileStats();
      console.log('  ✅ Estadísticas obtenidas:', stats.totalProfiles, 'perfiles totales');
    });
  }

  private async testReferralTokensService(): Promise<void> {
    console.log('🎁 Probando ReferralTokensService...');
    
    const testUserId = 'test-user-id';
    
    // Test 1: Generar código de referido
    await this.runTest('ReferralTokensService', 'generateReferralCode', async () => {
      const code = await referralTokensService.generateReferralCode(testUserId);
      console.log('  ✅ Código de referido generado:', code);
    });

    // Test 2: Obtener balance de referidos
    await this.runTest('ReferralTokensService', 'getUserReferralBalance', async () => {
      const balance = await referralTokensService.getUserReferralBalance(testUserId);
      if (balance) {
        console.log('  ✅ Balance obtenido:', balance.referral_code);
      } else {
        console.log('  ⚠️ No se pudo obtener balance (puede ser normal si no existe)');
      }
    });
  }

  private async testInvitationsService(): Promise<void> {
    console.log('📧 Probando InvitationsService...');
    
    // Test 1: Obtener invitaciones del usuario
    await this.runTest('InvitationsService', 'getUserInvitations', async () => {
      const invitations = await invitationsService.getUserInvitations(0, 5);
      console.log('  ✅ Invitaciones obtenidas:', invitations.length, 'invitaciones');
    });

    // Test 2: Obtener plantillas de invitación
    await this.runTest('InvitationsService', 'getInvitationTemplates', async () => {
      const templates = await invitationsService.getInvitationTemplates();
      console.log('  ✅ Plantillas obtenidas:', templates.length, 'plantillas');
    });
  }

  private async runTest(service: string, testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      this.results.push({
        service,
        test: testName,
        success: true,
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        service,
        test: testName,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      });
    }
  }

  private showResults(): void {
    console.log('\n📋 RESULTADOS DE TESTS DE INTEGRACIÓN');
    console.log('=====================================\n');

    const successfulTests = this.results.filter(r => r.success).length;
    const totalTests = this.results.length;
    const successRate = (successfulTests / totalTests) * 100;

    console.log(`✅ Tests exitosos: ${successfulTests}/${totalTests} (${successRate.toFixed(1)}%)`);
    console.log(`⏱️ Tiempo total: ${this.results.reduce((sum, r) => sum + r.duration, 0)}ms\n`);

    // Mostrar detalles por servicio
    const services = [...new Set(this.results.map(r => r.service))];
    
    services.forEach(service => {
      const serviceResults = this.results.filter(r => r.service === service);
      const serviceSuccess = serviceResults.filter(r => r.success).length;
      const serviceTotal = serviceResults.length;
      
      console.log(`${service}:`);
      serviceResults.forEach(result => {
        const status = result.success ? '✅' : '❌';
        const duration = `${result.duration}ms`;
        console.log(`  ${status} ${result.test} (${duration})`);
        if (!result.success && result.error) {
          console.log(`    Error: ${result.error}`);
        }
      });
      console.log(`  Resumen: ${serviceSuccess}/${serviceTotal} exitosos\n`);
    });

    if (successRate === 100) {
      console.log('🎉 ¡Todos los tests pasaron exitosamente!');
      console.log('🚀 Los servicios están listos para usar con datos reales de Supabase.');
    } else if (successRate >= 80) {
      console.log('⚠️ La mayoría de tests pasaron. Revisar los fallos antes de producción.');
    } else {
      console.log('❌ Varios tests fallaron. Revisar la configuración de Supabase.');
    }
  }
}

// Función para ejecutar los tests
export async function runIntegrationTests(): Promise<void> {
  const tester = new IntegrationTester();
  await tester.runAllTests();
}

// Ejecutar tests si se llama directamente
if (typeof window === 'undefined') {
  runIntegrationTests().catch(console.error);
}

export default IntegrationTester;
