// Mock para hCaptcha en tests headless - ComplicesConecta v3.0.0
// Evita errores en entornos sin interfaz gráfica

// Mock implementation para Playwright
const mockHCaptcha = {
  render: (container: string | HTMLElement, options: any) => {
    console.log('hCaptcha mock: render called', { container, options });
    return 'mock-widget-id';
  },
  
  execute: async (widgetId: string) => {
    console.log('hCaptcha mock: execute called', { widgetId });
    return 'mock-captcha-token';
  },
  
  reset: (widgetId?: string) => {
    console.log('hCaptcha mock: reset called', { widgetId });
  },
  
  remove: (widgetId: string) => {
    console.log('hCaptcha mock: remove called', { widgetId });
  },
  
  getResponse: (widgetId?: string) => {
    console.log('hCaptcha mock: getResponse called', { widgetId });
    return 'mock-captcha-response';
  }
};

// Setup mock for window.hcaptcha
Object.defineProperty(window, 'hcaptcha', {
  value: mockHCaptcha,
  writable: true,
  configurable: true
});

// Mock para el script de hCaptcha
const mockScript = document.createElement('script');
mockScript.src = 'https://js.hcaptcha.com/1/api.js';
mockScript.async = true;
mockScript.defer = true;

// Simular carga exitosa del script
setTimeout(() => {
  const event = new Event('load');
  mockScript.dispatchEvent(event);
}, 100);

export { mockHCaptcha };
export default mockHCaptcha;
