# Plan Próxima Sesión - ComplicesConecta v3.5.0

**Fecha:** 2025-11-01  
**Última Sesión:** Migraciones S2 Completadas  
**Próxima Sesión:** Backfill S2 + Benchmarks + Neo4j

---

## ✅ Logros Sesión Actual

### Completado
1. ✅ Migración S2 aplicada (local + remoto)
2. ✅ S2Service completamente implementado
3. ✅ Script backfill listo
4. ✅ Hook useGeolocation integrado
5. ✅ Documentación completa generada

---

## 🎯 Objetivos Próxima Sesión

### Alta Prioridad
1. **Backfill S2** (30 min)
   - [ ] Obtener service role key de Supabase
   - [ ] Configurar .env local
   - [ ] Ejecutar `npm run backfill:s2`
   - [ ] Verificar resultados en BD

2. **Benchmarks S2** (45 min)
   - [ ] Crear script de benchmarking
   - [ ] Medir queries nearby S2 vs PostGIS
   - [ ] Documentar resultados
   - [ ] Optimizar si necesario

### Media Prioridad
3. **Neo4j Fase 2.2** (90 min)
   - [ ] Investigar Neo4j cloud/docker
   - [ ] Configurar conexión
   - [ ] Diseñar schema de grafos
   - [ ] Migrar datos de relaciones

---

## 📋 Checklist Detallado

### Sesión 1: Backfill + Benchmarks (75 min)

#### Preparación (10 min)
- [ ] Ir a Supabase Dashboard
- [ ] Settings → API → Copiar `service_role` key
- [ ] Agregar a `.env` local
- [ ] Verificar conexión

#### Backfill (30 min)
- [ ] Ejecutar `npm run backfill:s2`
- [ ] Verificar progreso
- [ ] Revisar estadísticas finales
- [ ] Comprobar en BD que s2_cell_id está poblado

#### Benchmarks (35 min)
- [ ] Crear `scripts/benchmark-s2.ts`
- [ ] Implementar queries test:
  - Query nearby S2 (100 users)
  - Query nearby PostGIS (100 users)
- [ ] Ejecutar benchmarks
- [ ] Documentar resultados
- [ ] Crear gráficas si necesario

### Sesión 2: Neo4j (90 min)

#### Setup (30 min)
- [ ] Evaluar opciones:
  - Neo4j AuraDB (cloud)
  - Neo4j Docker local
  - Neo4j Community standalone
- [ ] Configurar instancia
- [ ] Obtener credenciales

#### Schema (30 min)
- [ ] Diseñar modelo de grafos:
  - Nodes: User, CoupleProfile
  - Relationships: FRIENDS, LIKES, MATCHES
- [ ] Crear constraints/indexes
- [ ] Validar diseño

#### Migración (30 min)
- [ ] Crear script migración
- [ ] Sincronizar datos iniciales
- [ ] Verificar integridad
- [ ] Documentar proceso

---

## 🔧 Configuración Requerida

### Para Backfill
```env
# .env (local only, nunca subir a git)
VITE_SUPABASE_URL=https://axtvqnozatbmllvwzuim.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (obtener de dashboard)
```

### Para Neo4j
```env
# .env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=<password>
```

---

## 📊 Benchmarks Esperados

### Queries Nearby (CDMX)
- **Sin S2:** ~5s para 100k usuarios
- **Con S2:** ~100ms para 100k usuarios
- **Mejora esperada:** 50x

### Queries Nearby (Global)
- **Sin S2:** ~30s para 1M usuarios
- **Con S2:** ~300ms para 1M usuarios
- **Mejora esperada:** 100x

---

## 🚀 Neo4j - Casos de Uso

### Amigos Mutuos
- **PostgreSQL:** 200ms+ con JOINs complejos
- **Neo4j:** <10ms con queries de grafos
- **Mejora esperada:** 20x

### Pathfinding
- **PostgreSQL:** No viable
- **Neo4j:** ~50ms para 6 grados
- **Uso:** "Amigos de amigos" recomendaciones

### Recomendaciones
- **PostgreSQL:** 500ms+ con scoring complejo
- **Neo4j:** ~100ms con GDS algorithms
- **Uso:** Sugerencias basadas en comportamiento

---

## 📝 Documentación a Generar

1. **BENCHMARKS_S2_RESULTS.md**
   - Métricas de performance
   - Gráficas comparativas
   - Conclusiones

2. **NEO4J_SETUP.md**
   - Instrucciones configuración
   - Schema de grafos
   - Queries ejemplo

3. **MIGRATION_NEO4J.md**
   - Script migración
   - Plan sincronización
   - Validación

---

## 🎯 Métricas de Éxito

### Backfill
- ✅ 100% perfiles con lat/lng → s2_cell_id
- ✅ Tiempo ejecución < 5 min
- ✅ 0 errores

### Benchmarks
- ✅ Queries S2 50x más rápidas
- ✅ Resultados reproducibles
- ✅ Documentación clara

### Neo4j
- ✅ Instancia funcionando
- ✅ Schema validado
- ✅ Migración exitosa

---

## 📚 Recursos

### Documentación
- [S2 Geometry Library](https://github.com/google/s2-geometry-library-js)
- [Neo4j Documentation](https://neo4j.com/docs/)
- [Neo4j AuraDB](https://neo4j.com/cloud/aura/)

### Scripts
- `scripts/backfill-s2-cells.ts` - Backfill S2
- `scripts/benchmark-s2.ts` - Benchmarks (crear)
- `scripts/migrate-neo4j.ts` - Migración Neo4j (crear)

---

**Estado Actual:** Fase 2.1 ~40% completo  
**Objetivo Próxima Sesión:** Completar Fase 2.1 (S2) + Iniciar Fase 2.2 (Neo4j)

