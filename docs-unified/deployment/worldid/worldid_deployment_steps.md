# 🚀 Pasos Específicos para tu Proyecto Supabase

**ID del Proyecto:** `axtvqnozatbmllvwzuim`

## 1. ✅ Aplicar Migración de Base de Datos

**Ejecuta este SQL en tu Supabase SQL Editor:**

```sql
-- WorldID Verification Schema Check
-- Verificar que las columnas World ID se agregaron a user_token_balances
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_token_balances' 
AND column_name LIKE 'worldid%'
ORDER BY column_name;
```

**Si no aparecen columnas, ejecuta la migración completa:**
```sql
-- Copiar y pegar todo el contenido de:
-- supabase/migrations/20250903_add_worldid_support.sql
```

## 2. ✅ Deploy Edge Function

**Opción A - Supabase CLI (Ya tienes login):**
```bash
# Link al proyecto (ya hecho)
supabase link --project-ref axtvqnozatbmllvwzuim

# Deploy la función
supabase functions deploy worldid-verify --project-ref qgycvxmqdldveqqferaw
```

**Opción B - Manual Dashboard:**
1. Ve a: https://supabase.com/dashboard/project/axtvqnozatbmllvwzuim/functions
2. Crear nueva función: `worldid-verify`
3. Copiar código de: `supabase/functions/worldid-verify/index.ts`

## 3. ✅ Probar la Función (Una vez deployada)

**Comando de prueba:**
```bash
curl -X POST 'https://axtvqnozatbmllvwzuim.supabase.co/functions/v1/worldid-verify' \
  -H 'Authorization: Bearer TU_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"test": true}'
```

**Obtener tu ANON_KEY:**
- Dashboard → Settings → API → `anon public`

## 4. ⏳ Variables de Entorno (Cuando tengas credenciales World ID)

**En Supabase Dashboard → Settings → Environment Variables:**
```env
WORLD_APP_SECRET=tu_world_app_secret_aqui
WORLD_VERIFY_ENDPOINT=https://developer.worldcoin.org/api/v1/verify/app_staging_TU_APP_ID
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

**En tu .env.local:**
```env
NEXT_PUBLIC_WORLD_APP_ID=app_staging_TU_APP_ID
NEXT_PUBLIC_WORLD_APP_ACTION=verify-human
WORLD_APP_SECRET=tu_world_app_secret_aqui
WORLD_VERIFY_ENDPOINT=https://developer.worldcoin.org/api/v1/verify/app_staging_TU_APP_ID
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## 5. 🧪 Probar con Worldcoin Simulator

1. Ve a: https://simulator.worldcoin.org/
2. Usa tu `app_staging_TU_APP_ID`
3. Genera proof de prueba
4. Probar en tu app local

## ⚠️ Error que viste

El comando `curl` no se ejecuta en SQL Editor de Supabase. Úsalo en tu terminal/PowerShell después de deployar la función.

El error de sintaxis es porque intentaste ejecutar un comando bash en el editor SQL.
