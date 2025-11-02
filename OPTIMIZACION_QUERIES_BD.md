# 🚀 Optimización de Queries de Base de Datos

**Fecha:** 02 de Noviembre, 2025  
**Versión:** 3.5.0  
**Estado:** ⏳ Requiere análisis con EXPLAIN ANALYZE

---

## 📊 Resumen Ejecutivo

Este documento contiene recomendaciones para optimizar las queries de Supabase utilizadas en ComplicesConecta. Las optimizaciones están basadas en el análisis del código actual y mejores prácticas de PostgreSQL/Supabase.

---

## 🔍 Análisis de Queries Identificadas

### 1. **Queries de Feed/Posts** (`src/services/postsService.ts`)

#### Query Actual:
```typescript
const { data, error } = await supabase
  .from('stories')
  .select(`
    id,
    user_id,
    description as content,
    content_type as post_type,
    media_urls,
    location,
    views_count,
    created_at,
    updated_at,
    story_likes(count),
    story_comments(count),
    story_shares(count)
  `)
  .eq('is_public', true)
  .order('created_at', { ascending: false })
  .range(page * limit, (page + 1) * limit - 1);
```

#### Recomendaciones:
1. **Índice compuesto**: Crear índice en `(is_public, created_at DESC)` para optimizar la query
2. **Paginación**: Ya está implementada correctamente con `.range()`
3. **Cache**: Ya implementado (2 minutos TTL) ✅

#### Índice Recomendado:
```sql
CREATE INDEX IF NOT EXISTS idx_stories_public_created_at 
ON stories(is_public, created_at DESC) 
WHERE is_public = true;
```

---

### 2. **Queries de Perfiles** (`src/services/QueryOptimizationService.ts`)

#### Query Actual:
```typescript
let query = supabase.from('profiles').select('*');

if (filters.ageRange) {
  query = query.gte('age', filters.ageRange[0]).lte('age', filters.ageRange[1]);
}
if (filters.gender) {
  query = query.eq('gender', filters.gender);
}
if (filters.isVerified !== undefined) {
  query = query.eq('is_verified', filters.isVerified);
}
if (filters.isOnline !== undefined) {
  query = query.eq('is_online', filters.isOnline);
}
if (filters.interests && filters.interests.length > 0) {
  query = query.overlaps('interests', filters.interests);
}
query = query.order('last_seen', { ascending: false });
```

#### Recomendaciones:
1. **Índices parciales**: Crear índices específicos para filtros comunes
2. **Índice GIN para arrays**: Para búsqueda de intereses
3. **Índice compuesto**: Para filtros combinados frecuentes

#### Índices Recomendados:
```sql
-- Índice para edad
CREATE INDEX IF NOT EXISTS idx_profiles_age 
ON profiles(age) 
WHERE age IS NOT NULL;

-- Índice para género
CREATE INDEX IF NOT EXISTS idx_profiles_gender 
ON profiles(gender) 
WHERE gender IS NOT NULL;

-- Índice GIN para intereses (búsqueda de arrays)
CREATE INDEX IF NOT EXISTS idx_profiles_interests_gin 
ON profiles USING GIN(interests) 
WHERE interests IS NOT NULL AND array_length(interests, 1) > 0;

-- Índice compuesto para filtros comunes
CREATE INDEX IF NOT EXISTS idx_profiles_filters_composite 
ON profiles(is_verified, is_online, last_seen DESC) 
WHERE is_verified = true OR is_online = true;

-- Índice para S2 geohashing (si está implementado)
CREATE INDEX IF NOT EXISTS idx_profiles_s2_cell 
ON profiles(s2_cell_id, s2_level) 
WHERE s2_cell_id IS NOT NULL;
```

---

### 3. **Queries de Token Analytics** (`src/services/TokenAnalyticsService.ts`)

#### Query Actual:
```typescript
const [
  _tokenAnalyticsResult,
  userBalancesResult,
  stakingResult,
  transactionsResult,
  userStatsResult
] = await Promise.allSettled([
  supabase.from('token_analytics').select('*')
    .order('created_at', { ascending: false }).limit(1).single(),
  supabase.from('user_token_balances').select('cmpx_balance, gtk_balance')
    .not('cmpx_balance', 'is', null).not('gtk_balance', 'is', null),
  supabase.from('staking_records').select('amount, staking_duration as duration, created_at')
    .eq('is_active', true),
  supabase.from('token_transactions').select('amount, token_type, created_at')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  supabase.from('profiles').select('created_at')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
]);
```

#### Recomendaciones:
1. **Parallel queries**: Ya implementado con `Promise.allSettled` ✅
2. **Índices temporales**: Para queries con rangos de fecha
3. **Índices parciales**: Para filtros de estado activo

#### Índices Recomendados:
```sql
-- Token analytics
CREATE INDEX IF NOT EXISTS idx_token_analytics_created_at 
ON token_analytics(created_at DESC);

-- User token balances (solo con balances)
CREATE INDEX IF NOT EXISTS idx_user_token_balances_active 
ON user_token_balances(cmpx_balance, gtk_balance) 
WHERE cmpx_balance IS NOT NULL AND gtk_balance IS NOT NULL;

-- Staking records activos
CREATE INDEX IF NOT EXISTS idx_staking_records_active 
ON staking_records(is_active, created_at DESC) 
WHERE is_active = true;

-- Token transactions (últimas 24 horas)
CREATE INDEX IF NOT EXISTS idx_token_transactions_recent 
ON token_transactions(created_at DESC) 
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- Profiles recientes
CREATE INDEX IF NOT EXISTS idx_profiles_recent 
ON profiles(created_at DESC) 
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

---

### 4. **Queries de Analytics** (`src/components/admin/AnalyticsPanel.tsx`)

#### Query Actual:
```typescript
const { data: profiles, error } = await supabase
  .from('profiles')
  .select('id, created_at, is_premium')
  .order('created_at', { ascending: false });
