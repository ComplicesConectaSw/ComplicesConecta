# 🔍 Diagnóstico de Errores de Carga en Vercel

**Fecha:** 2025-11-04  
**Objetivo:** Identificar y corregir todos los errores que impiden que la aplicación cargue correctamente en Vercel

---

## 🚨 ERRORES CRÍTICOS ENCONTRADOS

### 1. ❌ **CSP (Content Security Policy) Bloqueando Scripts**

**Ubicación:** `vercel.json` línea 33

**Problema:**
```json
"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; ..."
```

**Riesgo:**
- El CSP puede estar bloqueando scripts de terceros (wallets, analytics)
- `'unsafe-eval'` está permitido, pero puede causar problemas con algunos navegadores
- Faltan dominios permitidos para recursos externos (CDNs, APIs)

**Solución:**
```json
"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.app https://*.supabase.co https://*.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https: wss: https://*.supabase.co https://*.googleapis.com; frame-src 'none';"
```

---

### 2. ❌ **Uso de `eval()` en Importaciones Dinámicas**

**Ubicación:** `src/utils/dynamicImports.ts` líneas 47, 78, 110, 143

**Problema:**
```typescript
const web3Module = await eval(`import('${moduleName}')`).catch(() => null);
```

**Riesgo:**
- `eval()` puede estar bloqueado por CSP incluso con `'unsafe-eval'`
- No es necesario usar `eval()` para importaciones dinámicas
- Puede causar errores de seguridad en algunos navegadores

**Solución:**
```typescript
// Reemplazar eval() con importación dinámica directa
const web3Module = await import('web3').catch(() => null);
```

**Archivos afectados:**
- `src/utils/dynamicImports.ts` - 4 funciones que usan `eval()`

---

### 3. ❌ **Scripts Duplicados de Protección de Wallet**

**Ubicación:** `index.html` - `<head>` (líneas 69-187) y `<body>` (líneas 201-299)

**Problema:**
- Dos scripts idénticos de protección de wallet
- Uno en `<head>` y otro en `<body>`
- Puede causar conflictos y ejecutar código dos veces
- Aumenta el tamaño del HTML innecesariamente

**Solución:**
- Eliminar el script duplicado en `<body>`
- Mantener solo el script en `<head>` que se ejecuta primero

---

### 4. ❌ **Service Worker Interceptando Recursos**

**Ubicación:** `public/sw.js` línea 251

**Problema:**
```javascript
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  // Intercepta TODOS los requests GET del mismo origen
});
```

**Riesgo:**
- El Service Worker intercepta todos los requests, incluyendo chunks de JavaScript
- Puede causar problemas de carga si el cache está corrupto
- Puede servir versiones antiguas de chunks

**Solución:**
- Agregar excepciones para chunks de Vite
- Verificar que los chunks no se cacheen en estrategia "Cache First"
- Agregar validación de versiones de chunks

---

### 5. ❌ **Terser Eliminando Console.log en Producción**

**Ubicación:** `vite.config.ts` líneas 178-180

**Problema:**
```typescript
pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
drop_console: true, // Eliminar console.log en producción
```

**Riesgo:**
- El sistema de logging `__LOADING_DEBUG__` depende de `console.log` en desarrollo
- En producción, los logs importantes pueden desaparecer
- Dificulta el debugging en producción

**Solución:**
```typescript
drop_console: false, // O hacer condicional
pure_funcs: [], // Eliminar esta línea
// O mejor: conservar console.error y console.warn
```

---

### 6. ❌ **Chunks de React Pueden Cargarse Antes de React Global**

**Ubicación:** `vite.config.ts` líneas 64-112

**Problema:**
- Los chunks pueden cargarse en orden diferente en Vercel vs local
- El chunk `data-layer` puede cargarse antes que `vendor` (que contiene React)
- Esto causa el error: `Cannot read properties of undefined (reading 'createContext')`

**Solución:**
- Asegurar que `vendor` (React) se carga primero
- Agregar `preload` en HTML para chunks críticos
- Usar `prefetch` para chunks no críticos

---

### 7. ❌ **Falta Preload de Chunks Críticos en HTML**

**Ubicación:** `index.html` - falta en `<head>`

**Problema:**
- No hay `<link rel="preload">` para chunks críticos
- El navegador no sabe qué chunks cargar primero
- Puede causar race conditions en la carga

**Solución:**
```html
<link rel="modulepreload" href="/assets/vendor-[hash].js" as="script">
<link rel="modulepreload" href="/assets/data-layer-[hash].js" as="script">
```

**Nota:** Los hashes se generan en build, necesitamos un script que los agregue automáticamente o usar un plugin de Vite.

---

