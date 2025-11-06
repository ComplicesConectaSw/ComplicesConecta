# 🔍 Guía de Diagnóstico para Problemas de Carga en Vercel

**Fecha:** 2025-11-04  
**Estado:** 🔍 Guía de diagnóstico completa

---

## ✅ CORRECCIONES APLICADAS

### 1. ✅ Eliminado `eval()` de Importaciones Dinámicas
- **Archivo:** `src/utils/dynamicImports.ts`
- **Cambio:** Reemplazado `eval()` con `import()` directo

### 2. ✅ Eliminado Script Duplicado de Wallet Protection
- **Archivo:** `index.html`
- **Cambio:** Eliminado script duplicado en `<body>`

### 3. ✅ Eliminado Polyfill de `createContext` No Necesario
- **Archivo:** `index.html`
- **Cambio:** Eliminado polyfill incompatible

### 4. ✅ Corregido CSP en `vercel.json`
- **Cambio:** Agregados dominios permitidos necesarios

### 5. ✅ Corregido Terser para Conservar Logs
- **Archivo:** `vite.config.ts`
- **Cambio:** `drop_console: false` para mantener logs

### 6. ✅ Corregido Service Worker
- **Archivo:** `public/sw.js`
- **Cambio:** No intercepta chunks de Vite ni HTML principal

### 7. ✅ Mejorado Manejo de Errores en Supabase
- **Archivo:** `src/integrations/supabase/client.ts`
- **Cambio:** Try-catch completo con fallback a cliente placeholder

### 8. ✅ Separado React en Chunk `vendor-react`
- **Archivo:** `vite.config.ts`
- **Cambio:** React se carga primero, antes que `data-layer`

### 9. ✅ Optimizado QueryClient
- **Archivo:** `src/App.tsx`
- **Cambio:** Creado fuera del componente con configuración optimizada

### 10. ✅ Agregado Error Handler Global
- **Archivo:** `index.html`
- **Cambio:** Captura errores antes de que React se monte

### 11. ✅ Mejorado Logging de Errores
- **Archivo:** `src/main.tsx`
- **Cambio:** Muestra TODOS los errores para diagnóstico

---

## 🔍 PASOS PARA DIAGNOSTICAR EN VERCEL

### Paso 1: Verificar Build en Vercel

1. Ve a Vercel Dashboard → Tu proyecto → Deployments
2. Verifica que el build pasó sin errores
3. Si hay errores de build, revisa los logs

### Paso 2: Verificar Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables, verifica:

- ✅ `VITE_SUPABASE_URL` - Debe estar configurada
- ✅ `VITE_SUPABASE_ANON_KEY` - Debe estar configurada
- ✅ `NODE_ENV` - Debe ser `production` (o no configurada)

### Paso 3: Abrir Consola del Navegador

1. Abre la aplicación en Vercel
2. Abre DevTools (F12)
3. Ve a la pestaña Console
4. Busca errores en rojo

### Paso 4: Revisar Errores Específicos

**Errores comunes y soluciones:**

#### Error: "Cannot read properties of undefined (reading 'createContext')"
- **Causa:** Chunk `data-layer` se carga antes que React
- **Solución:** ✅ Ya aplicado - React en `vendor-react` separado

#### Error: "Failed to fetch" o "Network error"
- **Causa:** Variables de entorno no configuradas o incorrectas
- **Solución:** Verificar variables en Vercel Dashboard

#### Error: "Module not found" o "Cannot resolve module"
- **Causa:** Import roto o archivo faltante
- **Solución:** Revisar logs de build en Vercel

#### Error: "Unexpected token" o "Syntax error"
- **Causa:** Error de sintaxis en código
- **Solución:** Revisar logs de build

### Paso 5: Usar Sistema de Debugging

En la consola del navegador, ejecuta:

```javascript
// Ver reporte completo de carga
window.__LOADING_DEBUG__?.getReport()

// Verificar si React está disponible
window.React

// Verificar si React.createContext está disponible
window.React?.createContext

// Verificar errores en consola
console.error
```

### Paso 6: Revisar Network Tab

