# ⚙️ CONFIGURACIÓN .ENV - ComplicesConecta v3.5.0

**Fecha:** 30 de Octubre, 2025  
**Versión:** 3.5.0-alpha (Fase 1.2 completa)

---

## 🎯 PROPÓSITO

Guía completa para configurar variables de entorno necesarias para funcionalidades AI-Native (Fase 1: AI-Native Layers).

---

## 📋 VARIABLES REQUERIDAS

### 1. **Supabase** (Obligatorio)

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

**Dónde obtenerlas:**
- Supabase Dashboard → Settings → API
- `ANON_KEY`: Para cliente (frontend)
- `SERVICE_ROLE_KEY`: Para operaciones admin (backend)

---

### 2. **AI/ML Features** (Fase 1.1 y 1.2)

```env
# Feature Flag Principal
VITE_AI_NATIVE_ENABLED=false

# Versión del modelo ML
VITE_AI_MODEL_VERSION=v1-base

# Timeout para predicciones (ms)
VITE_AI_PREDICTION_TIMEOUT=5000

# TTL del cache de scores (ms) - 1 hora
VITE_AI_CACHE_TTL=3600000
```

**Valores recomendados:**

| Variable | Desarrollo | Producción | Descripción |
|----------|-----------|------------|-------------|
| `VITE_AI_NATIVE_ENABLED` | `false` | `false` | Deshabilitado por default (usar legacy) |
| `VITE_AI_MODEL_VERSION` | `v1-base` | `v1-base` | Versión del modelo ML |
| `VITE_AI_PREDICTION_TIMEOUT` | `5000` | `3000` | Timeout en ms |
| `VITE_AI_CACHE_TTL` | `3600000` | `1800000` | Cache: 1h dev, 30min prod |

**⚠️ IMPORTANTE:**
- `VITE_AI_NATIVE_ENABLED=false` es **SEGURO** para producción (usa algoritmo legacy)
- Solo habilitar a `true` cuando:
  - Modelo ML esté disponible en `/public/models/`
  - Tests de performance pasen (<200ms)
  - A/B testing confirme mejora de match rate

---

### 3. **Monitoreo** (Opcional pero recomendado)

```env
# Datadog RUM
VITE_DATADOG_CLIENT_TOKEN=tu-datadog-client-token
VITE_DATADOG_APPLICATION_ID=tu-datadog-app-id

# Sentry (Error Tracking)
VITE_SENTRY_DSN=https://tu-sentry-dsn@sentry.io/proyecto

# New Relic (APM)
NEW_RELIC_LICENSE_KEY=tu-new-relic-license-key
```

---

### 4. **Tokens & Blockchain** (Opcional)

```env
# World ID (verificación humana)
VITE_WORLD_APP_ID=tu-world-app-id
```

---

### 5. **Aplicación** (General)

```env
VITE_DEV_MODE=true
VITE_DEBUG_LOGS=false
VITE_APP_VERSION=3.5.0
```

---

## 🚀 PASOS DE CONFIGURACIÓN

### Paso 1: Crear archivo .env

```bash
# En la raíz del proyecto
cp .env.example .env
```

### Paso 2: Configurar Supabase

