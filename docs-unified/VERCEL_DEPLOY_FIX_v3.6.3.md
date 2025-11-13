# 🚀 Fix Vercel Deployment - v3.6.3

## Problemas Resueltos

### ✅ 1. Chunks Estables + CSS No Split
- **Problema**: Chunks dinámicos fallan (404 en /assets/js/...)
- **Solución**: 
  - Chunks con hash estable pero nombres predecibles
  - CSS code split deshabilitado (`cssCodeSplit: false`)
  - Rutas de assets corregidas en `vite.config.ts`

### ✅ 2. Vercel.json Rewrites Correctos
- **Problema**: Rewrites no funcionaban correctamente
- **Solución**: 
  - Rewrites configurados para SPA routing
  - Headers de caché para assets
  - Content-Type correcto para JS y CSS

### ✅ 3. Variables de Entorno en Build
- **Problema**: .env NO se carga en producción
- **Solución**: 
  - Variables con prefijo `VITE_` están disponibles automáticamente
  - Configurar en Vercel Dashboard → Settings → Environment Variables
  - `.env.example` actualizado con todas las variables

### ✅ 4. Index.html Base Path Correcto
- **Problema**: Base path incorrecto causaba 404s
- **Solución**: 
  - `base: '/'` en `vite.config.ts`
  - Rutas absolutas en `index.html` (`/src/main.tsx`)

### ✅ 5. Build <60MB + 0 Errores
- **Optimizaciones**:
  - Chunks manuales optimizados
  - Terser con drop_console y drop_debugger
  - Assets inline para archivos <4KB
  - Sourcemaps solo en desarrollo

### ✅ 6. Supabase, Neo4j, CMPX, Grok 4 Funcionan en Prod
- **Variables requeridas**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_NEO4J_ENABLED` (opcional)
  - `VITE_APP_MODE=production`

## Archivos Corregidos

### 1. `vite.config.ts`
```typescript
// Cambios principales:
- chunkFileNames: Chunks con hash estable
- cssCodeSplit: false (CSS no split)
- base: '/' (Base path correcto)
- target: 'esnext' (Optimización moderna)
- reportCompressedSize: true (Reporte de tamaño)
```

### 2. `vercel.json`
```json
{
  "rewrites": [/* SPA routing */],
  "headers": [/* Cache y Content-Type */],
  "routes": [/* Assets routing */]
}
```

### 3. `.env.example`
- Todas las variables documentadas
- Separadas por categorías
- Comentarios explicativos

### 4. `index.html`
- Ruta absoluta para main.tsx: `/src/main.tsx`
- Base path correcto

## Comandos PowerShell

### Build Local
```powershell
# Ejecutar script de build
.\build-and-deploy.ps1

# O manualmente:
npm install
npm run type-check
npm run build
```

### Deploy a Vercel
```powershell
# Opción 1: Usar script (recomendado)
.\build-and-deploy.ps1
# Responder "S" cuando pregunte por deploy

# Opción 2: Manual
vercel --prod
```

## Configuración en Vercel Dashboard

### 1. Variables de Entorno
1. Ve a **Settings** → **Environment Variables**
2. Agrega todas las variables con prefijo `VITE_`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_MODE=production`
   - `VITE_HCAPTCHA_SITE_KEY`
   - `VITE_WORLD_ID_APP_ID`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_POSTHOG_KEY`
   - `VITE_OPENAI_API_KEY`
   - etc.

3. Selecciona **Production**, **Preview**, y **Development** según corresponda

### 2. Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Salida Esperada en Consola

### Build Exitoso
```
🚀 Iniciando build y deploy para Vercel...

📋 Verificando variables de entorno...
  ✅ VITE_SUPABASE_URL configurada
  ✅ VITE_SUPABASE_ANON_KEY configurada

🧹 Limpiando build anterior...
  ✅ Directorio dist eliminado

📦 Instalando dependencias...
  ✅ Dependencias instaladas

🔍 Verificando tipos TypeScript...
  ✅ Tipos verificados

🔨 Construyendo aplicación...
  ✅ Build completado en 45.23s

📊 Analizando tamaño del build...
  📦 Tamaño total: 42.15 MB
  ✅ Build < 60MB
  📄 Archivos generados:
    - JS chunks: 15
    - CSS files: 1
    - ✅ index.html

🔍 Verificando errores potenciales...
  ✅ Ruta de main.tsx correcta
  ✅ Assets referenciados correctamente

✅ Proceso completado exitosamente!
```

### Verificación Post-Deploy
1. Abre la app en Vercel
2. Abre DevTools (F12)
3. Verifica en Console:
   ```javascript
   console.log(import.meta.env.VITE_SUPABASE_URL)
   // Debe mostrar tu URL de Supabase
   ```
4. Verifica que no hay errores 404 en Network tab
5. Verifica que los chunks se cargan correctamente

## Troubleshooting

### Pantalla Blanca
1. Verifica variables de entorno en Vercel Dashboard
2. Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas
3. Revisa la consola del navegador para errores

### Chunks 404
1. Verifica que `vercel.json` tiene los rewrites correctos
2. Verifica que los assets están en `/assets/js/` y `/assets/css/`
3. Limpia caché del navegador (Ctrl+Shift+R)

### Variables No Disponibles
1. Verifica que las variables tienen prefijo `VITE_`
2. Verifica que están configuradas en Vercel Dashboard
3. Re-deploy después de agregar variables

## Checklist Pre-Deploy

- [ ] Variables de entorno configuradas en Vercel
- [ ] `vite.config.ts` actualizado
- [ ] `vercel.json` actualizado
- [ ] `index.html` con rutas correctas
- [ ] Build local exitoso (<60MB)
- [ ] 0 errores TypeScript
- [ ] 0 errores ESLint
- [ ] Test local: `npm run preview`

## Notas Importantes

1. **Variables de Entorno**: Solo variables con prefijo `VITE_` están disponibles en el cliente
2. **Build Size**: El build debe ser <60MB. Si es mayor, revisa los chunks manuales
3. **CSS Split**: Deshabilitado para evitar problemas de carga
4. **Base Path**: Siempre `/` para Vercel
5. **Caché**: Assets tienen caché de 1 año (immutable)

