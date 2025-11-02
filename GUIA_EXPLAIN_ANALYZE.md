# 📊 Guía de EXPLAIN ANALYZE para Queries Críticas

**Fecha:** 02 de Noviembre, 2025  
**Versión:** 3.5.0  
**Estado:** ✅ Script SQL Listo y Corregido | ⏳ Requiere Ejecución en Supabase SQL Editor

**Nota:** Todas las queries han sido corregidas según el esquema real de la base de datos. El archivo `queries-critical-analyze.sql` está listo para ejecutar EXPLAIN ANALYZE sin errores.

---

## 🎯 Objetivo

Esta guía proporciona los pasos exactos para ejecutar EXPLAIN ANALYZE en las queries críticas de ComplicesConecta y documentar los resultados antes y después de aplicar índices.

---

## 📋 Checklist Pre-Análisis

### Antes de Ejecutar EXPLAIN ANALYZE:

- [ ] **Acceso a Supabase Dashboard**: Tener acceso con permisos SQL
- [ ] **Tiempo disponible**: Permitir ~30-60 minutos para análisis completo
- [ ] **Documentación**: Preparar documento para registrar resultados
- [ ] **Estado actual**: Ejecutar queries ANTES de aplicar índices
- [ ] **Backup**: Asegurar backup de base de datos antes de cambios

---

## 🚀 Proceso de Análisis

### Paso 1: Preparar Ambiente

1. **Acceder a Supabase Dashboard**
   - Ir a: `https://supabase.com/dashboard/project/[TU_PROJECT_ID]`
   - Navegar a: **SQL Editor**

2. **Abrir Script de Queries**
   - Abrir: `supabase/queries-critical-analyze.sql`
   - O copiar queries específicas según prioridad

---

### Paso 2: Ejecutar EXPLAIN ANALYZE (Antes de Índices)

#### 2.1 Queries de Prioridad ALTA

**Query 1.1: Feed público ordenado por fecha**
```sql
EXPLAIN ANALYZE
SELECT 
  id, user_id, description as content, content_type as post_type,
  media_urls, location, views_count, created_at, updated_at
FROM stories
WHERE is_public = true
ORDER BY created_at DESC
LIMIT 20;
```

**Documentar:**
- ⏱️ **Tiempo de ejecución:** ____ ms
- 📊 **Plan de ejecución:** (copiar resultado completo)
- 🔍 **Índices usados:** (si los hay)
- ⚠️ **Problemas identificados:** (Seq Scan, Filter, Sort costoso, etc.)

---

**Query 2.1: Perfiles con filtros básicos**
```sql
EXPLAIN ANALYZE
SELECT *
FROM profiles
WHERE age >= 18 AND age <= 35
  AND gender = 'male'
  AND is_verified = true
  AND is_online = true
ORDER BY last_seen DESC
LIMIT 20;
```

**Documentar:**
- ⏱️ **Tiempo de ejecución:** ____ ms
- 📊 **Plan de ejecución:** (copiar resultado completo)
- 🔍 **Índices usados:** (si los hay)
- ⚠️ **Problemas identificados:**

---

**Query 3.1: Mensajes por chat**
```sql
EXPLAIN ANALYZE
SELECT id, chat_id, sender_id, receiver_id, message, is_read, created_at
FROM messages
WHERE chat_id = 'EJEMPLO_CHAT_ID' -- Reemplazar con ID real
ORDER BY created_at DESC
LIMIT 50;
```

**Nota:** Usar un `chat_id` real de tu base de datos.

**Documentar:**
- ⏱️ **Tiempo de ejecución:** ____ ms
- 📊 **Plan de ejecución:** (copiar resultado completo)
- 🔍 **Índices usados:** (si los hay)
- ⚠️ **Problemas identificados:**

---

**Query 7.1: Usuarios en S2 cell**
```sql
EXPLAIN ANALYZE
SELECT *
FROM profiles
WHERE s2_cell_id = 'EJEMPLO_S2_CELL_ID' -- Reemplazar con ID real
ORDER BY last_seen DESC
LIMIT 20;
```

**Nota:** Usar un `s2_cell_id` real de tu base de datos.

**Documentar:**
- ⏱️ **Tiempo de ejecución:** ____ ms
- 📊 **Plan de ejecución:** (copiar resultado completo)
- 🔍 **Índices usados:** (si los hay)
- ⚠️ **Problemas identificados:**

---

#### 2.2 Queries de Prioridad MEDIA

Ejecutar y documentar:
- Query 4.1: Matches mutuos
- Query 5.1: Analytics de perfiles
- Query 6.1: Reports pendientes

---

### Paso 3: Aplicar Índices

1. **Ejecutar Script de Migración**
   - Ir a: `supabase/migrations/20251102000000_optimize_queries_indexes.sql`
   - Copiar contenido completo
   - Pegar en SQL Editor
   - Ejecutar

