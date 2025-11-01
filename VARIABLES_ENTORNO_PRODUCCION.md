# 🔑 Variables de Entorno para Producción - ComplicesConecta v3.5.0

**Fecha:** 01 de Noviembre, 2025  
**Versión:** 3.5.0  
**Propósito:** Guía completa de variables de entorno necesarias para operar en producción

---

## 📋 RESUMEN EJECUTIVO

### Variables Críticas (SIN ESTAS NO FUNCIONA)
| Variable | Estado | Prioridad | Dónde obtenerla |
|----------|--------|-----------|-----------------|
| `VITE_SUPABASE_URL` | 🔴 **CRÍTICA** | Alta | Supabase Dashboard |
| `VITE_SUPABASE_ANON_KEY` | 🔴 **CRÍTICA** | Alta | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | 🔴 **CRÍTICA** | Alta | Supabase Dashboard |

### Variables Importantes (FUNCIONALIDAD REDUCIDA SIN ELLAS)
| Variable | Estado | Prioridad | Dónde obtenerla |
|----------|--------|-----------|-----------------|
| `VITE_APP_MODE` | 🟡 Importante | Media | Local |
| `VITE_APP_ENV` | 🟡 Importante | Media | Local |
| `VITE_HCAPTCHA_SITE_KEY` | 🟡 Importante | Media | hCaptcha |
| `VITE_STRIPE_PUBLISHABLE_KEY` | 🟡 Importante | Media | Stripe Dashboard |
| `STRIPE_SECRET_KEY` | 🟡 Importante | Media | Stripe Dashboard |

### Variables Opcionales (MEJORAN FUNCIONALIDAD)
| Variable | Estado | Prioridad | Dónde obtenerla |
|----------|--------|-----------|-----------------|
| `VITE_OPENAI_API_KEY` | 🟢 Opcional | Baja | OpenAI |
| `VITE_HUGGINGFACE_API_KEY` | 🟢 Opcional | Baja | HuggingFace |
| `VITE_DATADOG_CLIENT_TOKEN` | 🟢 Opcional | Baja | Datadog |
| `VITE_SENTRY_DSN` | 🟢 Opcional | Baja | Sentry |
| `WORLD_APP_SECRET` | 🟢 Opcional | Baja | Worldcoin |

---

## 🔐 VARIABLES CRÍTICAS (OBLIGATORIAS)

### 1. **Supabase Configuration** ✅ OBLIGATORIAS

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
SUPABASE_JWT_SECRET=tu-jwt-secret-aqui
```

**🔗 Dónde obtenerlas:**
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Inicia sesión en tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`
   - **JWT Secret** → `SUPABASE_JWT_SECRET`

**💡 Tu proyecto:** `axtvqnozatbmllvwzuim`