1. Abre [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
   - `service_role` → `VITE_SUPABASE_SERVICE_ROLE_KEY`

### Paso 3: Configurar AI Features

**Para Desarrollo:**
```env
VITE_AI_NATIVE_ENABLED=false
```

**Para Testing AI:**
```env
VITE_AI_NATIVE_ENABLED=true
VITE_AI_MODEL_VERSION=v1-base
```

### Paso 4: Configurar Monitoreo (opcional)

**Datadog:**
1. Crea cuenta en [Datadog](https://www.datadoghq.com/)
2. RUM → New Application → JavaScript
3. Copia `clientToken` y `applicationId`

**Sentry:**
1. Crea cuenta en [Sentry](https://sentry.io/)
2. Create Project → React
3. Copia el DSN

### Paso 5: Verificar configuración

```bash
# Verificar que .env existe
ls -la .env

# Verificar que no está en Git
git status .env  # Debe mostrar "not tracked" o estar en .gitignore

# Reiniciar servidor de desarrollo
npm run dev
```

---

## 🔒 SEGURIDAD

### ✅ Buenas Prácticas

1. **NUNCA commitees .env a Git**
   ```bash
   # Verificar que está en .gitignore
   grep "\.env$" .gitignore
   ```

2. **Usa variables diferentes para cada entorno**
   - `.env.development` → desarrollo local
   - `.env.production` → producción
   - `.env.test` → tests

3. **Rotar keys regularmente**
   - Service Role Key: cada 90 días
   - API Keys: cada 180 días

4. **Limita permisos**
   - Solo usa `service_role` en backend
   - Frontend debe usar `anon_key`

### ❌ Anti-Patterns

```env
# ❌ MAL: Keys públicas
VITE_SUPABASE_SERVICE_ROLE_KEY=public-key-here

# ❌ MAL: Hardcodear en código
const API_KEY = "sk-12345...";

# ✅ BIEN: Variables de entorno
const API_KEY = import.meta.env.VITE_API_KEY;
```

---

## 🧪 TESTING

### Verificar AI Features

```typescript
// En consola del navegador
console.log(import.meta.env.VITE_AI_NATIVE_ENABLED);
// Debe mostrar: "false" o "true"

// Verificar modelo cargado
import { pytorchModel } from '@/services/ai/models/PyTorchScoringModel';
console.log(pytorchModel.isLoaded());
```

### Verificar Supabase

```typescript
import { supabase } from '@/lib/supabase';
const { data, error } = await supabase.from('profiles').select('count');
console.log(data, error);
```

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot find module '@/lib/supabase'"

**Solución:**
```bash
# Verificar que .env existe
ls .env

# Reiniciar servidor
npm run dev
```

### Error: "AI model failed to load"

**Causa:** `VITE_AI_NATIVE_ENABLED=true` pero modelo no disponible

**Solución:**
```env
# En .env, cambiar a:
VITE_AI_NATIVE_ENABLED=false
```

### Error: "Supabase connection refused"

**Verificar:**
1. `VITE_SUPABASE_URL` es correcto
2. `VITE_SUPABASE_ANON_KEY` es válido
3. Internet está conectado

---

## 📊 VALORES POR ENTORNO

### Desarrollo Local

```env
VITE_AI_NATIVE_ENABLED=false
VITE_DEV_MODE=true
VITE_DEBUG_LOGS=true
VITE_AI_PREDICTION_TIMEOUT=5000
```

### Staging

```env
VITE_AI_NATIVE_ENABLED=false
VITE_DEV_MODE=false
VITE_DEBUG_LOGS=false
VITE_AI_PREDICTION_TIMEOUT=3000
```

### Producción

```env
VITE_AI_NATIVE_ENABLED=false
VITE_DEV_MODE=false
VITE_DEBUG_LOGS=false
VITE_AI_PREDICTION_TIMEOUT=3000
VITE_AI_CACHE_TTL=1800000
```

---

## 🎯 PRÓXIMOS PASOS

1. **Configurar .env** ✅
2. **Aplicar migración SQL** → `scripts/apply-ai-migration.ps1`
3. **Regenerar types** → `npm run types:generate`
4. **Reiniciar servidor** → `npm run dev`
5. **Verificar en navegador** → Abrir DevTools Console

---

## 📚 REFERENCIAS

- [Supabase Environment Variables](https://supabase.com/docs/guides/cli/config)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [PLAN_MEJORAS_GRINDR_FB_2025_v3.4.1.md](./PLAN_MEJORAS_GRINDR_FB_2025_v3.4.1.md)

---

*Configuración .env - ComplicesConecta v3.5.0*