1. Abre DevTools → Network
2. Recarga la página
3. Verifica qué archivos fallan al cargar:
   - Chunks de JavaScript (`.js`)
   - Archivos CSS
   - Recursos estáticos

**Errores comunes:**
- `404` - Archivo no encontrado
- `500` - Error del servidor
- `CORS` - Problema de CORS
- `Blocked` - Bloqueado por CSP

### Paso 7: Verificar Service Worker

1. Abre DevTools → Application → Service Workers
2. Verifica si hay Service Worker activo
3. Si hay problemas, desregistra el Service Worker:
   - Click en "Unregister"
   - Recarga la página

### Paso 8: Verificar CSP

1. Abre DevTools → Network
2. Selecciona el documento principal (`/`)
3. Ve a Headers
4. Revisa `Content-Security-Policy`
5. Verifica si hay errores de CSP bloqueando recursos

---

## 🚨 PROBLEMAS MÁS COMUNES

### 1. Variables de Entorno No Configuradas

**Síntoma:** La aplicación carga pero no funciona correctamente

**Solución:**
1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Agrega las variables requeridas:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Redespliega la aplicación

### 2. Build Falla en Vercel

**Síntoma:** El deployment falla con errores

**Solución:**
1. Revisa los logs de build en Vercel
2. Verifica que `npm run build` funciona localmente
3. Revisa errores de TypeScript o linting
4. Verifica que todas las dependencias estén instaladas

### 3. Chunks No Cargan

**Síntoma:** La aplicación queda en loading indefinidamente

**Solución:**
1. Verifica Network tab para ver qué chunks fallan
2. Verifica que Service Worker no intercepte chunks
3. Verifica CSP para asegurar que permite cargar chunks
4. Limpia caché del navegador

### 4. Errores de CORS

**Síntoma:** Errores de CORS en consola

**Solución:**
1. Verifica que `vercel.json` tiene los headers correctos
2. Verifica que Supabase tiene CORS configurado
3. Verifica que las URLs son correctas

---

## 📋 CHECKLIST DE VERIFICACIÓN

### Antes de Deployar

- [ ] `npm run build` funciona localmente
- [ ] `npm run type-check` pasa sin errores
- [ ] `npm run lint` pasa sin errores
- [ ] No hay errores en consola local

### Después de Deployar

- [ ] Build pasa en Vercel
- [ ] Variables de entorno configuradas
- [ ] Aplicación carga en Vercel
- [ ] No hay errores en consola del navegador
- [ ] Chunks se cargan correctamente
- [ ] `window.__LOADING_DEBUG__` funciona

### Si No Carga

- [ ] Verificar errores en consola del navegador
- [ ] Verificar Network tab para archivos que fallan
- [ ] Verificar Service Worker
- [ ] Verificar CSP
- [ ] Verificar variables de entorno
- [ ] Revisar `window.__LOADING_DEBUG__.getReport()`

---

## 🔧 COMANDOS ÚTILES PARA DIAGNÓSTICO

### En Consola del Navegador

```javascript
// Ver reporte completo
window.__LOADING_DEBUG__?.getReport()

// Verificar React
window.React
window.React?.createContext
window.ReactDOM

// Verificar Supabase
window.supabase

// Verificar errores
console.error

// Limpiar caché y recargar
location.reload(true)
```

### En Terminal (Local)

```bash
# Build local
npm run build

# Preview local
npm run preview

# Verificar tipos
npm run type-check

# Verificar linting
npm run lint
```

---

## 📊 REPORTE DE ERRORES

Si la aplicación sigue sin cargar, proporciona:

1. **Errores en consola del navegador:**
   - Copia todos los errores en rojo
   - Incluye stack traces

2. **Reporte de carga:**
   ```javascript
   window.__LOADING_DEBUG__?.getReport()
   ```

3. **Network tab:**
   - Captura de pantalla de archivos que fallan
   - Códigos de estado HTTP

4. **Build logs en Vercel:**
   - Copia los logs del build
   - Incluye errores de build si los hay

5. **Variables de entorno:**
   - ¿Están configuradas? (solo nombres, no valores)
   - ¿Qué variables están configuradas?

---

**Última Actualización:** 2025-11-04  
**Estado:** ✅ Guía completa de diagnóstico