**⚠️ IMPORTANTE:**
- `SUPABASE_SERVICE_ROLE_KEY` es SENSIBLE - nunca exponer en frontend
- Usado solo en scripts de backfill S2 y operaciones admin
- Si no tienes proyecto Supabase: [Crear cuenta gratuita](https://supabase.com/dashboard)

---

### 2. **Configuration Básica** ✅ OBLIGATORIAS

```env
# Entorno
VITE_APP_ENV=production
VITE_APP_MODE=production

# URLs de la Aplicación
VITE_APP_URL=https://complicesconecta.vercel.app
VITE_API_URL=https://complicesconecta.vercel.app/api
```

**💡 Configuración:**
- Cambiar URLs por tu dominio real de producción

---

## 🎯 VARIABLES IMPORTANTES (RECOMENDADAS)

### 3. **Seguridad - hCaptcha** ⚠️ RECOMENDADAS

```env
VITE_HCAPTCHA_SITE_KEY=tu-site-key-aqui
VITE_HCAPTCHA_SECRET=tu-secret-key-aqui
```

**🔗 Dónde obtenerlas:**
1. Ve a [hCaptcha Dashboard](https://dashboard.hcaptcha.com/)
2. Inicia sesión o crea cuenta gratuita
3. Ve a **Sites** → **Add New Site**
4. Selecciona **Free Plan**
5. Copia Site Key y Secret Key

**💡 Tip:** Para testing usa `10000000-ffff-ffff-ffff-000000000001` (siempre pasa)

---

### 4. **Pagos - Stripe** ⚠️ RECOMENDADAS

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_tu_stripe_key_aqui
STRIPE_SECRET_KEY=sk_live_tu_stripe_secret_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui

# Product IDs
STRIPE_PRICE_ID_MONTHLY=price_tu_monthly_id
STRIPE_PRICE_ID_QUARTERLY=price_tu_quarterly_id
STRIPE_PRICE_ID_YEARLY=price_tu_yearly_id

# URLs
STRIPE_SUCCESS_URL=https://complicesconecta.vercel.app/premium/success
STRIPE_CANCEL_URL=https://complicesconecta.vercel.app/premium/cancel
STRIPE_CUSTOMER_PORTAL_URL=https://complicesconecta.vercel.app/premium/portal
```

**🔗 Dónde obtenerlas:**
1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Inicia sesión
3. Ve a **Developers** → **API keys**
4. Copia:
   - **Publishable key** → `VITE_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`
5. Ve a **Developers** → **Webhooks** → **Add endpoint**
6. Copia **Signing secret** → `STRIPE_WEBHOOK_SECRET`
7. Ve a **Products** y copia los Price IDs

**⚠️ IMPORTANTE:** Usa claves `pk_live_*` y `sk_live_*` para producción, no `pk_test_*`

---

### 5. **World ID** ⚠️ RECOMENDADAS

```env
WORLD_APP_SECRET=api_tu_world_secret_key
WORLD_VERIFY_ENDPOINT=https://developer.worldcoin.org/api/v1/verify
NEXT_PUBLIC_WORLD_APP_ID=app_tu_world_app_id
```

**🔗 Dónde obtenerlas:**
1. Ve a [Worldcoin Developer Portal](https://developer.worldcoin.org/)
2. Crea cuenta
3. Ve a **Apps** → **Create New App**
4. Copia:
   - **App ID** → `NEXT_PUBLIC_WORLD_APP_ID`
   - **API Secret** → `WORLD_APP_SECRET`

**💡 Tip:** Solo necesario si implementas verificación de humanidad

---

## 🌟 VARIABLES OPCIONALES (MEJORAS)

### 6. **AI/ML Features** 🟢 OPCIONALES

```env
# AI Native (deshabilitado por default)
VITE_AI_NATIVE_ENABLED=false
VITE_AI_MODEL_VERSION=v1-base
VITE_AI_PREDICTION_TIMEOUT=3000
VITE_AI_CACHE_TTL=1800000

# Chat Summaries (gratis con HuggingFace)
VITE_AI_CHAT_SUMMARIES_ENABLED=true
VITE_AI_SUMMARY_PROVIDER=auto
VITE_OPENAI_API_KEY=sk-proj-xxxxx
VITE_HUGGINGFACE_API_KEY=hf_xxxxx
```

**🔗 Dónde obtenerlas:**

**OpenAI (Pago):**
1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Crea cuenta
3. Ve a **API Keys** → **Create new secret key**
4. Copia → `VITE_OPENAI_API_KEY`
5. 💰 Costo: ~$0.01-$0.05 por resumen

**HuggingFace (Gratis):**
1. Ve a [HuggingFace.co](https://huggingface.co/)
2. Inicia sesión o crea cuenta gratuita
3. Ve a **Settings** → **Access Tokens** → [Acceso directo](https://huggingface.co/settings/tokens)
4. Clic en **New token** → Name: "ComplicesConecta" → Type: Read
5. Copia el token → `VITE_HUGGINGFACE_API_KEY`
6. 💰 Costo: GRATIS (sin límites razonables)

**💡 Recomendación:** Usa HuggingFace BART para empezar (100% gratis, API rápida)

---

### 7. **Monitoreo y Observabilidad** 🟢 OPCIONALES

```env
# Datadog RUM
VITE_DATADOG_CLIENT_TOKEN=tu-datadog-token
VITE_DATADOG_APPLICATION_ID=tu-datadog-app-id

# Sentry Error Tracking
VITE_SENTRY_DSN=https://tu-dsn@sentry.io/proyecto

# New Relic APM
NEW_RELIC_LICENSE_KEY=tu-new-relic-key
```

**🔗 Dónde obtenerlas:**

**Datadog:**
1. [Cuenta gratuita Datadog](https://www.datadoghq.com/)
2. RUM → New Application → JavaScript
3. Copia Client Token y Application ID

**Sentry:**
1. [Cuenta gratuita Sentry](https://sentry.io/)
2. Create Project → React
3. Copia DSN

**New Relic:**
1. [Cuenta New Relic](https://newrelic.com/)
2. Account Settings → API Keys
3. Copia License Key

**💡 Recomendación:** Minimo configurar Sentry (crítico para monitoreo de errores)

---

### 8. **Feature Flags** 🟢 OPCIONALES

```env
VITE_APP_PHASE=production
VITE_TOKENS_ENABLED=true
VITE_DEV_MODE=false
VITE_DEBUG_LOGS=false
```

**💡 Configuración:** Local, no requiere servicios externos

---

## 📝 .ENV DE EJEMPLO COMPLETO

```env
# ========================================
# COMPLICESCONECTA - VARIABLES DE PRODUCCIÓN
# ========================================

# Entorno
VITE_APP_ENV=production
VITE_APP_MODE=production
NODE_ENV=production

# URLs
VITE_APP_URL=https://complicesconecta.com
VITE_API_URL=https://complicesconecta.com/api

# Supabase (CRÍTICAS)
VITE_SUPABASE_URL=https://[TU-PROYECTO].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IlRVX1BST1lFQ1RPX0lEIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODQ5MDYsImV4cCI6MjA2MTY2MDkwNn0.XXXXXXXXXXXXX
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IlRVX1BST1lFQ1RPX0lEIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjA4NDkwNiwiZXhwIjoyMDYxNjYwOTA2fQ.XXXXXXXXXXXXX
SUPABASE_JWT_SECRET=[TU_JWT_SECRET_AQUI]

# hCaptcha (RECOMENDADAS)
VITE_HCAPTCHA_SITE_KEY=tu-site-key-aqui
VITE_HCAPTCHA_SECRET=tu-secret-key-aqui

# Stripe (RECOMENDADAS)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_[TU_STRIPE_PUBLISHABLE_KEY]
STRIPE_SECRET_KEY=sk_live_[TU_STRIPE_SECRET_KEY]
STRIPE_WEBHOOK_SECRET=whsec_[CONFIGURAR_EN_WEBHOOK]
STRIPE_PRICE_ID_MONTHLY=price_monthly_premium_id
STRIPE_PRICE_ID_QUARTERLY=price_quarterly_premium_id
STRIPE_PRICE_ID_YEARLY=price_yearly_premium_id
STRIPE_PRICE_ID_SUPPORTER=price_supporter_5usd
STRIPE_PRICE_ID_CONTRIBUTOR=price_contributor_15usd
STRIPE_PRICE_ID_VIP_SUPPORTER=price_vip_supporter_30usd
STRIPE_PRICE_ID_FOUNDING_MEMBER=price_founding_member_50usd
STRIPE_PRICE_ID_SUPPORTER_MXN=price_supporter_100_mxn
STRIPE_PRICE_ID_CONTRIBUTOR_MXN=price_contributor_300_mxn
STRIPE_PRICE_ID_VIP_SUPPORTER_MXN=price_vip_supporter_600_mxn
STRIPE_PRICE_ID_FOUNDING_MEMBER_MXN=price_founding_member_1000_mxn

# JWT Secret (obtener de Supabase Dashboard → Settings → API)
SUPABASE_JWT_SECRET=tu-jwt-secret-aqui

# Application Mode
VITE_APP_MODE=production
STRIPE_SUCCESS_URL=https://complicesconecta.com/premium/success
STRIPE_CANCEL_URL=https://complicesconecta.com/premium/cancel
STRIPE_CUSTOMER_PORTAL_URL=https://complicesconecta.com/premium/portal

# World ID (OPCIONAL)
WORLD_APP_SECRET=api_tu_world_secret_key
WORLD_VERIFY_ENDPOINT=https://developer.worldcoin.org/api/v1/verify
NEXT_PUBLIC_WORLD_APP_ID=app_staging_your_app_id_here

# AI Features (OPCIONALES)
VITE_AI_NATIVE_ENABLED=false
VITE_AI_MODEL_VERSION=v1-base
VITE_AI_PREDICTION_TIMEOUT=3000
VITE_AI_CACHE_TTL=1800000
VITE_AI_CHAT_SUMMARIES_ENABLED=true
VITE_AI_SUMMARY_PROVIDER=auto
VITE_HUGGINGFACE_API_KEY=hf_[TU_HUGGINGFACE_TOKEN]

# Monitoreo (OPCIONALES)
VITE_SENTRY_DSN=https://xxxxx@o1234567.ingest.sentry.io/1234567

# Feature Flags
VITE_APP_PHASE=production
VITE_TOKENS_ENABLED=true
VITE_DEV_MODE=false
VITE_DEBUG_LOGS=false
```

---

## 🚀 CHECKLIST DE SETUP

### Fase 1: Críticas (SIN ESTAS NO FUNCIONA) ✅ COMPLETADAS
- [x] Configurar proyecto Supabase ✅
- [x] Copiar `VITE_SUPABASE_URL` ✅
- [x] Copiar `VITE_SUPABASE_ANON_KEY` ✅
- [x] Copiar `SUPABASE_SERVICE_ROLE_KEY` ✅
- [x] Configurar `VITE_APP_MODE=production` ✅
- [x] Configurar `VITE_APP_ENV=production` ✅

### Fase 2: Importantes (FUNCIONALIDAD BÁSICA) ✅ COMPLETADAS
- [x] Configurar hCaptcha ✅
- [x] Copiar `VITE_HCAPTCHA_SITE_KEY` y `VITE_HCAPTCHA_SECRET` ✅
- [x] Configurar Stripe ✅
- [x] Copiar todas las claves de Stripe ✅

### Fase 3: Opcionales (MEJORAN EXPERIENCIA) ✅ COMPLETADAS
- [x] Configurar World ID ✅
- [x] Configurar HuggingFace para Chat Summaries (gratis) ✅
- [ ] [Opcional] Configurar OpenAI para Chat Summaries (pago)
- [ ] [Opcional] Configurar Sentry para monitoreo de errores
- [ ] [Opcional] Configurar Datadog para RUM

---

## 🔍 VERIFICACIÓN

### Verificar que .env está configurado

```bash
# Verificar que existe
ls -la .env

# Verificar que no está en Git
git status .env  # Debe mostrar "not tracked"
```

### Verificar variables en código

```typescript
// En consola del navegador
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('App Mode:', import.meta.env.VITE_APP_MODE);
console.log('AI Enabled:', import.meta.env.VITE_AI_CHAT_SUMMARIES_ENABLED);
```

---

## 🆘 TROUBLESHOOTING

### Error: "Supabase connection refused"
**Solución:** Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` sean correctos

### Error: "hCaptcha failed"
**Solución:** Usa Site Key de prueba: `10000000-ffff-ffff-ffff-000000000001`

### Error: "Stripe key invalid"
**Solución:** Usa claves `live` para producción, no `test`

### Error: "Chat Summaries not working"
**Solución:** Configura al menos `VITE_HUGGINGFACE_API_KEY` (gratis)

---

## 📝 SETUP RÁPIDO - PASO A PASO

### Paso 1: Crear archivo .env

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# O crea desde cero
touch .env
```

### Paso 2: Configurar variables críticas

Edita `.env` y configura AL MENOS estas variables:

```env
# 1. SUPABASE (obligatorio)
VITE_SUPABASE_URL=https://axtvqnozatbmllvwzuim.supabase.co
VITE_SUPABASE_ANON_KEY=[TU_CLAVE_ANON]
SUPABASE_SERVICE_ROLE_KEY=[TU_CLAVE_SERVICE]

# 2. Entorno básico (obligatorio)
VITE_APP_ENV=production
VITE_APP_MODE=production
```

### Paso 3: Verificar configuración

```bash
# Verificar que .env existe
ls -la .env

# Verificar que no está en Git
git status .env  # Debe mostrar "not tracked"

# Probar build
npm run build
```

### Paso 4: Variables opcionales (mejoran funcionalidad)

Una vez que la app funciona, agrega variables opcionales:

```env
# IA Gratuita (Chat Summaries)
VITE_AI_CHAT_SUMMARIES_ENABLED=true
VITE_HUGGINGFACE_API_KEY=[TU_TOKEN_HF]

# Captcha (Seguridad)
VITE_HCAPTCHA_SITE_KEY=[TU_SITE_KEY]

# Stripe (Pagos)
VITE_STRIPE_PUBLISHABLE_KEY=[TU_PUBLISHABLE_KEY]
```

---

## 📚 REFERENCIAS Y ENLACES DIRECTOS

### 🔐 Servicios Críticos
- **Supabase Dashboard:** [supabase.com/dashboard](https://supabase.com/dashboard) → Settings → API
- **Proyecto Actual:** [axtvqnozatbmllvwzuim.supabase.co](https://axtvqnozatbmllvwzuim.supabase.co)

### 🛡️ Seguridad
- **hCaptcha Dashboard:** [dashboard.hcaptcha.com](https://dashboard.hcaptcha.com/)
- **Configurar Site:** [dashboard.hcaptcha.com/sites](https://dashboard.hcaptcha.com/sites) → Add New Site

### 💳 Pagos
- **Stripe Dashboard:** [dashboard.stripe.com](https://dashboard.stripe.com/)
- **API Keys:** [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
- **Webhooks:** [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
- **Products:** [dashboard.stripe.com/products](https://dashboard.stripe.com/products)

### 🤖 IA/ML
- **OpenAI Platform:** [platform.openai.com](https://platform.openai.com/) → API Keys
- **HuggingFace:** [huggingface.co](https://huggingface.co/)
- **Tokens:** [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

### 🔐 Blockchain
- **Worldcoin Developer:** [developer.worldcoin.org](https://developer.worldcoin.org/)

### 📊 Monitoreo
- **Sentry:** [sentry.io](https://sentry.io/) → Create Account
- **Datadog:** [datadoghq.com](https://www.datadoghq.com/) → RUM Setup

---

**© 2025 ComplicesConecta Software**  
*La primera plataforma swinger con IA nativa de México*

**Última actualización:** 01 Noviembre 2025