2. **Ejecutar ANALYZE**
   ```sql
   ANALYZE profiles;
   ANALYZE stories;
   ANALYZE messages;
   ANALYZE matches;
   ANALYZE token_transactions;
   ANALYZE token_analytics;
   ANALYZE reports;
   ```

---

### Paso 4: Re-ejecutar EXPLAIN ANALYZE (Después de Índices)

#### 4.1 Ejecutar las Mismas Queries

Re-ejecutar todas las queries del Paso 2 con EXPLAIN ANALYZE.

#### 4.2 Comparar Resultados

Para cada query, comparar:

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Tiempo de ejecución | ____ ms | ____ ms | ____% |
| Índices usados | ❌/✅ | ❌/✅ | - |
| Seq Scan | Sí/No | Sí/No | - |
| Index Scan | No/Sí | No/Sí | - |

#### 4.3 Documentar Mejoras

**Ejemplo:**
```
Query 1.1: Feed público
- Antes: 500ms, Seq Scan en stories
- Después: 45ms, Index Scan usando idx_stories_public_created_at
- Mejora: 91% más rápido
```

---

## 📊 Interpretación de Resultados

### Señales de Problemas:

1. **Seq Scan (Sequential Scan)**
   - ⚠️ Señal de problema si la tabla es grande
   - ✅ Esperado si la tabla es pequeña (< 1000 filas)

2. **Filter costoso**
   - ⚠️ Si el costo del Filter es alto
   - Indica que necesita índice en columna filtrada

3. **Sort costoso**
   - ⚠️ Si el costo del Sort es alto
   - Indica que necesita índice en columna de ORDER BY

4. **Tiempo de ejecución alto**
   - ⚠️ > 100ms para queries simples
   - ⚠️ > 500ms para queries complejas
   - ⚠️ > 1s indica problema crítico

### Señales de Éxito:

1. **Index Scan / Index Only Scan**
   - ✅ Indica que el índice se está usando
   - ✅ Tiempos de ejecución < 100ms

2. **Bitmap Index Scan**
   - ✅ Buena para queries con múltiples condiciones
   - ✅ Más eficiente que múltiples Index Scans

3. **Planning time bajo**
   - ✅ < 10ms indica buen planificador
   - ✅ Re-planning no frecuente

---

## 🔧 Troubleshooting

### Problema: Índice no se está usando

**Causas posibles:**
- Estadísticas desactualizadas → Ejecutar `ANALYZE table_name;`
- Índice muy grande para datos pequeños → PostgreSQL puede preferir Seq Scan
- Query no coincide con índice → Verificar WHERE/ORDER BY

**Solución:**
```sql
-- Forzar uso de índice (si es necesario)
SET enable_seqscan = OFF;
EXPLAIN ANALYZE ...;
SET enable_seqscan = ON;
```

---

### Problema: Tiempo de ejecución no mejora

**Causas posibles:**
- Datos insuficientes → Índices no tienen efecto hasta ~10,000+ filas
- Query mal escrita → Revisar estructura de query
- Índice incorrecto → Revisar columnas en índice

**Solución:**
- Verificar tamaño de tabla: `SELECT COUNT(*) FROM table_name;`
- Revisar estructura de índice: `\d table_name` en psql
- Ajustar índice según patrones de uso reales

---

## 📝 Template de Documentación

### Resultados de EXPLAIN ANALYZE

**Fecha:** ____  
**Proyecto:** ComplicesConecta v3.5.0  
**Ambiente:** Supabase [Production/Staging]

#### Query 1.1: Feed público ordenado por fecha

**Antes de índices:**
```
Tiempo: ____ ms
Plan:
[copiar plan completo aquí]
```

**Después de índices:**
```
Tiempo: ____ ms
Plan:
[copiar plan completo aquí]
```

**Mejoras:**
- Reducción de tiempo: ____% (____ ms → ____ ms)
- Índices usados: ✅/❌
- Otros cambios: ____

---

## ⏭️ Próximos Pasos

Después de completar EXPLAIN ANALYZE:

1. [ ] **Documentar resultados** en este archivo o documento separado
2. [ ] **Aplicar índices** según recomendaciones (`GUIA_APLICACION_OPTIMIZACIONES.md`)
3. [ ] **Validar mejoras** re-ejecutando EXPLAIN ANALYZE
4. [ ] **Monitorear en producción** para verificar mejoras reales
5. [ ] **Actualizar documentación** con resultados reales

---

## 📚 Referencias

- [PostgreSQL EXPLAIN Documentation](https://www.postgresql.org/docs/current/sql-explain.html)
- [Understanding EXPLAIN ANALYZE](https://www.postgresql.org/docs/current/using-explain.html)
- [Index Optimization Guide](https://use-the-index-luke.com/)
- `OPTIMIZACION_QUERIES_BD.md` - Documento con recomendaciones de índices
- `GUIA_APLICACION_OPTIMIZACIONES.md` - Guía de aplicación de índices

---

**Nota:** Este documento debe actualizarse con resultados reales después de ejecutar EXPLAIN ANALYZE en Supabase.

