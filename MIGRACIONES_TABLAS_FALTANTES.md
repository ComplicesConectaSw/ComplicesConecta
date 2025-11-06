# Migraciones Creadas para Tablas Faltantes

**Fecha:** 2025-11-06  
**Problema:** 2 tablas referenciadas en código pero no en tipos Supabase

## Tablas Identificadas

### 1. `biometric_sessions` ✅ CRÍTICA
- **Estado:** Activamente usada en `src/hooks/useBiometricAuth.ts`
- **Uso:** Gestión de sesiones de autenticación biométrica (WebAuthn)
- **Migración:** `20251106000000_create_biometric_sessions.sql`

**Estructura:**
- `id` (UUID, PK)
- `user_id` (UUID, FK a profiles)
- `session_id` (TEXT, UNIQUE)
- `session_type` (TEXT: 'fingerprint', 'face', 'biometric')
- `device_id` (TEXT)
- `credential_id` (TEXT)
- `public_key` (TEXT)
- `confidence` (NUMERIC 3,2)
- `success` (BOOLEAN)
- `is_active` (BOOLEAN)
- `expires_at` (TIMESTAMPTZ)
- `last_used_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

**Características:**
- ✅ RLS habilitado
- ✅ Políticas: usuarios solo pueden ver/editar sus propias sesiones
- ✅ Índices en `user_id`, `session_id`, `is_active`, `expires_at`
- ✅ Foreign key a `profiles(id)` con CASCADE

### 2. `app_logs` ⚠️ OPCIONAL
- **Estado:** Comentada en código (`src/lib/logger.ts:95`)
- **Uso:** Logging avanzado de aplicación (futuro)
- **Migración:** `20251106000001_create_app_logs.sql`

**Estructura:**
- `id` (UUID, PK)
- `user_id` (UUID, FK a profiles, nullable)
- `level` (TEXT: 'debug', 'info', 'warn', 'error')
- `message` (TEXT)
- `context` (JSONB)
- `metadata` (JSONB)
- `ip_address` (INET)
- `user_agent` (TEXT)
- `created_at` (TIMESTAMPTZ)

**Características:**
- ✅ RLS habilitado
- ✅ Políticas: usuarios solo pueden ver sus propios logs
- ✅ Índices en `user_id`, `level`, `created_at`
- ⚠️ Tabla opcional, no crítica para funcionamiento actual

## Próximos Pasos

### 1. Aplicar Migraciones en Supabase Remoto
```bash
# Opción 1: Usar Supabase CLI
supabase db push

# Opción 2: Ejecutar manualmente en Supabase Dashboard
# Ir a: https://supabase.com/dashboard/project/axtvqnozatbmllvwzuim/sql
# Copiar y ejecutar el contenido de las migraciones
```

### 2. Regenerar Tipos después de Aplicar Migraciones
```powershell
.\scripts\regenerate-supabase-types.ps1 -UpdateMain
```

### 3. Verificar Validación
```powershell
.\scripts\validate-project-unified.ps1
```

## Notas Importantes

- **biometric_sessions** es crítica y debe aplicarse inmediatamente
- **app_logs** es opcional y puede aplicarse cuando se necesite logging avanzado
- Después de aplicar las migraciones, regenerar tipos para que TypeScript reconozca las nuevas tablas
- Las políticas RLS están configuradas para seguridad por defecto

