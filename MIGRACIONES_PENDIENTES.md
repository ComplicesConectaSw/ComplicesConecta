# Migraciones Pendientes - ComplicesConecta v3.4.1

## Estado Actual

### ❌ Campos Faltantes en `couple_profiles`
Los servicios TypeScript intentan usar 29 campos que NO existen actualmente en la base de datos:

**Campos de Funcionalidad Swinger:**
- `looking_for` - Qué busca la pareja
- `experience_level` - Nivel de experiencia general
- `swinger_experience` - Experiencia específica swinger
- `interested_in` - Tipo de personas que buscan
- `max_distance` - Distancia máxima para matches
- `age_range_min` - Edad mínima
- `age_range_max` - Edad máxima

**Campos de Ubicación:**
- `latitude`, `longitude` - Coordenadas GPS
- `city`, `state`, `country`, `location` - Datos de ubicación

**Campos de Personalización:**
- `display_name` - Nombre para mostrar
- `preferred_theme` - Tema preferido
- `is_public` - Perfil público/privado
- `privacy_settings` - Configuración de privacidad

**Campos de Seguridad:**
- `is_demo` - Perfil de demostración
- `verification_level` - Nivel de verificación
- `last_active` - Última actividad
- `profile_completed_at` - Fecha de completado

**Campos de Estadísticas:**
- `total_views`, `total_likes`, `total_matches` - Contadores
- `profile_completeness` - Porcentaje completado

**Campos de Preferencias Swinger:**
- `couple_interests` - Intereses de la pareja
- `activities_interested` - Actividades
- `event_types` - Tipos de eventos
- `communication_preference` - Preferencia comunicación

**Campos Adicionales:**
- `couple_age_range`, `couple_height_range`
- `couple_body_type`, `couple_lifestyle`, `couple_availability`

---

## 🔧 Solución: Aplicar Migración

### Opción 1: Via Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI si no está instalado
npm install -g supabase

# 2. Iniciar Supabase local (si usas Docker)
supabase start

# 3. Aplicar la migración
supabase migration up
```

### Opción 2: Via Docker Compose

```bash
# 1. Navegar al directorio del proyecto
cd C:\Users\conej\Documents\conecta-social-comunidad-main

# 2. Ejecutar la migración en el contenedor
docker exec -it supabase_db psql -U postgres -d postgres -f /supabase/migrations/20250128_add_couple_profile_extended_fields.sql
```

### Opción 3: Via Dashboard de Supabase

1. Ir a: https://supabase.com/dashboard
2. Seleccionar proyecto `ComplicesConecta`
3. SQL Editor → New Query
4. Copiar contenido de: `supabase/migrations/20250128_add_couple_profile_extended_fields.sql`
5. Ejecutar query
6. Verificar éxito

### Opción 4: Via psql Directo

```bash
# Conectar a Supabase local
psql -h localhost -p 54322 -U postgres -d postgres

# Ejecutar el archivo
\i supabase/migrations/20250128_add_couple_profile_extended_fields.sql

# Verificar columnas
\d couple_profiles
```

---

## ✅ Verificación Post-Migración

### 1. Verificar que los campos existen:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'couple_profiles'
AND column_name IN (
    'looking_for', 'experience_level', 'swinger_experience',
    'interested_in', 'max_distance', 'age_range_min', 'age_range_max',
    'latitude', 'longitude', 'location', 'couple_interests'
)
ORDER BY column_name;
```

### 2. Verificar índices:

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'couple_profiles'
AND indexname LIKE 'idx_couple_profiles_%';
```

### 3. Verificar triggers:

```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'couple_profiles';
```

---

## 🔄 Después de Aplicar la Migración

### Pasos siguientes:

1. **Verificar errores de linting:**
   ```bash
   npm run lint
   ```

2. **Actualizar types de Supabase:**
   ```bash
   npx supabase gen types typescript --local > src/types/supabase.ts
   ```

3. **Ejecutar tests:**
   ```bash
   npm test -- --run
   ```

4. **Commit cambios:**
   ```bash
   git add .
   git commit -m "feat: Aplicar migración campos extendidos couple_profiles"
   git push origin master
   ```

---

## 📊 Impacto

**Antes de migración:**
- ❌ 27 errores de TypeScript
- ❌ CoupleProfilesService: 20 errores
- ❌ AdvancedCoupleService: 7 errores

**Después de migración:**
- ✅ 0 errores esperados
- ✅ Servicios completamente funcionales
- ✅ Todas las funcionalidades swinger habilitadas

---

## 🚨 Notas Importantes

1. **Backup:** Esta migración usa `ADD COLUMN IF NOT EXISTS`, es segura y no perderá datos
2. **Performance:** Los índices mejorarán las búsquedas de parejas
3. **Compatibilidad:** Campos tienen valores por defecto, perfiles existentes funcionarán
4. **Rollback:** Si algo falla, simplemente no uses los campos nuevos

---

## 📁 Archivos Relacionados

- ✅ Migración creada: `supabase/migrations/20250128_add_couple_profile_extended_fields.sql`
- 📝 Servicios afectados:
  - `src/services/CoupleProfilesService.ts`
  - `src/services/AdvancedCoupleService.ts`
- 🔧 Scripts auxiliares (si existen):
  - `supabase/migrations/add_couple_profile_fields.sql`
  - `supabase/migrations/add_couple_profile_fields_complete.sql`

---

## ❓ Troubleshooting

### Error: "relation 'couple_profiles' does not exist"
- **Solución:** Primero crear la tabla base con `couple_profiles_tables.sql`

### Error: "column already exists"
- **Solución:** Normal, la migración usa `IF NOT EXISTS`

### Error: "permission denied"
- **Solución:** Verificar permisos de usuario PostgreSQL

### No veo los cambios
- **Solución:** Verificar que estás conectado a la BD correcta (local vs producción)

