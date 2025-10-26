# 📋 PLAN DE ACCIÓN PENDIENTE - ComplicesConecta v3.4.1

## 🎯 Estado Actual de la Sesión (28-01-2025)

### ✅ Completado en Esta Sesión
```diff
+ 4 migraciones SQL aplicadas exitosamente
+ 20 tablas creadas (3 nuevas: user_token_balances, referral_rewards, gallery_permissions)
+ 75 índices optimizados
+ 9 triggers automatizados
+ Tipos TypeScript regenerados
+ Sistema de tokens implementado al 100%
+ Sistema de permisos de galería implementado
+ Sistema de recompensas por referidos implementado
```

---

## 🔧 ARCHIVOS CON CORRECCIONES PENDIENTES

### Prioridad ALTA (Afectan funcionalidad)

#### 1. **UserManagementPanel.tsx**
**Ubicación**: `src/components/admin/UserManagementPanel.tsx`

**Problema**: 
- Línea 91: Usa `profile.first_name` que no existe en el esquema actual
- El esquema de `profiles` ahora usa `name` en lugar de `first_name` y `last_name`

**Corrección Necesaria**:
```typescript
// ❌ ANTES (línea 91):
name: profile.first_name || profile.bio?.split(' ')[0] || 'Usuario sin nombre',

// ✅ DESPUÉS:
name: profile.name || profile.bio?.split(' ')[0] || 'Usuario sin nombre',
```

**Archivos Relacionados**: 
- `src/types/supabase.ts` (esquema actualizado)

**Impacto**: ALTO - Panel de administración no puede cargar nombres de usuarios correctamente

---

#### 2. **ChatWithLocation.tsx**
**Ubicación**: `src/components/chat/ChatWithLocation.tsx`

**Problema**: 
- Línea 59: Usa `first_name` y `last_name` que no existen en el esquema actual
- El esquema de `profiles` ahora usa `name`

**Corrección Necesaria**:
```typescript
// ❌ ANTES (línea 59):
sender_name: `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`.trim(),

// ✅ DESPUÉS:
sender_name: msg.sender?.name || 'Usuario',
```

**Impacto**: ALTO - Chat no puede mostrar nombres de remitentes correctamente

---

#### 3. **DiscoverProfileCard.tsx**
**Ubicación**: `src/components/discover/DiscoverProfileCard.tsx`

**Problema**: 
- Línea 5: Importa tipos de `@/types/database` (obsoleto)
- Líneas 14-32: Define tipos manualmente en lugar de usar los de Supabase
- Usa `first_name` y `last_name` en la interfaz `DiscoverProfile`

**Corrección Necesaria**:
```typescript
// ❌ ANTES (línea 5):
import type { Tables } from '@/types/database';

// ✅ DESPUÉS:
import type { Database } from '@/types/supabase';
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// ❌ ANTES (líneas 16-17):
first_name: string;
last_name: string;

// ✅ DESPUÉS:
name: string;

// ❌ ANTES (líneas 88-90):
const getFullName = useCallback((): string => {
  return `${profile.first_name} ${profile.last_name ?? ''}`.trim();
}, [profile.first_name, profile.last_name]);

// ✅ DESPUÉS:
const getFullName = useCallback((): string => {
  return profile.name || 'Usuario';
}, [profile.name]);
```

**Impacto**: ALTO - Cards de descubrimiento no pueden mostrar nombres correctamente

---

### Prioridad MEDIA (Mejoras de código)

#### 4. **apply-couple-migration.ps1**
**Ubicación**: `apply-couple-migration.ps1`

**Problema**: 
- Línea 94: Variable `$dockerRunning` declarada pero no usada (warning)

**Corrección Necesaria**:
```powershell
# ❌ ANTES (línea 94):
$dockerRunning = docker ps 2>$null

# ✅ DESPUÉS: Remover línea o usar la variable
# Opción 1: Remover
# (simplemente eliminar la línea)

# Opción 2: Usar para validación
$dockerRunning = docker ps 2>$null
if (-not $dockerRunning) {
    Write-Host "⚠️ Docker no está corriendo" -ForegroundColor Yellow
}
```

**Impacto**: BAJO - Es solo un warning, no afecta funcionalidad

---

#### 5. **useWorldID.ts**
**Ubicación**: `src/hooks/useWorldID.ts`

**Problema**: 
- Líneas 44, 116, 147: Intentaba acceder a tablas que no existían
- **RESUELTO**: Las tablas `user_token_balances`, `referral_rewards` ya fueron creadas en la migración `20250128_create_token_tables.sql`

**Estado**: ✅ RESUELTO - Verificar que los tipos regenerados incluyan estas tablas

**Verificación Necesaria**:
```bash
# Verificar que las tablas existen
npx supabase gen types typescript --local > src/types/supabase.ts

# Verificar en código que las tablas aparecen en los tipos
grep -n "user_token_balances\|referral_rewards" src/types/supabase.ts
```