### 8. ❌ **Variables de Entorno No Definidas en Vercel**

**Ubicación:** `src/config/sentry.config.ts`, `src/config/datadog-rum.config.ts`

**Problema:**
- Si las variables de entorno no están configuradas en Vercel, pueden causar errores
- Los servicios de monitoreo pueden fallar silenciosamente

**Solución:**
- Verificar que todas las variables de entorno estén configuradas en Vercel Dashboard
- Agregar validación y fallbacks en el código

---

### 9. ❌ **Error en Polyfill de React en index.html**

**Ubicación:** `index.html` líneas 54-67

**Problema:**
```javascript
window.__REACT_POLYFILL__.createContext = window.__REACT_POLYFILL__.createContext || function(defaultValue) {
  // Polyfill que no es compatible con React real
  var context = {
    _currentValue: defaultValue,
    Provider: null,
    Consumer: null
  };
  context.Provider = { _context: context };
  context.Consumer = { _context: context };
  return context;
};
```

**Riesgo:**
- Este polyfill no es compatible con React real
- Puede causar errores cuando React real se carga después
- Los providers pueden fallar al usar este polyfill

**Solución:**
- Eliminar el polyfill de `createContext` (no es necesario)
- Confiar en que React se carga antes de que se use `createContext`
- Asegurar que React está disponible globalmente antes de cualquier chunk

---

### 10. ❌ **Falta Manejo de Errores en Carga de Chunks**

**Ubicación:** `src/main.tsx` - falta manejo de errores de carga de chunks

**Problema:**
- Si un chunk falla al cargar, la aplicación no se monta
- No hay retry logic para chunks fallidos
- No hay fallback UI si un chunk crítico falla

**Solución:**
- Agregar retry logic para chunks fallidos
- Agregar fallback UI si chunks críticos fallan
- Agregar logging de errores de carga de chunks

---

## 🔧 SOLUCIONES PRIORITARIAS

### Prioridad 1 (Crítico - Bloquea Carga)

1. ✅ **Eliminar `eval()` de `dynamicImports.ts`**
   - Reemplazar con importación dinámica directa
   - Asegurar que funciona sin CSP restrictivo

2. ✅ **Eliminar script duplicado de wallet protection en `index.html`**
   - Mantener solo el script en `<head>`
   - Eliminar el script en `<body>`

3. ✅ **Corregir CSP en `vercel.json`**
   - Agregar dominios permitidos necesarios
   - Verificar que no bloquea recursos críticos

### Prioridad 2 (Alto - Puede Causar Errores)

4. ✅ **Corregir Service Worker para no interceptar chunks**
   - Agregar excepciones para chunks de Vite
   - Verificar estrategia de cache para chunks

5. ✅ **Asegurar que React se carga antes de chunks**
   - Agregar preload de chunk `vendor` en HTML
   - Verificar orden de carga en build

6. ✅ **Eliminar polyfill de `createContext` en `index.html`**
   - No es necesario y puede causar problemas
   - Confiar en que React se carga primero

### Prioridad 3 (Medio - Mejoras)

7. ✅ **Corregir Terser para no eliminar logs importantes**
   - Conservar `console.error` y `console.warn`
   - Hacer `drop_console` condicional

8. ✅ **Agregar manejo de errores en carga de chunks**
   - Retry logic para chunks fallidos
   - Fallback UI si chunks críticos fallan

---

## 📋 CHECKLIST DE CORRECCIONES

- [ ] Eliminar `eval()` de `src/utils/dynamicImports.ts`
- [ ] Eliminar script duplicado de wallet protection en `index.html`
- [ ] Corregir CSP en `vercel.json`
- [ ] Corregir Service Worker para no interceptar chunks
- [ ] Agregar preload de chunk `vendor` en HTML
- [ ] Eliminar polyfill de `createContext` en `index.html`
- [ ] Corregir Terser para no eliminar logs importantes
- [ ] Agregar manejo de errores en carga de chunks
- [ ] Verificar variables de entorno en Vercel Dashboard
- [ ] Probar en Vercel después de aplicar todas las correcciones

---

## 🧪 TESTING

Después de aplicar las correcciones:

1. **Build local:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Verificar en consola:**
   - No hay errores de CSP
   - No hay errores de `eval()`
   - No hay errores de `createContext`
   - Chunks se cargan en orden correcto

3. **Deploy en Vercel:**
   - Verificar que el build pasa
   - Verificar que la aplicación carga correctamente
   - Verificar que no hay errores en consola
   - Verificar que `__LOADING_DEBUG__` funciona

---

**Última Actualización:** 2025-11-04  
**Estado:** 🔍 Diagnóstico completo, pendiente aplicar correcciones

