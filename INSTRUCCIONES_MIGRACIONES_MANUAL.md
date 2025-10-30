# 📋 INSTRUCCIONES: APLICAR MIGRACIONES MANUALMENTE

**Fecha:** 30 de Octubre, 2025  
**Versión:** ComplicesConecta v3.5.0  
**Motivo:** Problemas de encoding en migraciones SQL

---

## ⚠️ SITUACIÓN ACTUAL

Las migraciones SQL tienen problemas de encoding al aplicarse via CLI. Se deben aplicar manualmente desde Supabase Dashboard.

**Migraciones Pendientes:**
1. `20251030_create_ai_tables.sql` - AI-Native Layer (300 líneas)
2. `20251030_create_chat_summaries.sql` - Chat Summaries ML (280 líneas)

---

## 📝 INSTRUCCIONES PASO A PASO

### PASO 1: Acceder a Supabase Dashboard

1. Abre tu navegador
2. Ve a: https://supabase.com/dashboard
3. Selecciona tu proyecto "ComplicesConecta"
4. Ve a **SQL Editor** en el menú lateral

---

### PASO 2: Aplicar Migración AI-Native Layer

#### 2.1. Abrir Archivo Local
- Ubicación: `supabase/migrations/20251030_create_ai_tables.sql`
- Abrir con: VS Code o cualquier editor de texto
- **IMPORTANTE**: Copiar TODO el contenido (300 líneas)

#### 2.2. Ejecutar en Supabase
1. En SQL Editor, click en **"New query"**
2. Pegar el contenido completo del archivo
3. Click en **"Run"** (o F5)
4. Esperar confirmación: "Success. No rows returned"

#### 2.3. Verificar Tablas Creadas
Ejecutar en SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_compatibility_scores', 'ai_prediction_logs', 'ai_model_metrics');
```

**Resultado esperado:** 3 tablas

---

### PASO 3: Aplicar Migración Chat Summaries

#### 3.1. Abrir Archivo Local
- Ubicación: `supabase/migrations/20251030_create_chat_summaries.sql`
- Abrir con: VS Code o cualquier editor de texto
- **IMPORTANTE**: Copiar TODO el contenido (280 líneas)

#### 3.2. Ejecutar en Supabase
1. En SQL Editor, click en **"New query"**
2. Pegar el contenido completo del archivo
3. Click en **"Run"** (o F5)
4. Esperar confirmación: "Success. No rows returned"

#### 3.3. Verificar Tablas Creadas
Ejecutar en SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chat_summaries', 'summary_requests', 'summary_feedback');
```

**Resultado esperado:** 3 tablas

---

### PASO 4: Verificar RLS (Row Level Security)

Ejecutar en SQL Editor:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
  'ai_compatibility_scores', 
  'ai_prediction_logs', 
  'ai_model_metrics',
  'chat_summaries',
  'summary_requests',
  'summary_feedback'
)
ORDER BY tablename, policyname;
```

**Resultado esperado:** ~15 políticas RLS

---

### PASO 5: Regenerar Types de TypeScript

**En tu terminal local:**
```powershell
npx supabase gen types typescript --project-id tu-project-id > src/types/supabase-generated.ts
```

O alternativamente:
```powershell
npx supabase gen types typescript --local > src/types/supabase-generated.ts
```

---

## ✅ VERIFICACIÓN FINAL

### 1. Verificar Todas las Tablas

Ejecutar en SQL Editor:
```sql
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
  'ai_compatibility_scores',
  'ai_prediction_logs',
  'ai_model_metrics',
  'chat_summaries',
  'summary_requests',
  'summary_feedback'
)
ORDER BY table_name;
```

**Resultado esperado:**
| table_name | column_count |
|------------|--------------|
| ai_compatibility_scores | 10 |
| ai_model_metrics | 16 |
| ai_prediction_logs | 11 |
| chat_summaries | 9 |
| summary_feedback | 5 |
| summary_requests | 3 |

### 2. Verificar Funciones SQL

Ejecutar en SQL Editor:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_ai_compatibility_score',
  'get_model_stats',
  'get_cached_summary',
  'check_summary_rate_limit',
  'get_summary_stats'
)
ORDER BY routine_name;
```

**Resultado esperado:** 5 funciones

### 3. Test de Inserción

**AI Tables:**
```sql
INSERT INTO ai_model_metrics (
  model_version,
  predictions_count,
  accuracy_score,
  period_start,
  period_end
) VALUES (
  'v1-test',
  0,
  0.0,
  NOW(),
  NOW()
);

SELECT * FROM ai_model_metrics WHERE model_version = 'v1-test';

DELETE FROM ai_model_metrics WHERE model_version = 'v1-test';
```

**Chat Summaries Tables:**
```sql
-- Nota: Requiere tener datos en profiles y chat_members
-- Solo verificar estructura
SELECT * FROM chat_summaries LIMIT 0;
SELECT * FROM summary_requests LIMIT 0;
SELECT * FROM summary_feedback LIMIT 0;
```

---

## 🐛 TROUBLESHOOTING

### Error: "relation already exists"
**Solución:** La tabla ya existe. Omitir esa migración o usar `DROP TABLE IF EXISTS` primero (⚠️ perderás datos).

### Error: "foreign key constraint"
**Solución:** Asegúrate de que la tabla `profiles` existe. Aplicar migraciones en orden.

### Error: "permission denied"
**Solución:** Usar el Service Role Key en lugar del Anon Key.

### Error: "syntax error"
**Solución:** Copiar el SQL exactamente como está, sin modificaciones.

---

## 📊 ESTADO POST-MIGRACIÓN

Después de aplicar las migraciones, el proyecto tendrá:

| Categoría | Cantidad |
|-----------|----------|
| **Tablas AI-Native** | 3 |
| **Tablas Chat Summaries** | 3 |
| **RLS Políticas** | ~15 |
| **Funciones SQL** | 5 |
| **Índices** | ~20 |
| **Triggers** | 2 |

**Total de tablas en BD:** ~50 tablas

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Aplicar migraciones (este documento)
2. ⏳ Regenerar types TypeScript
3. ⏳ Configurar .env con API keys:
   ```env
   VITE_AI_NATIVE_ENABLED=false
   VITE_AI_CHAT_SUMMARIES_ENABLED=false
   VITE_OPENAI_API_KEY=sk-...
   VITE_HUGGINGFACE_API_KEY=hf_...
   ```
4. ⏳ Restart desarrollo: `npm run dev`
5. ⏳ Verificar en DevTools Console

---

## 📞 SOPORTE

**Si encuentras problemas:**
1. Verificar que Docker esté corriendo
2. Verificar que Supabase CLI esté actualizado: `npx supabase update`
3. Revisar logs: `npx supabase db reset --debug`
4. Consultar documentación: `RESUMEN_FASE1.3_INICIADA_v3.5.0.md`

---

**Tiempo estimado:** 15-20 minutos  
**Dificultad:** Medio

*Instrucciones Migraciones Manual - ComplicesConecta v3.5.0*