```

#### Recomendaciones:
1. **Índice específico**: Para queries de analytics
2. **Limit**: Agregar `.limit()` si no se necesitan todos los registros

#### Índice Recomendado:
```sql
CREATE INDEX IF NOT EXISTS idx_profiles_analytics 
ON profiles(created_at DESC, is_premium);
```

---

### 5. **Queries de Chat/Mensajes**

#### Recomendaciones:
```sql
-- Mensajes por chat
CREATE INDEX IF NOT EXISTS idx_messages_chat_created_at 
ON messages(chat_id, created_at DESC);

-- Mensajes por usuario (sender/receiver)
CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON messages(sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_receiver 
ON messages(receiver_id, created_at DESC);

-- Mensajes no leídos
CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON messages(receiver_id, is_read, created_at DESC) 
WHERE is_read = false;
```

---

## 🔧 Proceso de Optimización Recomendado

### Fase 1: Análisis (Requerido)
1. **Ejecutar EXPLAIN ANALYZE** en Supabase SQL Editor para cada query crítica
2. **Identificar slow queries** con `pg_stat_statements`
3. **Medir tiempos actuales** antes de optimizar

### Fase 2: Implementación de Índices
1. Crear índices recomendados en orden de prioridad
2. Verificar impacto en INSERT/UPDATE (los índices ralentizan escrituras)
3. Monitorear uso de espacio

### Fase 3: Optimización de Queries
1. Agregar `.limit()` donde sea posible
2. Usar `.select()` específico en lugar de `select('*')`
3. Implementar paginación eficiente

### Fase 4: Validación
1. Re-ejecutar EXPLAIN ANALYZE después de crear índices
2. Comparar tiempos antes/después
3. Verificar que no haya regresiones

---

## 📝 Scripts SQL para Aplicar

### Script Completo de Índices:
```sql
-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE QUERIES
-- ComplicesConecta v3.5.0
-- =====================================================

-- Stories/Feed
CREATE INDEX IF NOT EXISTS idx_stories_public_created_at 
ON stories(is_public, created_at DESC) 
WHERE is_public = true;

-- Profiles - Filtros básicos
CREATE INDEX IF NOT EXISTS idx_profiles_age 
ON profiles(age) 
WHERE age IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_gender 
ON profiles(gender) 
WHERE gender IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_interests_gin 
ON profiles USING GIN(interests) 
WHERE interests IS NOT NULL AND array_length(interests, 1) > 0;

CREATE INDEX IF NOT EXISTS idx_profiles_filters_composite 
ON profiles(is_verified, is_online, last_seen DESC) 
WHERE is_verified = true OR is_online = true;

CREATE INDEX IF NOT EXISTS idx_profiles_s2_cell 
ON profiles(s2_cell_id, s2_level) 
WHERE s2_cell_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_analytics 
ON profiles(created_at DESC, is_premium);

-- Token Analytics
CREATE INDEX IF NOT EXISTS idx_token_analytics_created_at 
ON token_analytics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_token_balances_active 
ON user_token_balances(cmpx_balance, gtk_balance) 
WHERE cmpx_balance IS NOT NULL AND gtk_balance IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_staking_records_active 
ON staking_records(is_active, created_at DESC) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_token_transactions_recent 
ON token_transactions(created_at DESC) 
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_chat_created_at 
ON messages(chat_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON messages(sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_receiver 
ON messages(receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON messages(receiver_id, is_read, created_at DESC) 
WHERE is_read = false;
```

---

## 📊 Métricas de Éxito Esperadas

### Antes de Optimización:
- Query de feed: ~500ms - 2s (dependiendo del tamaño)
- Query de perfiles con filtros: ~1s - 3s
- Query de analytics: ~2s - 5s

### Después de Optimización (Objetivo):
- Query de feed: < 100ms ✅
- Query de perfiles con filtros: < 200ms ✅
- Query de analytics: < 500ms ✅

---

## ⚠️ Consideraciones Importantes

1. **Espacio en Disco**: Los índices ocupan espacio adicional (~20-30% del tamaño de tabla)
2. **Escrituras más lentas**: Los índices ralentizan INSERT/UPDATE
3. **Mantenimiento**: Los índices necesitan VACUUM periódico
4. **Testing**: Probar en staging antes de producción

---

## 🚀 Próximos Pasos

1. [ ] Ejecutar EXPLAIN ANALYZE en queries críticas
2. [ ] Aplicar índices en orden de prioridad
3. [ ] Medir impacto en performance
4. [ ] Documentar resultados
5. [ ] Actualizar este documento con resultados reales

---

**Nota:** Este documento es una guía inicial. Los índices específicos deben ajustarse basándose en el análisis real de EXPLAIN ANALYZE y los patrones de uso reales de la aplicación.

