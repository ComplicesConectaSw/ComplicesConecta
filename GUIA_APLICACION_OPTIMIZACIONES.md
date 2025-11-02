# 📋 Guía de Aplicación de Optimizaciones de BD

**Fecha:** 02 de Noviembre, 2025  
**Versión:** 3.5.0  
**Estado:** ✅ Script SQL Listo | ⏳ Requiere Ejecución en Supabase

---

## 🎯 Objetivo

Esta guía proporciona los pasos exactos para aplicar las optimizaciones de queries documentadas en `OPTIMIZACION_QUERIES_BD.md`.

---

## 📋 Checklist Pre-Implementación

### Antes de Aplicar Índices:

- [ ] **Backup de Base de Datos**: Crear backup completo antes de aplicar cambios
- [ ] **Verificar Acceso**: Tener acceso a Supabase Dashboard con permisos SQL
- [ ] **Tiempo de Mantenimiento**: Programar en ventana de bajo tráfico si es posible
- [ ] **Espacio en Disco**: Verificar que haya espacio suficiente (índices ocupan ~20-30% adicional)
- [ ] **Documentar Estado Actual**: Ejecutar queries de benchmarking antes

---

## 🚀 Proceso de Implementación

### Paso 1: Análisis Inicial (Requerido)

#### 1.1 Ejecutar EXPLAIN ANALYZE en Queries Críticas

Acceder a Supabase SQL Editor y ejecutar:

```sql
-- Query de Feed (ejemplo)
EXPLAIN ANALYZE
SELECT 
  id,
  user_id,
  description as content,
  content_type as post_type,
  media_urls,
  location,
  views_count,
  created_at,
  updated_at
FROM stories
WHERE is_public = true
ORDER BY created_at DESC
LIMIT 20;

-- Query de Perfiles con Filtros (ejemplo)
EXPLAIN ANALYZE
SELECT *
FROM profiles
WHERE age >= 18 
  AND age <= 35
  AND gender = 'male'
  AND is_verified = true
  AND is_online = true
ORDER BY last_seen DESC
LIMIT 20;
```

**Guardar resultados** en un documento para comparar antes/después.

#### 1.2 Medir Tiempos Actuales

```sql
-- Medir tiempo de queries frecuentes
\timing on

-- Query de feed
SELECT COUNT(*) FROM stories WHERE is_public = true;

-- Query de perfiles
SELECT COUNT(*) FROM profiles WHERE is_verified = true;

-- Query de analytics
SELECT COUNT(*) FROM token_transactions 
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

**Anotar tiempos** para comparación posterior.

---

### Paso 2: Aplicar Índices

#### 2.1 Ejecutar Script de Migración

1. **Acceder a Supabase Dashboard**
   - Ir a: `https://supabase.com/dashboard/project/[TU_PROJECT_ID]`
   - Navegar a: **SQL Editor**

2. **Copiar Script Completo**
   - Abrir: `supabase/migrations/20251102000000_optimize_queries_indexes.sql`
   - Copiar todo el contenido

3. **Pegar y Ejecutar**
   - Pegar en SQL Editor
   - Revisar que no haya errores de sintaxis
   - Hacer clic en **Run** o presionar `Ctrl+Enter`

4. **Verificar Creación de Índices**
   ```sql
   SELECT 
     schemaname,
     tablename,
     indexname
   FROM pg_indexes
   WHERE schemaname = 'public'
     AND indexname LIKE 'idx_%'
   ORDER BY tablename, indexname;
   ```

#### 2.2 Ejecutar ANALYZE

Después de crear los índices, ejecutar:

```sql
ANALYZE profiles;
ANALYZE stories;
ANALYZE messages;
ANALYZE token_transactions;
ANALYZE matches;
ANALYZE token_analytics;
ANALYZE user_token_balances;
ANALYZE staking_records;
```

**Esto actualiza las estadísticas** que PostgreSQL usa para el planificador de queries.

---

### Paso 3: Validación Post-Implementación

#### 3.1 Re-ejecutar EXPLAIN ANALYZE

Ejecutar las mismas queries del Paso 1.1 y comparar:

- **Tiempo de ejecución**: Debe ser significativamente menor
- **Plan de ejecución**: Debe usar los nuevos índices (buscar `Index Scan` o `Index Only Scan`)

#### 3.2 Medir Tiempos Después

