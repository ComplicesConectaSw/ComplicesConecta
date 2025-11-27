# 🎭 Reporte Detallado de Tests E2E Playwright

**Generado:** 27/9/2025, 3:14:16 a.m.
**Duración del análisis:** 399 segundos
**Sistema:** Playwright en Windows
**Comando ejecutado:** `npx playwright test --reporter=verbose`

## 📋 Resumen Ejecutivo E2E

| Métrica | Valor |
|---------|-------|
| Tests E2E totales | 188 |
| Tests fallidos | 112 |
| Tests pasados | 76 |
| Tasa de éxito | 40% |
| Patrones de error E2E | 1 |
| Código de salida | 1 |

## 📊 Estadísticas Detalladas E2E

### Estado General
🔴 **CRÍTICO**: 112 tests E2E fallando

### Distribución de Resultados
- ✅ **Pasados**: 76
- ❌ **Fallidos**: 112
- 📊 **Total**: 188

## ⚠️ Errores Específicos E2E Detectados

### Timeouts de Test

**Cantidad:** 136 errores

1. `Test timeout: 30000ms`
2. `Test timeout: 30000ms`
3. `Test timeout: 30000ms`
4. `Test timeout: 30000ms`
5. `Test timeout: 30000ms`
6. `Test timeout: 30000ms`
7. `Test timeout: 30000ms`
8. `Test timeout: 30000ms`
9. `Test timeout: 30000ms`
10. `Test timeout: 30000ms`
11. `Test timeout: 30000ms`
12. `Test timeout: 30000ms`
13. `Test timeout: 30000ms`
14. `Test timeout: 30000ms`
15. `Test timeout: 30000ms`
... y 121 errores más

## 🔍 Patrones de Error E2E Identificados

### 1. Timeouts de Test

- **Ocurrencias:** 136
- **Descripción:** Tests que exceden el tiempo límite configurado
- **Solución sugerida:** Optimizar tests o aumentar timeout en playwright.config.ts

## 📝 Salida Completa del Comando E2E

### Salida Principal E2E (stdout - últimos 25,000 caracteres)

