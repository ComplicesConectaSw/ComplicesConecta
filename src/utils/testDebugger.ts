/**
 * 🐛 Test Debugger Utility - ComplicesConecta
 * Herramienta para debugging avanzado de tests fallidos
 */

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
    console.log(`\n🧪 [TEST START] ${testName}`);
    if (context) {
      console.log(`📋 Context:`, JSON.stringify(context, null, 2));
    }
  }

  logTestEnd(testName: string, success: boolean, result?: any) {
    const status = success ? '✅' : '❌';
    console.log(`\n${status} [TEST END] ${testName}`);
    if (result) {
      console.log(`📊 Result:`, JSON.stringify(result, null, 2));
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
    console.log(`🎭 [MOCK CALL] ${mockName}`, { args, returnValue });
  }

  // ❌ Error tracking con stack trace
  logError(testName: string, error: any, context?: any) {
    console.error(`\n💥 [ERROR] ${testName}`);
    console.error(`🔥 Error:`, error);
    console.error(`📍 Stack:`, error.stack);
    if (context) {
      console.error(`🔍 Context:`, JSON.stringify(context, null, 2));
    }
    this.errors.push({ test: testName, error, context });
  }

  // 🔬 Component state debugging
  logComponentState(componentName: string, state: any, props?: any) {
    console.log(`\n🎨 [COMPONENT] ${componentName}`);
    console.log(`📦 State:`, JSON.stringify(state, null, 2));
    if (props) {
      console.log(`⚙️ Props:`, JSON.stringify(props, null, 2));
    }
  }

  // 🌐 Supabase mock debugging
  logSupabaseMock(operation: string, table: string, data?: any, result?: any) {
    console.log(`\n🗄️ [SUPABASE MOCK] ${operation} on ${table}`);
    if (data) {
      console.log(`📝 Data:`, JSON.stringify(data, null, 2));
    }
    if (result) {
      console.log(`📋 Result:`, JSON.stringify(result, null, 2));
    }
  }

  // 🎣 Hook debugging
  logHookCall(hookName: string, params?: any, result?: any) {
    console.log(`\n🎣 [HOOK] ${hookName}`);
    if (params) {
      console.log(`📥 Params:`, JSON.stringify(params, null, 2));
    }
    if (result) {
      console.log(`📤 Result:`, JSON.stringify(result, null, 2));
    }
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

    console.log(`\n📊 [DEBUG REPORT]`);
    console.log(JSON.stringify(report, null, 2));
    
    return JSON.stringify(report, null, 2);
  }

  // 🧹 Limpiar estado
  reset() {
    this.testResults.clear();
    this.mockCalls.clear();
    this.errors = [];
    console.log(`\n🧹 [DEBUG RESET] Estado limpiado`);
  }

  // 🔍 Verificar mocks específicos
  verifyMockCalls(mockName: string, expectedCalls: number = 1): boolean {
    const calls = this.mockCalls.get(mockName) || [];
    const success = calls.length >= expectedCalls;
    
    console.log(`\n🔍 [MOCK VERIFY] ${mockName}`);
    console.log(`📞 Expected: ${expectedCalls}, Actual: ${calls.length}`);
    console.log(`${success ? '✅' : '❌'} Verification: ${success ? 'PASSED' : 'FAILED'}`);
    
    if (!success) {
      console.log(`📋 Available mocks:`, Array.from(this.mockCalls.keys()));
    }
    
    return success;
  }

  // 🎯 Debugging específico para ProfileReportsPanel
  debugProfileReportsPanel(component: any, expectedTexts: string[]) {
    console.log(`\n🎯 [PROFILE REPORTS DEBUG]`);
    console.log(`🔍 Looking for texts:`, expectedTexts);
    
    if (component && component.container) {
      console.log(`📄 Component HTML:`, component.container.innerHTML);
    }
    
    expectedTexts.forEach(text => {
      try {
        const _element = component.getByText(text);
        console.log(`✅ Found: "${text}"`);
      } catch (error) {
        console.log(`❌ Missing: "${text}"`);
        console.log(`🔍 Error:`, (error as Error).message);
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