```sql
\timing on

-- Mismas queries del Paso 1.2
SELECT COUNT(*) FROM stories WHERE is_public = true;
SELECT COUNT(*) FROM profiles WHERE is_verified = true;
SELECT COUNT(*) FROM token_transactions 
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

**Comparar con tiempos anteriores** y documentar mejoras.

#### 3.3 Verificar Uso de Índices

```sql
-- Verificar que los índices se están usando
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;
```

**Índices con `idx_scan = 0`** después de unos días pueden ser innecesarios.

---

### Paso 4: Monitoreo Continuo

#### 4.1 Monitorear Tamaño de Índices

```sql
-- Tamaño de índices creados
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY pg_relation_size(indexrelid) DESC;
```

#### 4.2 Monitorear Performance

- **New Relic APM**: Verificar mejora en tiempos de respuesta
- **Supabase Dashboard**: Monitorear métricas de database
- **Application Logs**: Verificar que queries sean más rápidas

#### 4.3 Verificar Impacto en Escrituras

Los índices ralentizan INSERT/UPDATE. Verificar que el impacto sea aceptable:

```sql
-- Medir tiempo de INSERT
\timing on
INSERT INTO profiles (user_id, email, created_at) 
VALUES (gen_random_uuid(), 'test@test.com', NOW());
```

---

## 📊 Métricas de Éxito Esperadas

### Queries de Feed:
- **Antes**: 500ms - 2s
- **Después**: < 100ms ✅
- **Mejora esperada**: 5-20x más rápido

### Queries de Perfiles con Filtros:
- **Antes**: 1s - 3s
- **Después**: < 200ms ✅
- **Mejora esperada**: 5-15x más rápido

### Queries de Analytics:
- **Antes**: 2s - 5s
- **Después**: < 500ms ✅
- **Mejora esperada**: 4-10x más rápido

---

## ⚠️ Troubleshooting

### Problema: Índice no se está usando

**Solución:**
1. Verificar que la query use la condición del índice parcial (WHERE)
2. Ejecutar `ANALYZE` en la tabla
3. Verificar que los datos cumplan con la condición del índice

### Problema: Índice ocupa demasiado espacio

**Solución:**
1. Revisar si el índice realmente se usa (`idx_scan > 0`)
2. Considerar usar índices parciales más específicos
3. Revisar si hay redundancia con otros índices

### Problema: INSERT/UPDATE más lento

**Solución:**
1. Normal - los índices ralentizan escrituras
2. Monitorear que el impacto sea aceptable (< 20% más lento)
3. Si es crítico, considerar índices solo en lectura frecuente

---

## 🔄 Rollback (Si es Necesario)

Si los índices causan problemas, pueden eliminarse:

```sql
-- Eliminar índices específicos (ejemplo)
DROP INDEX IF EXISTS idx_stories_public_created_at;
DROP INDEX IF EXISTS idx_profiles_age;
-- etc...

-- O eliminar todos los índices de optimización:
DROP INDEX IF EXISTS idx_stories_public_created_at;
DROP INDEX IF EXISTS idx_stories_engagement;
DROP INDEX IF EXISTS idx_profiles_age;
DROP INDEX IF EXISTS idx_profiles_gender;
DROP INDEX IF EXISTS idx_profiles_interests_gin;
DROP INDEX IF EXISTS idx_profiles_filters_composite;
DROP INDEX IF EXISTS idx_profiles_s2_cell;
DROP INDEX IF EXISTS idx_profiles_analytics;
DROP INDEX IF EXISTS idx_profiles_recent;
DROP INDEX IF EXISTS idx_token_analytics_created_at;
DROP INDEX IF EXISTS idx_user_token_balances_active;
DROP INDEX IF EXISTS idx_staking_records_active;
DROP INDEX IF EXISTS idx_token_transactions_recent;
DROP INDEX IF EXISTS idx_token_transactions_type;
DROP INDEX IF EXISTS idx_messages_chat_created_at;
DROP INDEX IF EXISTS idx_messages_sender;
DROP INDEX IF EXISTS idx_messages_receiver;
DROP INDEX IF EXISTS idx_messages_unread;
DROP INDEX IF EXISTS idx_matches_user_created_at;
DROP INDEX IF EXISTS idx_matches_mutual;
DROP INDEX IF EXISTS idx_posts_public_created_at;
DROP INDEX IF EXISTS idx_stories_user_created_at;
DROP INDEX IF EXISTS idx_reports_status;
DROP INDEX IF EXISTS idx_reports_content_type;
```

---

## 📝 Checklist Post-Implementación

- [ ] Índices creados correctamente
- [ ] ANALYZE ejecutado en todas las tablas
- [ ] EXPLAIN ANALYZE muestra uso de índices
- [ ] Tiempos de queries mejorados significativamente
- [ ] Impacto en INSERT/UPDATE es aceptable
- [ ] Métricas de aplicación muestran mejora
- [ ] Documentación actualizada con resultados

---

## 🎯 Próximos Pasos Después de Aplicar Índices

1. **Monitorear por 1 semana** para validar mejoras
2. **Revisar índices no usados** y considerar eliminarlos
3. **Optimizar queries adicionales** basándose en EXPLAIN ANALYZE real
4. **Considerar índices adicionales** si aparecen nuevos patrones de query
5. **Documentar resultados finales** en `OPTIMIZACION_QUERIES_BD.md`

---

## 📚 Referencias

- **Documento Principal**: `OPTIMIZACION_QUERIES_BD.md`
- **Script SQL**: `supabase/migrations/20251102000000_optimize_queries_indexes.sql`
- **Documentación Supabase**: https://supabase.com/docs/guides/database/indexes

---

**Nota Final**: Esta guía asume acceso a Supabase Dashboard. Si no tienes acceso, contactar al administrador del proyecto para aplicar los cambios.

