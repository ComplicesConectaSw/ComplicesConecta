# 🚀 Instrucciones de Deployment - World ID Integration

## 📋 Pasos para Completar la Integración

### 1. ✅ Aplicar Migración de Base de Datos en Supabase Production

**Archivo:** `supabase/migrations/20250903_add_worldid_support.sql`

**Pasos:**
1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto de producción
3. Ve a **SQL Editor**
4. Copia y pega el contenido completo del archivo de migración
5. Ejecuta la migración
6. Verifica que las tablas se hayan actualizado correctamente

**Verificación:**
```sql
-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_token_balances' 
AND column_name LIKE 'worldid%';

-- Verificar que las funciones se crearon
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('process_worldid_verification_reward', 'get_worldid_stats');
```

### 2. ✅ Deployar Edge Function en Supabase

**Archivo:** `supabase/functions/worldid-verify/index.ts`

**Opción A - Supabase CLI (Recomendado):**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login a Supabase
supabase login

# Link al proyecto
supabase link --project-ref YOUR_PROJECT_REF

# Deploy la función
supabase functions deploy worldid-verify
```

**Opción B - Manual Dashboard:**
1. Ve a **Edge Functions** en tu dashboard de Supabase
2. Crea nueva función llamada `worldid-verify`
3. Copia el código de `supabase/functions/worldid-verify/index.ts`
4. Deploy la función

**Verificación:**
```bash
# Probar la función
curl -X POST 'https://axtvqnozatbmllvwzuim.supabase.co/functions/v1/worldid-verify' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"test": true}'
```

### Test con PowerShell - ✅ COMPLETADO:
```powershell
$headers = @{
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFneWN2eG1xZGxkdmVxcWZlcmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MjM2MzEsImV4cCI6MjA0MDk5OTYzMX0.CaQJiNlbOCBYLGhJJyYWBPaKsHWJfgGOYjJFGqZHqQI'
    'Content-Type' = 'application/json'
}

Invoke-RestMethod -Uri 'https://qgycvxmqdldveqqferaw.supabase.co/functions/v1/worldid-verify' -Method POST -Headers $headers -Body '{"test": true}'
```

### ✅ Variables de Entorno Configuradas:
```env
WORLD_APP_SECRET=api_a2V5XzdlYzRjN2E5OGYzYjBiMzE2MmNlZDA0ZmZlYjlhZjBkOnNrX2JlZjRhOWMzMzBlOWZmZWJiYzllMzk5NjQ1NDJkMGRhZTZkYWU5YmYyMmI5NTAyNg
WORLD_VERIFY_ENDPOINT=https://developer.worldcoin.org/api/v1/verify
```

### 3. ✅ Configurar Variables de Entorno - COMPLETADO

**En Supabase Dashboard > Settings > Environment Variables:**

```env
WORLD_APP_SECRET=api_a2V5XzdlYzRjN2E5OGYzYjBiMzE2MmNlZDA0ZmZlYjlhZjBkOnNrX2JlZjRhOWMzMzBlOWZmZWJiYzllMzk5NjQ1NDJkMGRhZTZkYWU5YmYyMmI5NTAyNg
WORLD_VERIFY_ENDPOINT=https://developer.worldcoin.org/api/v1/verify
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**En tu aplicación (.env.local):**
```env
NEXT_PUBLIC_WORLD_APP_ID=app_staging_YOUR_APP_ID
NEXT_PUBLIC_WORLD_APP_ACTION=verify-human
WORLD_APP_SECRET=your_world_app_secret_here
WORLD_VERIFY_ENDPOINT=https://developer.worldcoin.org/api/v1/verify/app_staging_YOUR_APP_ID
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. ✅ Probar con Worldcoin Simulator

**Pasos:**
1. Ve a: https://simulator.worldcoin.org/
2. Usa tu `NEXT_PUBLIC_WORLD_APP_ID`
3. Genera un proof de prueba
4. Prueba la verificación en tu aplicación local
5. Verifica que los tokens CMPX se otorgan correctamente

**Comandos de Prueba:**
```bash
# Instalar dependencia World ID
npm install @worldcoin/idkit@^1.3.0

# Ejecutar aplicación en modo desarrollo
npm run dev

# Probar la funcionalidad World ID
```

### 5. ✅ Habilitar la Integración

**Una vez que todo esté probado:**

1. **Remover el flag de deshabilitado** en `WorldIDButton.tsx`:
   ```typescript
   // Cambiar de:
   const WORLDID_ENABLED = false;
   // A:
   const WORLDID_ENABLED = true;
   ```

2. **Actualizar documentación** para reflejar que está activo

3. **Notificar a usuarios** sobre la nueva funcionalidad

## 🔧 Troubleshooting

### Error: "Module not found @worldcoin/idkit"
```bash
npm install @worldcoin/idkit@^1.3.0
```

### Error: "Supabase function not found"
- Verificar que la función se deployó correctamente
- Verificar las variables de entorno
- Revisar los logs en Supabase Dashboard

### Error: "World ID verification failed"
- Verificar que el `WORLD_APP_SECRET` es correcto
- Verificar que el endpoint de verificación es correcto
- Usar el simulador para generar proofs válidos

## 📊 Monitoreo

**Métricas a monitorear:**
- Número de verificaciones World ID exitosas
- Tokens CMPX otorgados por World ID
- Errores en la Edge Function
- Tiempo de respuesta de verificación

**Logs importantes:**
- Supabase Edge Functions logs
- Errores de verificación World ID
- Transacciones de tokens CMPX

---

© 2024 ComplicesConecta - World ID Integration v1.6.0
