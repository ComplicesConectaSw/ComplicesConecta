# EXPLAIN ANALYZE Report - Remoto (Supabase)

**Fecha:** 4/11/2025, 0:53:29
**Versión:** 3.5.0

---

## Query 1

```sql
-- Versión: 3.5.0
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 2

```sql
para validar performance
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 3

```sql
en cada query antes de aplicar índices
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 4

```sql
después de aplicar índices
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 5

```sql
SELECT 
  id,
  user_id,
  description as content,
  content_type as post_type,
  media_url,
  views_count,
  created_at,
  updated_at
FROM stories
WHERE is_public = true
ORDER BY created_at DESC
LIMIT 20;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 6

```sql
SELECT 
  s.id,
  s.user_id,
  s.description as content,
  s.content_type as post_type,
  s.media_url,
  s.views_count,
  s.created_at,
  s.updated_at,
  (SELECT COUNT(*) FROM story_likes WHERE story_id = s.id) as likes_count,
  (SELECT COUNT(*) FROM story_comments WHERE story_id = s.id) as comments_count,
  (SELECT COUNT(*) FROM story_shares WHERE story_id = s.id) as shares_count
FROM stories s
WHERE s.is_public = true
ORDER BY s.created_at DESC
LIMIT 20;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 7

```sql
SELECT 
  s.id,
  s.user_id,
  s.description as content,
  s.content_type as post_type,
  s.media_url,
  s.views_count,
  s.created_at,
  s.updated_at,
  p.name as profile_name,
  p.avatar_url as profile_avatar,
  p.is_verified as profile_verified
FROM stories s
LEFT JOIN profiles p ON s.user_id = p.id
WHERE s.is_public = true
ORDER BY s.created_at DESC
LIMIT 20;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 8

```sql
SELECT *
FROM profiles
WHERE age >= 18 
  AND age <= 35
  AND gender = 'male'
  AND is_verified = true
ORDER BY updated_at DESC
LIMIT 20;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 9

```sql
SELECT *
FROM profiles
WHERE age >= 25 
  AND age <= 40
  AND gender = 'female'
  AND is_verified = true
  AND interests && ARRAY['Intercambio de Parejas', 'Fiestas Privadas']
ORDER BY updated_at DESC
LIMIT 20;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 10

```sql
SELECT *
FROM profiles
WHERE s2_cell_id = '89c259c040001' -- Ejemplo de S2 cell ID
  AND age >= 18
  AND age <= 50
  AND is_verified = true
ORDER BY updated_at DESC
LIMIT 20;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 11

```sql
SELECT *
FROM profiles
WHERE age >= 18 
  AND age <= 50
  AND gender = 'male'
  AND is_verified = true
  AND (account_type = 'single' OR account_type IS NULL)
  AND interests && ARRAY['Intercambio de Parejas']
ORDER BY updated_at DESC, created_at DESC
LIMIT 20;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 12

```sql
SELECT 
  id,
  room_id,
  sender_id,
  content,
  created_at
FROM messages
WHERE room_id = '00000000-0000-0000-0000-000000000001' -- Reemplazar con ID real de chat_rooms
ORDER BY created_at DESC
LIMIT 50;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 13

```sql
SELECT 
  id,
  room_id,
  sender_id,
  content,
  created_at
FROM messages
WHERE room_id IN (
  SELECT room_id FROM chat_members WHERE profile_id = '00000000-0000-0000-0000-000000000001'
) -- Reemplazar con ID real de profiles
ORDER BY created_at DESC;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 14

```sql
SELECT 
  cr.id,
  cr.created_by,
  cr.name,
  cr.created_at,
  (SELECT content 
   FROM messages 
   WHERE room_id = cr.id 
   ORDER BY created_at DESC 
   LIMIT 1) as last_message,
  (SELECT created_at 
   FROM messages 
   WHERE room_id = cr.id 
   ORDER BY created_at DESC 
   LIMIT 1) as last_message_at
FROM chat_rooms cr
WHERE cr.created_by = '00000000-0000-0000-0000-000000000001' -- Reemplazar con ID real de profiles
   OR cr.id IN (
     SELECT room_id FROM chat_members WHERE profile_id = '00000000-0000-0000-0000-000000000001'
   )
ORDER BY (SELECT created_at 
          FROM messages 
          WHERE room_id = cr.id 
          ORDER BY created_at DESC 
          LIMIT 1) DESC NULLS LAST
LIMIT 20;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 15

```sql
SELECT 
  m1.id,
  m1.user1_id,
  m1.user2_id,
  m1.created_at,
  p.name as match_name,
  p.avatar_url as match_avatar
FROM matches m1
INNER JOIN matches m2 ON m1.user1_id = m2.user2_id AND m1.user2_id = m2.user1_id
LEFT JOIN profiles p ON m1.user2_id = p.id
WHERE m1.user1_id = '00000000-0000-0000-0000-000000000001' -- Reemplazar con ID real de profiles
ORDER BY m1.created_at DESC
LIMIT 20;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 16

```sql
SELECT 
  m.id,
  m.user1_id,
  m.user2_id,
  m.compatibility_score,
  m.created_at,
  p.name as match_name,
  p.age as match_age,
  p.location as match_location
FROM matches m
LEFT JOIN profiles p ON m.user2_id = p.id
WHERE m.user1_id = '00000000-0000-0000-0000-000000000001' -- Reemplazar con ID real de profiles
  AND m.compatibility_score >= 0.7
ORDER BY m.compatibility_score DESC, m.created_at DESC
LIMIT 20;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 17

```sql
SELECT 
  id,
  created_at,
  is_premium,
  account_type,
  gender,
  age
FROM profiles
ORDER BY created_at DESC;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 18

```sql
SELECT 
  id,
  user_id,
  transaction_type,
  amount,
  created_at
FROM token_transactions
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 19

```sql
SELECT 
  id,
  transaction_count,
  total_staked_cmpx,
  active_stakers,
  created_at
FROM token_analytics
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 20

```sql
SELECT 
  id,
  reported_user_id,
  reporter_user_id,
  content_type,
  reason,
  status,
  created_at
FROM reports
WHERE status = 'pending'
ORDER BY created_at ASC
LIMIT 50;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 21

```sql
SELECT 
  id,
  reported_user_id,
  content_type,
  reason,
  status,
  created_at
FROM reports
WHERE reason = 'inappropriate_content'
  AND status = 'pending'
ORDER BY created_at ASC
LIMIT 50;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 22

```sql
SELECT *
FROM profiles
WHERE s2_cell_id = '89c259c040001' -- Ejemplo de S2 cell ID
ORDER BY updated_at DESC
LIMIT 20;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 23

```sql
SELECT *
FROM profiles
WHERE s2_cell_id = ANY(ARRAY['89c259c040001', '89c259c040002', '89c259c040003'])
ORDER BY updated_at DESC
LIMIT 50;
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 24

```sql
SELECT * FROM get_profiles_in_cells(
  ARRAY['89c259c040001', '89c259c040002'],
  20
);
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

## Query 25

```sql
-- 3. Documentar resultados (tiempo, plan de ejecución)
```

**❌ Error:**
```
No se puede ejecutar EXPLAIN ANALYZE desde el cliente. Ejecuta manualmente en el SQL Editor de Supabase. Error: Could not find the function public.exec_sql(sql_query) in the schema cache
```

---

