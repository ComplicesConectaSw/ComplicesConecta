# 🔧 Solución de Errores - Archivos Identificados
**Proyecto:** ComplicesConecta v3.4.1  
**Fecha:** 29 de octubre de 2025

---

## ✅ Resumen de Hallazgos

### Tablas Existentes (Confirmado en Migraciones):
- ✅ `notifications` - Existe en `apply-migrations-basic.sql` y `create_missing_tables_final.sql`
- ✅ `user_interests` - Existe en `apply-migrations-combined.sql` 
- ⚠️ `interests` - Se llama `swinger_interests` en las migraciones

### Problema Principal:
Los hooks usan nombres de tablas que no coinciden con el esquema actual o usan `as any` porque los tipos no están sincronizados.

---

## 🎯 Soluciones Implementadas

### 1. ✅ NotificationBell.tsx - TABLA EXISTE
**Estado:** La tabla `notifications` existe pero puede tener esquema diferente

**Campos en Migración:**
```sql
- id (SERIAL o UUID)
- user_id (UUID)
- title (VARCHAR)
- message (TEXT)
- type (VARCHAR)
- is_read (BOOLEAN)
- action_url (TEXT)
- metadata (JSONB)
- created_at (TIMESTAMP)
- read_at (TIMESTAMP)
```

**Acción:** Verificar que los tipos de Supabase incluyan esta tabla. Si no, regenerar.

---

### 2. ⚠️ useInterests.ts - NOMBRE INCORRECTO
**Estado:** La tabla se llama `swinger_interests`, NO `interests`

**Cambio Necesario:**
```typescript
// ❌ ANTES
.from('interests')

// ✅ DESPUÉS
.from('swinger_interests')
```

**Estructura Real:**
```sql
swinger_interests:
- id (SERIAL)
- name (VARCHAR)
- category (VARCHAR)
- description (TEXT)
- is_explicit (BOOLEAN)
- is_active (BOOLEAN)

user_interests:
- id (SERIAL)
- user_id (UUID)
- interest_id (INTEGER) → swinger_interests(id)
- privacy_level (VARCHAR)
```

---

### 3. 🔴 useWorldID.ts - CAMPOS INEXISTENTES
**Estado:** Los campos `worldid_*` NO existen en `user_token_balances`

**Estrategia:** Crear tabla separada para World ID

**Nueva Tabla Propuesta:**
```sql
CREATE TABLE worldid_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  nullifier_hash TEXT UNIQUE NOT NULL,
  verification_level VARCHAR(20),
  proof JSONB,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4. 🟢 ProfileSingle.tsx - USAR HOOK
**Estado:** Debería usar `useInterests` en vez de hardcodear

**Cambio Necesario:**
```typescript
// ❌ ANTES
interests: ['Lifestyle Swinger', ...],

// ✅ DESPUÉS
// Remover campo interests y usar:
const { userInterests } = useInterests();
```

---

## 📝 Plan de Implementación

### Paso 1: Regenerar Tipos de Supabase
```bash
npx supabase gen types typescript --local > src/types/supabase.ts
```

### Paso 2: Actualizar useInterests.ts
- Cambiar `interests` → `swinger_interests`
- Remover `as any` castings
- Actualizar interface `Interest` para incluir campos correctos

### Paso 3: Crear Migración para World ID
- Crear tabla `worldid_verifications`
- Actualizar `useWorldID.ts` para usar nueva tabla

### Paso 4: Actualizar ProfileSingle.tsx
- Integrar `useInterests` hook
- Remover intereses hardcodeados

### Paso 5: Verificar NotificationBell.tsx
- Confirmar que campos coinciden con esquema
- Agregar campos faltantes si es necesario

---

## ⚙️ Código de Soluciones

### useInterests.ts (Corrección)
```typescript
// Línea 35-39 - CORRECCIÓN
const { data, error } = await supabase
  .from('swinger_interests')  // ✅ Nombre correcto
  .select('*')
  .order('category', { ascending: true })
  .order('name', { ascending: true });

// Línea 60-69 - CORRECCIÓN
const { data, error } = await supabase
  .from('user_interests')
  .select(`
    interest_id,
    created_at,
    interest:swinger_interests(id, name, category, description)
  `)
  .eq('user_id', user.id);
```

---

##  Estado de Implementación

- [ ] Regenerar tipos de Supabase
- [ ] Actualizar useInterests.ts
- [ ] Crear migración World ID
- [ ] Actualizar useWorldID.ts
- [ ] Actualizar ProfileSingle.tsx
- [ ] Verificar NotificationBell.tsx
- [ ] Testing completo
- [ ] Commit y push

---

**Próximo Paso:** 