```

Running 188 tests using 8 workers

  ✓    5 [chromium] › src\tests\e2e\accessibility.spec.ts:125:3 › Accessibility Tests › should have proper form labels (4.0s)
  ✓    6 [chromium] › src\tests\e2e\accessibility.spec.ts:88:3 › Accessibility Tests › should have sufficient color contrast (4.0s)
  ✓    4 [chromium] › src\tests\e2e\accessibility.spec.ts:60:3 › Accessibility Tests › should have alt text for images (4.1s)
  ✓    1 [chromium] › src\tests\e2e\accessibility.spec.ts:14:3 › Accessibility Tests › should have proper heading hierarchy (4.2s)
  ✘    8 [chromium] › src\tests\e2e\accessibility.spec.ts:144:3 › Accessibility Tests › should have accessible navigation landmarks (4.3s)
  ✘    3 [chromium] › src\tests\e2e\accessibility.spec.ts:72:3 › Accessibility Tests › should support keyboard navigation (4.3s)
  ✓   11 [chromium] › src\tests\e2e\accessibility.spec.ts:183:3 › Accessibility Tests › should have proper ARIA roles and properties (752ms)
  ✘    2 [chromium] › src\tests\e2e\accessibility.spec.ts:41:3 › Accessibility Tests › should have accessible buttons with proper labels (4.8s)
  ✘    7 [chromium] › src\tests\e2e\accessibility.spec.ts:107:3 › Accessibility Tests › should respect prefers-reduced-motion (4.8s)
  ✘   12 [chromium] › src\tests\e2e\accessibility.spec.ts:201:3 › Accessibility Tests › should be usable with screen reader (790ms)
  ✓    9 [chromium] › src\tests\e2e\accessibility.spec.ts:153:3 › Accessibility Tests › should have proper focus indicators (1.8s)
  ✓   10 [chromium] › src\tests\e2e\accessibility.spec.ts:170:3 › Accessibility Tests › should handle high contrast mode (1.8s)
  ✓   16 [chromium] › src\tests\e2e\accessibility.spec.ts:219:3 › Accessibility Tests › should have minimum touch target size (1.2s)
  ✘   17 [chromium] › src\tests\e2e\accessibility.spec.ts:234:3 › Accessibility Tests › should handle zoom up to 200% (1.4s)
  ✘   15 [chromium] › src\tests\e2e\admin-login.spec.ts:97:3 › Login de Administrador › debe denegar acceso a usuarios no admin (6.3s)
  ✘   13 [chromium] › src\tests\e2e\admin-login.spec.ts:8:3 › Login de Administrador › debe permitir login de admin con credenciales válidas (6.7s)
  ✘   24 [chromium] › src\tests\e2e\admin-login.spec.ts:166:3 › Login de Administrador › debe manejar errores de autenticación admin (7.5s)
  ✘   14 [chromium] › src\tests\e2e\admin-login.spec.ts:79:3 › Login de Administrador › debe permitir moderación de contenido (30.4s)
  ✘   20 [chromium] › src\tests\e2e\admin-login.spec.ts:57:3 › Login de Administrador › debe permitir gestión de usuarios (30.1s)
  ✘   21 [chromium] › src\tests\e2e\admin-login.spec.ts:113:3 › Login de Administrador › debe manejar logout de admin correctamente (30.1s)
  ✘   19 [chromium] › src\tests\e2e\admin-login.spec.ts:40:3 › Login de Administrador › debe mostrar estadísticas de usuarios (30.3s)
  ✘   18 [chromium] › src\tests\e2e\admin-login.spec.ts:23:3 › Login de Administrador › debe mostrar panel de administración completo (30.1s)
  ✘   23 [chromium] › src\tests\e2e\admin-login.spec.ts:149:3 › Login de Administrador › debe validar permisos específicos de admin (30.1s)
  ✘   25 [chromium] › src\tests\e2e\auth-flow.spec.ts:8:3 › Authentication Flow E2E Tests › should display login page initially (6.7s)
  ✘   22 [chromium] › src\tests\e2e\admin-login.spec.ts:131:3 › Login de Administrador › debe mostrar logs de actividad admin (30.5s)
  ✘   30 [chromium] › src\tests\e2e\auth-flow.spec.ts:45:3 › Authentication Flow E2E Tests › should toggle between login and register modes (6.9s)
  ✘   29 [chromium] › src\tests\e2e\auth-flow.spec.ts:59:3 › Authentication Flow E2E Tests › should validate password confirmation in register mode (30.3s)
  ✘   27 [chromium] › src\tests\e2e\auth-flow.spec.ts:16:3 › Authentication Flow E2E Tests › should show validation errors for invalid email (30.3s)
  ✘   28 [chromium] › src\tests\e2e\auth-flow.spec.ts:36:3 › Authentication Flow E2E Tests › should handle demo login successfully (30.3s)
  ✘   26 [chromium] › src\tests\e2e\auth-flow.spec.ts:26:3 › Authentication Flow E2E Tests › should show validation errors for short password (30.3s)
  ✘   32 [chromium] › src\tests\e2e\auth-flow.spec.ts:86:3 › Authentication Flow E2E Tests › should persist authentication across page reloads (30.3s)
  ✘   31 [chromium] › src\tests\e2e\auth-flow.spec.ts:73:3 › Authentication Flow E2E Tests › should handle logout correctly (30.3s)
  ✘   33 [chromium] › src\tests\e2e\auth-flow.spec.ts:98:3 › Authentication Flow E2E Tests › should handle session expiration (30.2s)
  ✘   34 [chromium] › src\tests\e2e\auth-flow.spec.ts:115:3 › Authentication Flow E2E Tests › should show loading state during authentication (30.2s)
  ✘   38 [chromium] › src\tests\e2e\auth.e2e.test.ts:9:3 › Authentication E2E Tests › should display login form by default (7.2s)
  ✓   42 [chromium] › src\tests\e2e\auth.e2e.test.ts:47:3 › Authentication E2E Tests › should attempt login with demo credentials (2.2s)
  ✘   40 [chromium] › src\tests\e2e\auth.e2e.test.ts:28:3 › Authentication E2E Tests › should show validation errors for empty fields (6.3s)
  ✘   41 [chromium] › src\tests\e2e\auth.e2e.test.ts:37:3 › Authentication E2E Tests › should show error for invalid email format (6.9s)
  ✘   44 [chromium] › src\tests\e2e\auth.e2e.test.ts:77:3 › Authentication E2E Tests › should handle hCaptcha widget (6.5s)
  ✘   45 [chromium] › src\tests\e2e\auth.e2e.test.ts:86:3 › Authentication E2E Tests › should redirect after successful login (7.5s)
  ✘   46 [chromium] › src\tests\e2e\auth.e2e.test.ts:108:3 › Authentication E2E Tests › should handle network errors gracefully (7.9s)
  ✘   36 [chromium] › src\tests\e2e\auth-flow.spec.ts:138:3 › Authentication Flow E2E Tests › should handle hCaptcha verification (30.3s)
  ✘   37 [chromium] › src\tests\e2e\auth-flow.spec.ts:154:3 › Authentication Flow E2E Tests › should validate required profile fields after registration (30.2s)
  ✘   35 [chromium] › src\tests\e2e\auth-flow.spec.ts:125:3 › Authentication Flow E2E Tests › should handle network errors gracefully (30.3s)
  ✓   52 [chromium] › src\tests\e2e\critical-flows.spec.ts:112:3 › Critical User Flows › Security Features - Android (1.8s)
  ✘   39 [chromium] › src\tests\e2e\auth.e2e.test.ts:17:3 › Authentication E2E Tests › should switch to register form (30.3s)
  ✘   49 [chromium] › src\tests\e2e\critical-flows.spec.ts:56:3 › Critical User Flows › Responsive Design Breakpoints (7.0s)
  ✘   50 [chromium] › src\tests\e2e\critical-flows.spec.ts:93:3 › Critical User Flows › Chat Basic Functionality (6.4s)
  ✘   43 [chromium] › src\tests\e2e\auth.e2e.test.ts:59:3 › Authentication E2E Tests › should complete registration flow (30.2s)
  ✘   48 [chromium] › src\tests\e2e\critical-flows.spec.ts:30:3 › Critical User Flows › Navigation Between Pages (7.0s)
  ✘   51 [chromium] › src\tests\e2e\critical-flows.spec.ts:76:3 › Critical User Flows › Profile Navigation and Functionality (7.2s)
  ✓   56 [chromium] › src\tests\e2e\critical-flows.spec.ts:156:3 › Critical User Flows › Error Handling and Fallbacks (3.2s)
  ✓   59 [chromium] › src\tests\e2e\cross-browser.spec.ts:45:5 › Compatibilidad Chrome Desktop › debería manejar CSS Grid y Flexbox correctamente (1.9s)
  ✘   53 [chromium] › src\tests\e2e\critical-flows.spec.ts:127:3 › Critical User Flows › Performance and Loading (8.6s)
  ✘   57 [chromium] › src\tests\e2e\critical-flows.spec.ts:177:3 › Mobile-Specific Tests › Touch Interactions (3.3s)
  ✓   58 [chromium] › src\tests\e2e\cross-browser.spec.ts:27:5 › Compatibilidad Chrome Desktop › debería cargar la página principal correctamente (4.0s)
  ✓   60 [chromium] › src\tests\e2e\cross-browser.spec.ts:67:5 › Compatibilidad Chrome Desktop › debería soportar características CSS modernas (1.7s)
  ✓   62 [chromium] › src\tests\e2e\cross-browser.spec.ts:135:5 › Compatibilidad Chrome Desktop › debería soportar animaciones CSS (745ms)
  ✓   61 [chromium] › src\tests\e2e\cross-browser.spec.ts:89:5 › Compatibilidad Chrome Desktop › debería funcionar la navegación táctil en móviles (2.0s)
  ✘   54 [chromium] › src\tests\e2e\critical-flows.spec.ts:141:3 › Critical User Flows › Accessibility Features (5.9s)
  ✘   55 [chromium] › src\tests\e2e\critical-flows.spec.ts:196:3 › Mobile-Specific Tests › Mobile Navigation Bottom Bar (5.9s)
  ✓   65 [chromium] › src\tests\e2e\cross-browser.spec.ts:199:5 › Compatibilidad Chrome Desktop › debería soportar APIs modernas del navegador (929ms)
  ✓   63 [chromium] › src\tests\e2e\cross-browser.spec.ts:149:5 › Compatibilidad Chrome Desktop › debería manejar media queries responsive (1.4s)
  ✓   64 [chromium] › src\tests\e2e\cross-browser.spec.ts:167:5 › Compatibilidad Chrome Desktop › debería funcionar localStorage y sessionStorage (1.1s)
  ✓   67 [chromium] › src\tests\e2e\cross-browser.spec.ts:258:5 › Compatibilidad Chrome Desktop › debería soportar modo oscuro/claro del sistema (885ms)
  ✓   66 [chromium] › src\tests\e2e\cross-browser.spec.ts:104:5 › Compatibilidad Chrome Desktop › debería manejar eventos de JavaScript correctamente (1.1s)
  ✓   70 [chromium] › src\tests\e2e\cross-browser.spec.ts:121:5 › Compatibilidad Chrome Desktop › debería cargar fuentes web correctamente (1.0s)
  ✓   73 [chromium] › src\tests\e2e\cross-browser.spec.ts:89:5 › Compatibilidad Firefox Desktop › debería funcionar la navegación táctil en móviles (162ms)
  ✓   71 [chromium] › src\tests\e2e\cross-browser.spec.ts:45:5 › Compatibilidad Firefox Desktop › debería manejar CSS Grid y Flexbox correctamente (752ms)
  ✘   68 [chromium] › src\tests\e2e\cross-browser.spec.ts:278:5 › Compatibilidad Chrome Desktop › debería funcionar con diferentes configuraciones de accesibilidad (683ms)
  ✓   72 [chromium] › src\tests\e2e\cross-browser.spec.ts:67:5 › Compatibilidad Firefox Desktop › debería soportar características CSS modernas (944ms)
  ✓   75 [chromium] › src\tests\e2e\cross-browser.spec.ts:121:5 › Compatibilidad Firefox Desktop › debería cargar fuentes web correctamente (567ms)
  ✓   74 [chromium] › src\tests\e2e\cross-browser.spec.ts:104:5 › Compatibilidad Firefox Desktop › debería manejar eventos de JavaScript correctamente (773ms)
  ✓   76 [chromium] › src\tests\e2e\cross-browser.spec.ts:149:5 › Compatibilidad Firefox Desktop › debería manejar media queries responsive (589ms)
  ✓   69 [chromium] › src\tests\e2e\cross-browser.spec.ts:27:5 › Compatibilidad Firefox Desktop › debería cargar la página principal correctamente (2.7s)
  ✓   80 [chromium] › src\tests\e2e\cross-browser.spec.ts:199:5 › Compatibilidad Firefox Desktop › debería soportar APIs modernas del navegador (1.6s)
  ✓   82 [chromium] › src\tests\e2e\cross-browser.spec.ts:234:5 › Compatibilidad Firefox Desktop › debería funcionar con diferentes resoluciones de pantalla (1.4s)
  ✓   78 [chromium] › src\tests\e2e\cross-browser.spec.ts:167:5 › Compatibilidad Firefox Desktop › debería funcionar localStorage y sessionStorage (1.9s)
  ✓   77 [chromium] › src\tests\e2e\cross-browser.spec.ts:234:5 › Compatibilidad Chrome Desktop › debería funcionar con diferentes resoluciones de pantalla (1.7s)
  ✓   79 [chromium] › src\tests\e2e\cross-browser.spec.ts:221:5 › Compatibilidad Chrome Desktop › debería manejar errores de red graciosamente (1.7s)
  ✘   47 [chromium] › src\tests\e2e\critical-flows.spec.ts:14:3 › Critical User Flows › Authentication Flow - Demo Mode (30.3s)
  ✓   81 [chromium] › src\tests\e2e\cross-browser.spec.ts:221:5 › Compatibilidad Firefox Desktop › debería manejar errores de red graciosamente (2.4s)
  ✓   87 [chromium] › src\tests\e2e\cross-browser.spec.ts:45:5 › Compatibilidad Safari Desktop › debería manejar CSS Grid y Flexbox correctamente (1.4s)
  ✓   88 [chromium] › src\tests\e2e\cross-browser.spec.ts:67:5 › Compatibilidad Safari Desktop › debería soportar características CSS modernas (1.5s)
  ✓   83 [chromium] › src\tests\e2e\cross-browser.spec.ts:258:5 › Compatibilidad Firefox Desktop › debería soportar modo oscuro/claro del sistema (2.0s)
  ✓   85 [chromium] › src\tests\e2e\cross-browser.spec.ts:135:5 › Compatibilidad Firefox Desktop › debería soportar animaciones CSS (1.1s)
  ✓   89 [chromium] › src\tests\e2e\cross-browser.spec.ts:104:5 › Compatibilidad Safari Desktop › debería manejar eventos de JavaScript correctamente (1.5s)
  ✘   84 [chromium] › src\tests\e2e\cross-browser.spec.ts:278:5 › Compatibilidad Firefox Desktop › debería funcionar con diferentes configuraciones de accesibilidad (2.2s)
  ✓   92 [chromium] › src\tests\e2e\cross-browser.spec.ts:149:5 › Compatibilidad Safari Desktop › debería manejar media queries responsive (664ms)
  ✓   90 [chromium] › src\tests\e2e\cross-browser.spec.ts:121:5 › Compatibilidad Safari Desktop › debería cargar fuentes web correctamente (1.0s)
  ✓   91 [chromium] › src\tests\e2e\cross-browser.spec.ts:135:5 › Compatibilidad Safari Desktop › debería soportar animaciones CSS (1.1s)
  ✓   94 [chromium] › src\tests\e2e\cross-browser.spec.ts:199:5 › Compatibilidad Safari Desktop › debería soportar APIs modernas del navegador (581ms)
  ✓   93 [chromium] › src\tests\e2e\cross-browser.spec.ts:167:5 › Compatibilidad Safari Desktop › debería funcionar localStorage y sessionStorage (666ms)
  ✓   96 [chromium] › src\tests\e2e\cross-browser.spec.ts:89:5 › Compatibilidad Safari Desktop › debería funcionar la navegación táctil en móviles (367ms)
  ✓   86 [chromium] › src\tests\e2e\cross-browser.spec.ts:27:5 › Compatibilidad Safari Desktop › debería cargar la página principal correctamente (3.4s)
  ✓   97 [chromium] › src\tests\e2e\cross-browser.spec.ts:258:5 › Compatibilidad Safari Desktop › debería soportar modo oscuro/claro del sistema (1.3s)
  ✓   95 [chromium] › src\tests\e2e\cross-browser.spec.ts:234:5 › Compatibilidad Safari Desktop › debería funcionar con diferentes resoluciones de pantalla (1.6s)
  ✘  100 [chromium] › src\tests\e2e\cross-browser.spec.ts:45:5 › Compatibilidad Chrome Mobile › debería manejar CSS Grid y Flexbox correctamente (1.2s)
  ✘   98 [chromium] › src\tests\e2e\cross-browser.spec.ts:278:5 › Compatibilidad Safari Desktop › debería funcionar con diferentes configuraciones de accesibilidad (788ms)
  ✓  101 [chromium] › src\tests\e2e\cross-browser.spec.ts:67:5 › Compatibilidad Chrome Mobile › debería soportar características CSS modernas (1.5s)
  ✓  103 [chromium] › src\tests\e2e\cross-browser.spec.ts:104:5 › Compatibilidad Chrome Mobile › debería manejar eventos de JavaScript correctamente (908ms)
  ✘  102 [chromium] › src\tests\e2e\cross-browser.spec.ts:89:5 › Compatibilidad Chrome Mobile › debería funcionar la navegación táctil en móviles (849ms)
  ✓  104 [chromium] › src\tests\e2e\cross-browser.spec.ts:121:5 › Compatibilidad Chrome Mobile › debería cargar fuentes web correctamente (812ms)
  ✓  106 [chromium] › src\tests\e2e\cross-browser.spec.ts:199:5 › Compatibilidad Chrome Mobile › debería soportar APIs modernas del navegador (536ms)
  ✓  105 [chromium] › src\tests\e2e\cross-browser.spec.ts:167:5 › Compatibilidad Chrome Mobile › debería funcionar localStorage y sessionStorage (712ms)
  ✓   99 [chromium] › src\tests\e2e\cross-browser.spec.ts:27:5 › Compatibilidad Chrome Mobile › debería cargar la página principal correctamente (2.8s)
  ✓  107 [chromium] › src\tests\e2e\cross-browser.spec.ts:234:5 › Compatibilidad Chrome Mobile › debería funcionar con diferentes resoluciones de pantalla (1.1s)
  ✓  109 [chromium] › src\tests\e2e\cross-browser.spec.ts:258:5 › Compatibilidad Chrome Mobile › debería soportar modo oscuro/claro del sistema (715ms)
  ✘  110 [chromium] › src\tests\e2e\cross-browser.spec.ts:278:5 › Compatibilidad Chrome Mobile › debería funcionar con diferentes configuraciones de accesibilidad (689ms)
  ✓  113 [chromium] › src\tests\e2e\cross-browser.spec.ts:67:5 › Compatibilidad Safari Mobile › debería soportar características CSS modernas (830ms)
  ✓  108 [chromium] › src\tests\e2e\cross-browser.spec.ts:221:5 › Compatibilidad Safari Desktop › debería manejar errores de red graciosamente (1.9s)
  ✘  112 [chromium] › src\tests\e2e\cross-browser.spec.ts:45:5 › Compatibilidad Safari Mobile › debería manejar CSS Grid y Flexbox correctamente (917ms)
  ✓  116 [chromium] › src\tests\e2e\cross-browser.spec.ts:104:5 › Compatibilidad Safari Mobile › debería manejar eventos de JavaScript correctamente (1.3s)
  ✓  111 [chromium] › src\tests\e2e\cross-browser.spec.ts:27:5 › Compatibilidad Safari Mobile › debería cargar la página principal correctamente (2.8s)
  ✓  118 [chromium] › src\tests\e2e\cross-browser.spec.ts:121:5 › Compatibilidad Safari Mobile › debería cargar fuentes web correctamente (1.4s)
  ✓  114 [chromium] › src\tests\e2e\cross-browser.spec.ts:135:5 › Compatibilidad Chrome Mobile › debería soportar animaciones CSS (893ms)
  ✓  115 [chromium] › src\tests\e2e\cross-browser.spec.ts:149:5 › Compatibilidad Chrome Mobile › debería manejar media queries responsive (811ms)
  ✓  120 [chromium] › src\tests\e2e\cross-browser.spec.ts:167:5 › Compatibilidad Safari Mobile › debería funcionar localStorage y sessionStorage (540ms)
  ✓  121 [chromium] › src\tests\e2e\cross-browser.spec.ts:199:5 › Compatibilidad Safari Mobile › debería soportar APIs modernas del navegador (602ms)
  ✓  119 [chromium] › src\tests\e2e\cross-browser.spec.ts:149:5 › Compatibilidad Safari Mobile › debería manejar media queries responsive (942ms)
  ✓  117 [chromium] › src\tests\e2e\cross-browser.spec.ts:221:5 › Compatibilidad Chrome Mobile › debería manejar errores de red graciosamente (1.8s)
  ✓  124 [chromium] › src\tests\e2e\cross-browser.spec.ts:234:5 › Compatibilidad Safari Mobile › debería funcionar con diferentes resoluciones de pantalla (1.4s)
  ✓  125 [chromium] › src\tests\e2e\cross-browser.spec.ts:135:5 › Compatibilidad Safari Mobile › debería soportar animaciones CSS (1.1s)
  ✓  122 [chromium] › src\tests\e2e\cross-browser.spec.ts:221:5 › Compatibilidad Safari Mobile › debería manejar errores de red graciosamente (1.8s)
  ✓  126 [chromium] › src\tests\e2e\cross-browser.spec.ts:258:5 › Compatibilidad Safari Mobile › debería soportar modo oscuro/claro del sistema (1.5s)
  ✘  127 [chromium] › src\tests\e2e\cross-browser.spec.ts:278:5 › Compatibilidad Safari Mobile › debería funcionar con diferentes configuraciones de accesibilidad (956ms)
  ✘  123 [chromium] › src\tests\e2e\cross-browser.spec.ts:89:5 › Compatibilidad Safari Mobile › debería funcionar la navegación táctil en móviles (1.3s)
Características del navegador: {
  webgl: [33mtrue[39m,
  webgl2: [33mtrue[39m,
  webp: [33mtrue[39m,
  flexbox: [33mtrue[39m,
  grid: [33mtrue[39m,
  customProperties: [33mtrue[39m,
  backdropFilter: [33mtrue[39m,
  clipPath: [33mtrue[39m,
  objectFit: [33mtrue[39m
}
  ✓  128 [chromium] › src\tests\e2e\cross-browser.spec.ts:302:3 › Verificación de características del navegador › debería detectar características soportadas (1.5s)
  ✘  130 [chromium] › src\tests\e2e\images.spec.ts:22:3 › Sistema de Imágenes › debe subir imagen a galería personal (30.3s)
  ✘  132 [chromium] › src\tests\e2e\images.spec.ts:80:3 › Sistema de Imágenes › debe ver imágenes públicas de otros usuarios (30.1s)
  ✘  129 [chromium] › src\tests\e2e\images.spec.ts:14:3 › Sistema de Imágenes › debe mostrar galería de perfil (30.3s)
  ✘  131 [chromium] › src\tests\e2e\images.spec.ts:45:3 › Sistema de Imágenes › debe configurar imagen como privada (30.2s)
  ✘  134 [chromium] › src\tests\e2e\images.spec.ts:129:3 › Sistema de Imágenes › debe validar tipos de archivo permitidos (30.1s)
  ✘  133 [chromium] › src\tests\e2e\images.spec.ts:64:3 › Sistema de Imágenes › debe eliminar imagen de galería (30.2s)
  ✘  136 [chromium] › src\tests\e2e\images.spec.ts:111:3 › Sistema de Imágenes › debe aprobar solicitud de acceso a galería (30.3s)
  ✘  135 [chromium] › src\tests\e2e\images.spec.ts:92:3 › Sistema de Imágenes › debe solicitar acceso a imágenes privadas (30.3s)
  ✘  138 [chromium] › src\tests\e2e\images.spec.ts:205:3 › Sistema de Imágenes › debe generar miniaturas automáticamente (30.2s)
  ✘  140 [chromium] › src\tests\e2e\images.spec.ts:223:3 › Sistema de Imágenes › debe permitir reordenar imágenes (30.1s)
  ✘  141 [chromium] › src\tests\e2e\images.spec.ts:162:3 › Sistema de Imágenes › debe mostrar progreso de carga (30.3s)
  ✘  144 [chromium] › src\tests\e2e\navigation.spec.ts:4:3 › Navigation and Authentication › should navigate to main pages without authentication (3.9s)
  ✘  139 [chromium] › src\tests\e2e\images.spec.ts:243:3 › Sistema de Imágenes › debe establecer imagen de perfil principal (30.4s)
  ✘  137 [chromium] › src\tests\e2e\images.spec.ts:186:3 › Sistema de Imágenes › debe comprimir imágenes automáticamente (30.3s)
  ✘  142 [chromium] › src\tests\e2e\images.spec.ts:145:3 › Sistema de Imágenes › debe validar tamaño máximo de archivo (30.2s)
  ✘  148 [chromium] › src\tests\e2e\navigation.spec.ts:38:3 › Navigation and Authentication › should show authenticated navigation after login (467ms)
  ✘  147 [chromium] › src\tests\e2e\navigation.spec.ts:56:3 › Navigation and Authentication › should handle 404 errors gracefully (1.5s)
  ✘  146 [chromium] › src\tests\e2e\navigation.spec.ts:67:3 › Navigation and Authentication › should navigate between main sections (691ms)
  ✘  150 [chromium] › src\tests\e2e\profile-management.spec.ts:17:3 › Profile Management › should navigate to single profile edit page (6.6s)
  ✓  152 [chromium] › src\tests\e2e\profile-management.spec.ts:78:3 › Profile Management › should handle location updates (1.2s)
  ✘  151 [chromium] › src\tests\e2e\profile-management.spec.ts:44:3 › Profile Management › should validate required fields (6.8s)
  ✘  153 [chromium] › src\tests\e2e\profile-management.spec.ts:58:3 › Profile Management › should navigate to couple profile edit page (6.9s)
  ✘  143 [chromium] › src\tests\e2e\images.spec.ts:259:3 › Sistema de Imágenes › debe manejar errores de carga de imágenes (30.2s)
  ✘  149 [chromium] › src\tests\e2e\profile-management.spec.ts:29:3 › Profile Management › should update profile information (30.6s)
  ✘  145 [chromium] › src\tests\e2e\navigation.spec.ts:21:3 › Navigation and Authentication › should handle demo authentication flow (30.7s)
  ✘  154 [chromium] › src\tests\e2e\realtime-chat.spec.ts:13:3 › Realtime Chat E2E Tests › should display chat interface after login (30.2s)
  ✘  155 [chromium] › src\tests\e2e\realtime-chat.spec.ts:34:3 › Realtime Chat E2E Tests › should show typing indicators (30.4s)
  ✘  156 [chromium] › src\tests\e2e\realtime-chat.spec.ts:20:3 › Realtime Chat E2E Tests › should send and receive messages in real-time (31.2s)
  ✘  157 [chromium] › src\tests\e2e\realtime-chat.spec.ts:43:3 › Realtime Chat E2E Tests › should display message timestamps (31.0s)
  ✘  158 [chromium] › src\tests\e2e\realtime-chat.spec.ts:57:3 › Realtime Chat E2E Tests › should handle connection status (30.2s)
  ✘  159 [chromium] › src\tests\e2e\realtime-chat.spec.ts:65:3 › Realtime Chat E2E Tests › should load chat history on page load (30.4s)
  ✘  165 [chromium] › src\tests\e2e\registration.spec.ts:8:3 › Registro de Usuario › debe mostrar formulario de registro (6.3s)
  ✓  168 [chromium] › src\tests\e2e\registration.spec.ts:73:3 › Registro de Usuario › debe validar campos requeridos (2.8s)
  ✘  161 [chromium] › src\tests\e2e\realtime-chat.spec.ts:102:3 › Realtime Chat E2E Tests › should handle long messages correctly (30.7s)
  ✘  160 [chromium] › src\tests\e2e\realtime-chat.spec.ts:78:3 › Realtime Chat E2E Tests › should handle message reactions (30.4s)
  ✓  169 [chromium] › src\tests\e2e\registration.spec.ts:82:3 › Registro de Usuario › debe validar formato de email (1.7s)
  ✘  162 [chromium] › src\tests\e2e\realtime-chat.spec.ts:113:3 › Realtime Chat E2E Tests › should prevent sending empty messages (30.2s)
  ✘  163 [chromium] › src\tests\e2e\realtime-chat.spec.ts:122:3 › Realtime Chat E2E Tests › should handle emoji in messages (30.2s)
  ✘  170 [chromium] › src\tests\e2e\registration.spec.ts:109:3 › Registro de Usuario › debe alternar entre login y registro (6.8s)
  ✘  171 [chromium] › src\tests\e2e\registration.spec.ts:104:3 › Registro de Usuario › debe mostrar términos y condiciones (6.1s)
  ✘  164 [chromium] › src\tests\e2e\registration.spec.ts:15:3 › Registro de Usuario › debe registrar usuario single exitosamente (30.2s)
  ✘  166 [chromium] › src\tests\e2e\registration.spec.ts:34:3 › Registro de Usuario › debe registrar usuario couple exitosamente (30.1s)
  ✘  167 [chromium] › src\tests\e2e\registration.spec.ts:57:3 › Registro de Usuario › debe validar email único (30.3s)
  ✘  173 [chromium] › src\tests\e2e\registration.spec.ts:122:3 › Registro de Usuario › debe manejar errores de red (30.1s)
  ✘  172 [chromium] › src\tests\e2e\registration.spec.ts:92:3 › Registro de Usuario › debe validar longitud mínima de contraseña (30.1s)
  ✘  174 [chromium] › src\tests\e2e\registration.spec.ts:138:3 › Registro de Usuario › debe mostrar indicador de carga durante registro (30.1s)
  ✘  175 [chromium] › src\tests\e2e\requests.spec.ts:14:3 › Sistema
```

