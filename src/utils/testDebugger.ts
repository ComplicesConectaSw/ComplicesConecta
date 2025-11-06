/**
 * 🐛 Test Debugger Utility - ComplicesConecta
 * Herramienta para debugging avanzado de tests fallidos
 */

import { logger } from '@/lib/logger';

export class TestDebugger {
  private static instance: TestDebugger;
  private testResults: Map<string, any> = new Map();
  private mockCalls: Map<string, any[]> = new Map();
  private errors: Array<{ test: string; error: any; context: any }> = [];

  static getInstance(): TestDebugger {
    if (!TestDebugger.instance) {
      TestDebugger.instance = new TestDebugger();
    }
    return TestDebugger.instance;
  }

  // 🔍 Logging con contexto detallado
  logTestStart(testName: string, context?: any) {
    logger.debug(`🧪 [TEST START] ${testName}`, { context });
  }

  logTestEnd(testName: string, success: boolean, result?: any) {
    const status = success ? '✅' : '❌';
    if (success) {
      logger.debug(`${status} [TEST END] ${testName}`, { result });
    } else {
      logger.error(`${status} [TEST END] ${testName}`, { result });
    }
    this.testResults.set(testName, { success, result, timestamp: new Date() });
  }

  // 🎯 Mock tracking
  trackMockCall(mockName: string, args: any[], returnValue?: any) {
    const call = { args, returnValue, timestamp: new Date() };
    if (!this.mockCalls.has(mockName)) {
      this.mockCalls.set(mockName, []);
    }
    this.mockCalls.get(mockName)!.push(call);
    logger.debug(`🎭 [MOCK CALL] ${mockName}`, { args, returnValue });
  }

  // ❌ Error tracking con stack trace
  logError(testName: string, error: any, context?: any) {
    logger.error(`💥 [ERROR] ${testName}`, { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context 
    });
    this.errors.push({ test: testName, error, context });
  }

  // 🔬 Component state debugging
  logComponentState(componentName: string, state: any, props?: any) {
    logger.debug(`🎨 [COMPONENT] ${componentName}`, { state, props });
  }

  // 🌐 Supabase mock debugging
  logSupabaseMock(operation: string, table: string, data?: any, result?: any) {
    logger.debug(`🗄️ [SUPABASE MOCK] ${operation} on ${table}`, { data, result });
  }

  // 🎣 Hook debugging
  logHookCall(hookName: string, params?: any, result?: any) {
    logger.debug(`🎣 [HOOK] ${hookName}`, { params, result });
  }

  // 📊 Generar reporte de debugging
  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: this.testResults.size,
      passedTests: Array.from(this.testResults.values()).filter(r => r.success).length,
      failedTests: this.errors.length,
      mockCalls: Object.fromEntries(this.mockCalls),
      errors: this.errors,
      testResults: Object.fromEntries(this.testResults)
    };

    logger.info(`📊 [DEBUG REPORT]`, report);
    
    return JSON.stringify(report, null, 2);
  }

  // 🧹 Limpiar estado
  reset() {
    this.testResults.clear();
    this.mockCalls.clear();
    this.errors = [];
    logger.debug(`🧹 [DEBUG RESET] Estado limpiado`);
  }

  // 🔍 Verificar mocks específicos
  verifyMockCalls(mockName: string, expectedCalls: number = 1): boolean {
    const calls = this.mockCalls.get(mockName) || [];
    const success = calls.length >= expectedCalls;
    
    if (success) {
      logger.debug(`🔍 [MOCK VERIFY] ${mockName}`, { expected: expectedCalls, actual: calls.length, status: 'PASSED' });
    } else {
      logger.warn(`🔍 [MOCK VERIFY] ${mockName}`, { 
        expected: expectedCalls, 
        actual: calls.length, 
        status: 'FAILED',
        availableMocks: Array.from(this.mockCalls.keys())
      });
    }
    
    return success;
  }

  // 🎯 Debugging específico para ProfileReportsPanel
  debugProfileReportsPanel(component: any, expectedTexts: string[]) {
    logger.debug(`🎯 [PROFILE REPORTS DEBUG]`, { 
      expectedTexts,
      html: component?.container?.innerHTML 
    });
    
    expectedTexts.forEach(text => {
      try {
        const _element = component.getByText(text);
        logger.debug(`✅ Found: "${text}"`);
      } catch (error) {
        logger.warn(`❌ Missing: "${text}"`, { 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });
  }
}

// 🚀 Export singleton instance
export const testDebugger = TestDebugger.getInstance();

// 🎭 Enhanced mock helpers
export const createDebugMock = async (name: string, implementation?: any) => {
  const { vi } = await import('vitest');
  const mock = vi.fn(implementation);
  
  mock.mockImplementation((...args: any[]) => {
    const result = implementation ? implementation(...args) : undefined;
    testDebugger.trackMockCall(name, args, result);
    return result;
  });
  
  return mock;
};

// 🧪 Test wrapper con debugging automático
export const debugTest = (testName: string, testFn: () => void | Promise<void>) => {
  return async () => {
    testDebugger.logTestStart(testName);
    try {
      const result = await testFn();
      testDebugger.logTestEnd(testName, true, result);
      return result;
    } catch (error) {
      testDebugger.logError(testName, error);
      testDebugger.logTestEnd(testName, false);
      throw error;
    }
  };
};
