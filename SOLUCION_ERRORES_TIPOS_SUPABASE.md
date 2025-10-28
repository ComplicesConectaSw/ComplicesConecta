# 🔧 SOLUCIÓN: Errores de Tipos Supabase (never)

## 📊 **PROBLEMA RAÍZ IDENTIFICADO**

**ERROR**: Todos los archivos TypeScript muestran errores como:
```
No se puede asignar un argumento de tipo "table_name" al parámetro de tipo "never"
```

**CAUSA**: El archivo `src/types/supabase.ts` tiene el esquema `public` completamente vacío:
```typescript
public: {
  Tables: {
    [_ in never]: never
  }
}
```

**RAZÓN**: La base de datos de Docker **no tiene ninguna tabla** en el esquema `public` porque las migraciones no se han aplicado correctamente.

---

## 🔍 **DIAGNÓSTICO REALIZADO**

### 1. Verificación de Docker
```powershell
docker ps --format "{{.Names}}" | Select-String -Pattern "supabase"
# ✅ Containers corriendo correctamente
```

### 2. Verificación de tablas en DB
```sql
SELECT tablename FROM pg_tables WHERE schemaname='public';
# ❌ 0 rows - Base de datos vacía
```

### 3. Verificación de tipos generados
```typescript
// src/types/supabase.ts
Database['public']['Tables'] = [_ in never]: never  // ❌ Vacío
```

---

## 🛠️ **CORRECCIONES REALIZADAS**

### 1. **Renombrar migraciones con timestamps únicos**
- **Problema**: Todas las migraciones tenían fecha `20250128`, causando errores de clave duplicada
- **Solución**: Renombradas a `20251027210442` → `20251027210460` (incrementales)

```powershell
# Script ejecutado
$files = Get-ChildItem ".\supabase\migrations\" -Filter "20250128_*.sql"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$counter = 0
foreach ($file in $files) {
    $counter++
    $newName = "{0:D14}_{1}" -f ([long]$timestamp + $counter), ($file.Name -replace '^[0-9]+_','')
    Rename-Item $file.FullName $newName
}
```

### 2. **Corregir tipos de datos TEXT → UUID**
- **Problema**: Varias migraciones usaban `TEXT` para IDs que deberían ser `UUID`
- **Archivos corregidos**:
  - `20251027210451_create_invitation_templates_table.sql`
  - `20251027210453_create_messages_table.sql`

**Ejemplo de corrección**:
```sql
-- ❌ ANTES
id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,

-- ✅ DESPUÉS
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
```

### 3. **Corregir políticas RLS (auth.uid()::text → auth.uid())**
- **Problema**: Comparaciones de `auth.uid()::text` con campos UUID causaban errores
- **Error**: `operator does not exist: text = uuid`

**Ejemplo de corrección**:
```sql
-- ❌ ANTES
auth.uid()::text = sender_id

-- ✅ DESPUÉS
auth.uid() = sender_id
```

### 4. **Eliminar referencias a tablas inexistentes**
- **Problema**: `room_id TEXT REFERENCES chat_rooms(id)` cuando `chat_rooms` no existe
- **Solución**: Cambiar a `room_id UUID` (sin foreign key)

### 5. **Corregir referencias a columnas inexistentes**
- **Problema**: Políticas RLS referenciaban `account_type` que no existe en `profiles`
- **Solución**: Cambiar a usar solo `role = 'admin'`

```sql
-- ❌ ANTES
WHERE (account_type = 'admin' OR role = 'admin')

-- ✅ DESPUÉS  
WHERE role = 'admin'
```

### 6. **Reordenar migraciones**
- Mover `remote_schema.sql` al final: `20251027999999_remote_schema.sql`
- Mover `add_couple_profile_extended_fields.sql` después de crear tablas

---

##⚠️ **ESTADO ACTUAL**

### ✅ Migraciones aplicadas exitosamente (hasta ahora):
1. ✅ `20251027210449_create_core_and_advanced_tables.sql`
2. ✅ `20251027210450_create_couple_support_tables.sql`
3. ✅ `20251027210451_create_invitation_templates_table.sql`
4. ✅ `20251027210452_create_invitations_notifications_tables.sql`
5. ⏳ `20251027210453_create_messages_table.sql` - **EN PROCESO DE CORRECCIÓN**

### 📝 Migraciones pendientes de verificar (19 restantes)

---

## 📋 **PRÓXIMOS PASOS**

1. ⏳ **Continuar corrigiendo migraciones restantes**
   - Revisar cada migración para errores de tipos TEXT/UUID
   - Corregir políticas RLS con auth.uid()::text
   - Eliminar referencias a tablas inexistentes

2. **Aplicar todas las migraciones exitosamente**
   ```powershell
   npx supabase db reset --local
   ```

3. **Regenerar tipos de Supabase**
   ```powershell
   npx supabase gen types typescript --local > src/types/supabase.ts
   ```

4. **Verificar que errores desaparecieron**
   ```powershell
   npm run lint -- --no-fix
   ```

5. **Commit y push de cambios**

---

## 🎯 **ARCHIVOS AFECTADOS POR ERRORES (150 errores)**

### Servicios (9 archivos):
- `AdvancedAnalyticsService.ts`
- `AdvancedCoupleService.ts` 
- `CoupleProfilesService.ts`
- `InvitationsService.ts`
- `postsService.ts`
- `QueryOptimizationService.ts`
- `ReferralTokensService.ts`
- `ProfileReportService.ts`
- `SecurityService.ts`

### Componentes (2 archivos):
- `UserManagementPanel.tsx`
- `ChatWithLocation.tsx`

**Todos estos archivos se corregirán automáticamente** una vez que los tipos de Supabase se regeneren correctamente.

---

## ✅ **LECCIONES APRENDIDAS**

1. **Usar siempre timestamps únicos en migraciones** para evitar conflictos
2. **Mantener consistencia de tipos**: UUID en toda la base de datos
3. **No usar `::text` en comparaciones con UUIDs**
4. **Verificar que tablas referenciadas existan antes de crear foreign keys**
5. **Aplicar migraciones en orden correcto**: core tables → support tables → advanced features

---

**Fecha**: 27 de Octubre 2025  
**Versión**: v3.4.1  
**Estado**: 🔄 EN PROGRESO - Corrigiendo migraciones