## 🎯 Plan de Acción E2E Recomendado

### Prioridad Crítica 🚨

1. **Corregir timeouts de navegación**
   - Aumentar timeout en playwright.config.ts si es necesario
   - Optimizar tiempo de carga de páginas
   - Verificar que el servidor de desarrollo esté corriendo

2. **Corregir selectores de elementos**
   - Verificar que los elementos existan en el DOM
   - Usar data-testid para elementos específicos
   - Agregar waitFor() antes de interactuar con elementos

### Prioridad Alta 🔥

3. **Optimizar aserciones E2E**
   - Usar expect().toBeVisible() en lugar de expect().toBeTruthy()
   - Agregar waitFor() para condiciones asíncronas
   - Verificar que las condiciones sean realistas

4. **Verificar configuración de navegadores**
   - Ejecutar: npx playwright install
   - Verificar permisos del sistema
   - Revisar configuración en playwright.config.ts

### Prioridad Media 📋

5. **Mejorar estabilidad de tests**
   - Agregar page.waitForLoadState('networkidle')
   - Usar locators más específicos
   - Implementar retry logic para elementos dinámicos

## 🛠️ Comandos Útiles para Depuración E2E

### Ejecutar test E2E específico
```bash
npx playwright test src/tests/e2e/[nombre-test].spec.ts --reporter=verbose
```

### Ejecutar test E2E en modo debug
```bash
npx playwright test --debug src/tests/e2e/[nombre-test].spec.ts
```

### Ejecutar test E2E con UI mode
```bash
npx playwright test --ui
```

### Ver reporte HTML de Playwright
```bash
npx playwright show-report
```

### Instalar navegadores de Playwright
```bash
npx playwright install
```

### Re-ejecutar este análisis E2E
```bash
node scripts/depurador-e2e-mx.cjs
```


---
*Reporte generado automáticamente por DepuradorE2EMX*
*Fecha: 2025-09-27T09:14:16.116Z*
*Duración: 399 segundos*