**Impacto**: BAJO - Ya está resuelto, solo necesita verificación

---

#### 6. **invitations.ts**
**Ubicación**: `src/lib/invitations.ts`

**Problema**: 
- Línea 217: Intentaba acceder a tabla `gallery_permissions` que no existía
- **RESUELTO**: La tabla `gallery_permissions` ya fue creada en la migración `20250128_create_token_tables.sql`

**Estado**: ✅ RESUELTO - Verificar que los tipos regenerados incluyan esta tabla

**Verificación Necesaria**:
```bash
# Verificar que la tabla existe
grep -n "gallery_permissions" src/types/supabase.ts
```

**Impacto**: BAJO - Ya está resuelto, solo necesita verificación

---

#### 7. **NotificationBell.tsx**
**Ubicación**: `src/components/notifications/NotificationBell.tsx`

**Estado**: ✅ SIN ERRORES CRÍTICOS

**Notas**: 
- Componente funcional y bien implementado
- Usa correctamente los tipos de Supabase
- Maneja demo users correctamente
- No requiere cambios inmediatos

---

## 📊 ERRORES DE LINTING RESTANTES

### Errores de Parsing (No Críticos)
```
- 3 errores de "Unexpected newline between function and ("
  Ubicación: Archivos con llamadas de función mal formateadas
  Solución: Formatear código con Prettier

- 1 error de "Unexpected keyword or identifier"
  Ubicación: Por determinar con npm run lint
  Solución: Revisar sintaxis del archivo afectado
```

### Warnings (Menores)
```
- 3 warnings de variables no usadas
  Impacto: BAJO - Solo advertencias, no errores
  Solución: Remover o prefijar con _ las variables no usadas
```

---

## 🎯 PLAN DE EJECUCIÓN PASO A PASO

### Fase 1: Correcciones Críticas (30 min)
```bash
# Paso 1.1: Corregir UserManagementPanel.tsx
# - Reemplazar first_name por name (línea 91)
# - Verificar otras referencias a first_name en el archivo

# Paso 1.2: Corregir ChatWithLocation.tsx
# - Reemplazar first_name/last_name por name (línea 59)
# - Verificar la query de sender en el select

# Paso 1.3: Corregir DiscoverProfileCard.tsx
# - Actualizar import de tipos (línea 5)
# - Reemplazar first_name/last_name por name en interfaz (líneas 16-17)
# - Actualizar función getFullName (líneas 88-90)
```

### Fase 2: Verificación de Migraciones (15 min)
```bash
# Paso 2.1: Verificar tipos regenerados
npx supabase gen types typescript --local > src/types/supabase.ts

# Paso 2.2: Verificar tablas creadas
grep -n "user_token_balances\|referral_rewards\|gallery_permissions" src/types/supabase.ts

# Paso 2.3: Ejecutar linting
npm run lint
```

### Fase 3: Correcciones Menores (15 min)
```bash
# Paso 3.1: Formatear código
npm run format  # o usar Prettier extension

# Paso 3.2: Corregir apply-couple-migration.ps1
# - Remover o usar variable $dockerRunning (línea 94)

# Paso 3.3: Verificar warnings
npm run lint | grep "warning"
```

### Fase 4: Testing (30 min)
```bash
# Paso 4.1: Ejecutar tests unitarios
npm test -- --run

# Paso 4.2: Verificar cobertura
npm run test:coverage

# Paso 4.3: Verificar build
npm run build
```

### Fase 5: Commit y Deploy (15 min)
```bash
# Paso 5.1: Commit de correcciones
git add -A
git commit -m "fix: Corregir referencias a first_name/last_name en componentes

- UserManagementPanel: Usar 'name' en lugar de 'first_name'
- ChatWithLocation: Actualizar sender_name a usar 'name'
- DiscoverProfileCard: Migrar a tipos de supabase y usar 'name'
- apply-couple-migration.ps1: Limpiar variable no usada

Relacionado con migración v3.4.1 y schema actualizado de profiles"

# Paso 5.2: Push a master
git push origin master

# Paso 5.3: Verificar en entorno
# (si aplica)
```

---

## 📚 DOCUMENTACIÓN GENERADA

### Archivos de Documentación Creados
- ✅ `ESTADO_FINAL_MIGRACIONES_v3.4.1.md` (estado de migraciones)
- ✅ `IMPLEMENTACION_FINAL_COMPLETADA_v3.4.1.md` (resumen de implementación)
- ✅ `PLAN_ACCION_PENDIENTE_v3.4.1.md` (este archivo - plan de acción)
- ✅ `MIGRACION_COMPLETADA_EXITOSAMENTE.md` (migración completada)
- ✅ `RESUMEN_MIGRACION_COUPLE_PROFILES.md` (resumen visual)

### Migraciones SQL Creadas
- ✅ `supabase/migrations/20250128_add_couple_profile_extended_fields.sql`
- ✅ `supabase/migrations/20250128_create_couple_support_tables.sql`
- ✅ `supabase/migrations/20250128_create_invitations_notifications_tables.sql`
- ✅ `supabase/migrations/20250128_create_token_tables.sql`

---

## 🔍 VERIFICACIONES NECESARIAS

### Checklist de Verificación Pre-Commit
- [ ] Todos los imports usan `@/types/supabase` (no `@/types/database`)
- [ ] No hay referencias a `first_name` o `last_name` en código nuevo
- [ ] Usar `profile.name` para nombres de usuario
- [ ] Todas las tablas necesarias tienen tipos en `src/types/supabase.ts`
- [ ] Tests pasan con >95% de cobertura
- [ ] Build se completa sin errores
- [ ] Linting muestra 0 errores críticos

### Comandos de Verificación Rápida
```bash
# Buscar referencias a first_name/last_name
grep -rn "first_name\|last_name" src/components/admin/UserManagementPanel.tsx
grep -rn "first_name\|last_name" src/components/chat/ChatWithLocation.tsx
grep -rn "first_name\|last_name" src/components/discover/DiscoverProfileCard.tsx

# Verificar imports de tipos obsoletos
grep -rn "@/types/database" src/

# Verificar que tablas existen en tipos
grep -n "user_token_balances\|referral_rewards\|gallery_permissions" src/types/supabase.ts
```

---

## 📊 MÉTRICAS DE PROGRESO

### Estado Actual
| Categoría | Completado | Total | %  |
|-----------|------------|-------|-----|
| **Migraciones SQL** | 4 | 4 | 100% ✅ |
| **Tablas Creadas** | 20 | 20 | 100% ✅ |
| **Índices** | 75 | 75 | 100% ✅ |
| **Triggers** | 9 | 9 | 100% ✅ |
| **Correcciones de Código** | 0 | 3 | 0% ⚠️ |
| **Tests** | 0 | 1 | 0% ⚠️ |
| **Documentación** | 5 | 5 | 100% ✅ |

### Progreso General del Proyecto
```
████████████████████████████████████░░░░  90%
```

---

## 🎉 PRÓXIMOS PASOS INMEDIATOS

### Al Retomar la Sesión:

1. **Leer este documento completo** ✅
2. **Ejecutar Fase 1** (Correcciones Críticas - 30 min)
3. **Ejecutar Fase 2** (Verificación - 15 min)
4. **Ejecutar Fase 3** (Correcciones Menores - 15 min)
5. **Ejecutar Fase 4** (Testing - 30 min)
6. **Ejecutar Fase 5** (Commit y Deploy - 15 min)

**Tiempo Total Estimado**: 1 hora 45 minutos

---

## 💡 NOTAS IMPORTANTES

### Cambios en el Esquema de Profiles
```diff
- first_name: string
- last_name: string
+ name: string
```

Este cambio afecta:
- ✅ Servicios de backend (ya corregidos)
- ⚠️ UserManagementPanel.tsx (pendiente)
- ⚠️ ChatWithLocation.tsx (pendiente)
- ⚠️ DiscoverProfileCard.tsx (pendiente)

### Tablas Nuevas Disponibles
```sql
-- Sistema de Tokens
✅ user_token_balances (CMPX, GTK)
✅ referral_rewards (recompensas)
✅ gallery_permissions (permisos)

-- Sistema de Parejas
✅ couple_profiles (49 campos)
✅ couple_profile_likes
✅ couple_profile_views
✅ couple_profile_reports
✅ couple_events
✅ couple_matches
✅ couple_interactions

-- Sistema de Conexiones
✅ invitations
✅ notifications
✅ matches
✅ reports
```

---

## 🔗 Enlaces Rápidos

### Documentación
- [Estado Final Migraciones](./ESTADO_FINAL_MIGRACIONES_v3.4.1.md)
- [Implementación Completada](./IMPLEMENTACION_FINAL_COMPLETADA_v3.4.1.md)
- [Migración Exitosa](./MIGRACION_COMPLETADA_EXITOSAMENTE.md)

### Scripts y Herramientas
- [Script de Migración PowerShell](./apply-couple-migration.ps1)
- Comando de tipos: `npx supabase gen types typescript --local > src/types/supabase.ts`
- Comando de tests: `npm test -- --run`

---

**Generado**: 2025-01-28 20:15 UTC  
**Versión**: v3.4.1  
**Estado**: 🟡 EN PROGRESO (90% completado)  
**Próxima Sesión**: Correcciones de componentes React + Testing

---

**🎯 OBJETIVO FINAL**: Sistema 100% funcional, 0 errores críticos, >95% test coverage, listo para producción 🚀

