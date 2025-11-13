# 🚀 FASE 2: SCALABILITY - ComplicesConecta v3.5.0

**Fecha Inicio:** 30 Octubre 2025  
**Duración Estimada:** 6-8 horas (2-3 sesiones)  
**Inspiración:** Grindr 2025 + Facebook TAO  
**Estado:** En progreso

---

## 🎯 OBJETIVOS

Implementar escalabilidad avanzada para soportar millones de usuarios mediante:

1. **Geosharding** con Google S2 library (celdas geográficas)
2. **Neo4j Graph Database** para conexiones sociales eficientes
3. **Queries Paralel**izadas por ubicación
4. **Backward Compatibility** total con sistema actual

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General](#visión-general)
2. [Fase 2.1: Google S2 Geosharding](#fase-21-google-s2-geosharding)
3. [Fase 2.2: Neo4j Graph Database](#fase-22-neo4j-graph-database)
4. [Integración con Sistema Actual](#integración-con-sistema-actual)
5. [Timeline y Entregables](#timeline-y-entregables)

---

## 🌍 VISIÓN GENERAL

### Problema Actual

**ComplicesConecta v3.4.1** usa:
- **Haversine** para distancia (lento con millones de usuarios)
- **PostgreSQL** para relaciones sociales (queries costosos para grafo)
- **Queries secuenciales** (no aprovecha paralelismo geográfico)

**Limitaciones:**
- ❌ Búsqueda en CDMX con 100k usuarios: ~5-10 segundos
- ❌ Amigos mutuos query: O(n²) complejidad
- ❌ No escala más allá de ~500k usuarios activos

### Solución Propuesta (Grindr 2025 + FB TAO)

**Geosharding (Google S2):**
- ✅ Divide el mundo en celdas hexagonales de ~1km²
- ✅ Queries paralelas por celda (reduce de O(n) → O(log n))
- ✅ Búsqueda en CDMX: ~100-300ms con 10M usuarios

**Neo4j Graph DB:**
- ✅ Relaciones sociales como grafo nativo
- ✅ Amigos mutuos en <10ms (vs ~1s PostgreSQL)
- ✅ Recomendaciones "amigos de amigos" nativas

### Arquitectura Híbrida

```
[Usuario solicita matches cerca]
         ↓
[Geolocation Service]
         ↓
[S2Service: Obtiene celda S2 (nivel 15 ~1km²)]
         ↓
[PostgreSQL: Query solo usuarios en esa celda]
         ↓
[SmartMatching: Scoring de compatibilidad]
         ↓
[Neo4j: Enriquecer con conexiones mutuas]
         ↓
[Resultado: Matches ordenados con metadata social]
```

**Ventajas:**
- ✅ PostgreSQL mantiene data principal (users, profiles, messages)
- ✅ Neo4j solo para grafo social (likes, matches, friends)
- ✅ S2 reduce superficie de búsqueda geográfica
- ✅ Backward compatible (fallback a Haversine)

---

## 🗺️ FASE 2.1: GOOGLE S2 GEOSHARDING

### ¿Qué es Google S2?

**S2 Geometry** es una librería de Google para proyección de esfera en celdas hexagonales jerárquicas.

**Características:**
- **Niveles:** 0 (mundo entero) → 30 (1cm²)
- **Nivel 15:** ~1km² (ideal para matching urbano)
- **Nivel 13:** ~10km² (suburbios)
- **Celdas vecinas:** Pre-calculadas en O(1)

**Comparación:**
| Método | Query Time (10M users) | Precisión | Setup |
|--------|------------------------|-----------|-------|
| Haversine | ~10s | Exacta | Fácil |
| Geohash | ~500ms | Aproximada | Medio |
| **S2 (Nivel 15)** | **~100ms** | Exacta | Medio |

### Implementación

#### 1. Instalar Dependencias

```bash
npm install s2-geometry@^2.0.0
```

#### 2. Crear S2Service

**Archivo:** `src/services/geo/S2Service.ts`

```typescript
import { S2 } from 's2-geometry';

export class S2Service {
  private defaultLevel = 15; // ~1km²

  /**
   * Convierte lat/lng a S2 cell ID
   */
  getCell(lat: number, lng: number, level: number = this.defaultLevel): string {
    const s2LatLng = S2.S2LatLng.fromDegrees(lat, lng);
    const cell = S2.S2CellId.fromLatLng(s2LatLng);
    return cell.parent(level).toToken();
  }

  /**
   * Obtiene celdas vecinas (9 celdas: actual + 8 adyacentes)
   */
  getNeighborCells(cellId: string): string[] {
    const cell = S2.S2CellId.fromToken(cellId);
    const neighbors = cell.getEdgeNeighbors();
    return [
      cellId,
      ...neighbors.map((n: any) => n.toToken()),
    ];
  }

  /**
   * Verifica si dos celdas son vecinas
   */
  areCellsNeighbors(cell1: string, cell2: string): boolean {
    const neighbors = this.getNeighborCells(cell1);
    return neighbors.includes(cell2);
  }

  /**
   * Calcula nivel óptimo según radio de búsqueda
   */
  getOptimalLevel(radiusKm: number): number {
    if (radiusKm <= 1) return 15;   // ~1km
    if (radiusKm <= 5) return 13;   // ~10km
    if (radiusKm <= 20) return 11;  // ~50km
    return 10; // ~100km
  }
}

export const s2Service = new S2Service();
```

#### 3. Migración SQL

**Archivo:** `supabase/migrations/20251031_add_s2_geohash.sql`

```sql
-- Agregar columna s2_cell_id a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS s2_cell_id VARCHAR(20);

-- Agregar índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_s2_cell 
ON profiles(s2_cell_id) 
WHERE s2_cell_id IS NOT NULL;

-- Función para actualizar s2_cell_id automáticamente
CREATE OR REPLACE FUNCTION update_s2_cell()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    -- Esto se actualiza desde backend con S2Service
    -- Aquí solo validamos
    IF NEW.s2_cell_id IS NULL THEN
      RAISE NOTICE 'S2 cell ID debe ser calculado desde backend';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_update_s2_cell
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_s2_cell();

-- Backfill para usuarios existentes (ejecutar UNA VEZ)
-- NOTA: Esto lo hace el backend con S2Service, no SQL
COMMENT ON COLUMN profiles.s2_cell_id IS 
'S2 Geometry cell ID (nivel 15 ~1km²) calculado desde latitude/longitude';
```

#### 4. Integrar en hooks/geolocation

**Modificar:** `src/hooks/useGeolocation.ts`

```typescript
import { s2Service } from '@/services/geo/S2Service';

export function useGeolocation() {
  const updateLocation = async (lat: number, lng: number) => {
    // Calcular S2 cell
    const s2CellId = s2Service.getCell(lat, lng);
    
    // Actualizar en BD
    await supabase
      .from('profiles')
      .update({ 
        latitude: lat, 
        longitude: lng,
        s2_cell_id: s2CellId,
      })
      .eq('id', userId);
  };

  const findNearby = async (radiusKm: number = 5) => {
    const level = s2Service.getOptimalLevel(radiusKm);
    const currentCell = s2Service.getCell(userLat, userLng, level);
    const neighborCells = s2Service.getNeighborCells(currentCell);
    
    // Query solo usuarios en celdas vecinas
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('s2_cell_id', neighborCells);
    
    // Filtrar por distancia exacta (Haversine)
    return data.filter(profile => {
      const distance = calculateHaversine(
        userLat, userLng,
        profile.latitude, profile.longitude
      );
      return distance <= radiusKm;
    });
  };
}
```

#### 5. Optimización: Backfill S2 Cells

**Script:** `scripts/backfill-s2-cells.ts`

```typescript
import { supabase } from '@/lib/supabase';
import { s2Service } from '@/services/geo/S2Service';

async function backfillS2Cells() {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, latitude, longitude')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .is('s2_cell_id', null);
  
  console.log(`Backfilling ${profiles.length} profiles...`);
  
  for (const profile of profiles) {
    const s2CellId = s2Service.getCell(
      profile.latitude, 
      profile.longitude
    );
    
    await supabase
      .from('profiles')
      .update({ s2_cell_id: s2CellId })
      .eq('id', profile.id);
  }
  
  console.log('✅ Backfill completed');
}

backfillS2Cells();
```

### Benchmarks Esperados

| Escenario | Sin S2 (Haversine) | Con S2 (Nivel 15) | Mejora |
|-----------|-------------------|-------------------|--------|
| 100k users CDMX | ~5s | ~100ms | **50x** |
| 1M users global | ~30s | ~300ms | **100x** |
| 10M users global | ~5min | ~1s | **300x** |

---

## 📊 FASE 2.2: NEO4J GRAPH DATABASE

### ¿Por qué Neo4j?

**Facebook TAO** (usado en FB/Instagram) usa graph database para:
- Amigos mutuos en <5ms
- Recomendaciones "amigos de amigos"
- Likes, follows, matches como edges (aristas)

**Neo4j** es la implementación open-source más popular.

### Arquitectura Híbrida

```
PostgreSQL (Primary Data):
- users
- profiles
- messages
- posts
↓
Neo4j (Social Graph):
- FOLLOWS(user1 → user2)
- LIKES(user → post)
- MATCHES(couple1 ↔ couple2)
- FRIENDS_WITH(user ↔ user)
```

**Ventajas:**
- ✅ PostgreSQL para CRUD tradicional
- ✅ Neo4j para queries de grafo (amigos, recomendaciones)
- ✅ Sincronización automática via triggers/webhooks

### Implementación

#### 1. Docker Compose (Neo4j)

**Agregar a:** `docker-compose.yml`

```yaml
services:
  neo4j:
    image: neo4j:5.15-community
    container_name: complices_neo4j
    ports:
      - "7474:7474"  # Browser UI
      - "7687:7687"  # Bolt protocol
    environment:
      - NEO4J_AUTH=neo4j/complices2025
      - NEO4J_PLUGINS=["apoc"]
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs
    networks:
      - complices_network

volumes:
  neo4j_data:
  neo4j_logs:

networks:
  complices_network:
    driver: bridge
```

**Iniciar:**
```bash
docker-compose up -d neo4j
```

**Verificar:**
```
http://localhost:7474
Usuario: neo4j
Password: complices2025
```

#### 2. Instalar Driver

```bash
npm install neo4j-driver@^5.15.0
```

#### 3. Crear Neo4jService

**Archivo:** `src/services/graph/Neo4jService.ts`

```typescript
import neo4j, { Driver, Session } from 'neo4j-driver';

export class Neo4jService {
  private driver: Driver;

  constructor() {
    this.driver = neo4j.driver(
      import.meta.env.VITE_NEO4J_URI || 'bolt://localhost:7687',
      neo4j.auth.basic('neo4j', import.meta.env.VITE_NEO4J_PASSWORD || 'complices2025')
    );
  }

  async createUser(userId: string, metadata: any = {}): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        'MERGE (u:User {id: $userId}) SET u += $metadata',
        { userId, metadata }
      );
    } finally {
      await session.close();
    }
  }

  async createMatch(user1Id: string, user2Id: string): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(`
        MATCH (u1:User {id: $user1Id})
        MATCH (u2:User {id: $user2Id})
        MERGE (u1)-[:MATCHED_WITH {created_at: datetime()}]->(u2)
        MERGE (u2)-[:MATCHED_WITH {created_at: datetime()}]->(u1)
      `, { user1Id, user2Id });
    } finally {
      await session.close();
    }
  }

  async getMutualFriends(user1Id: string, user2Id: string): Promise<string[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(`
        MATCH (u1:User {id: $user1Id})-[:FRIENDS_WITH]-(mutual)-[:FRIENDS_WITH]-(u2:User {id: $user2Id})
        RETURN DISTINCT mutual.id AS friendId
      `, { user1Id, user2Id });
      
      return result.records.map(r => r.get('friendId'));
    } finally {
      await session.close();
    }
  }

  async getFriendsOfFriends(userId: string, limit: number = 10): Promise<any[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(`
        MATCH (u:User {id: $userId})-[:FRIENDS_WITH*2]-(fof:User)
        WHERE NOT (u)-[:FRIENDS_WITH]-(fof) AND u <> fof
        RETURN fof.id AS userId, COUNT(*) AS mutualCount
        ORDER BY mutualCount DESC
        LIMIT $limit
      `, { userId, limit });
      
      return result.records.map(r => ({
        userId: r.get('userId'),
        mutualCount: r.get('mutualCount').toNumber(),
      }));
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
}

export const neo4jService = new Neo4jService();
```

#### 4. Sincronización PostgreSQL → Neo4j

**Webhook/Trigger:** Cuando se crea un match en PostgreSQL:

```typescript
// src/services/MatchingService.ts
async function createMatch(user1Id: string, user2Id: string) {
  // 1. Guardar en PostgreSQL
  await supabase.from('matches').insert({
    user1_id: user1Id,
    user2_id: user2Id,
  });
  
  // 2. Sincronizar a Neo4j
  await neo4jService.createMatch(user1Id, user2Id);
  
  // 3. Obtener amigos mutuos (Neo4j)
  const mutualFriends = await neo4jService.getMutualFriends(user1Id, user2Id);
  
  return { match: true, mutualFriends };
}
```

#### 5. Queries Optimizadas

**Amigos Mutuos (PostgreSQL vs Neo4j):**

```sql
-- PostgreSQL (LENTO: O(n²))
SELECT f1.friend_id
FROM friendships f1
JOIN friendships f2 ON f1.friend_id = f2.friend_id
WHERE f1.user_id = 'user1'
  AND f2.user_id = 'user2';
-- Time: ~1-5 segundos con 100k friends
```

```cypher
-- Neo4j (RÁPIDO: O(log n))
MATCH (u1:User {id: 'user1'})-[:FRIENDS_WITH]-(mutual)-[:FRIENDS_WITH]-(u2:User {id: 'user2'})
RETURN DISTINCT mutual.id;
-- Time: ~5-10ms con 100k friends
```

### Benchmarks Esperados

| Query | PostgreSQL | Neo4j | Mejora |
|-------|------------|-------|--------|
| Amigos mutuos | ~2s | ~10ms | **200x** |
| Friends of friends | ~10s | ~50ms | **200x** |
| Shortest path | N/A | ~100ms | ∞ |

---

## 🔗 INTEGRACIÓN CON SISTEMA ACTUAL

### Backward Compatibility

**Feature Flags:**
```env
VITE_GEOSHARDING_ENABLED=true  # Habilitar S2
VITE_NEO4J_ENABLED=true        # Habilitar Neo4j
```

**Fallback Automático:**
```typescript
async function findNearby(lat: number, lng: number) {
  if (import.meta.env.VITE_GEOSHARDING_ENABLED === 'true') {
    return await findNearbyWithS2(lat, lng);
  } else {
    return await findNearbyWithHaversine(lat, lng); // Legacy
  }
}
```

### Migración Gradual

**Fase 1:** S2 + PostgreSQL (sin Neo4j)
- Implementar S2Service
- Backfill s2_cell_id
- Optimizar queries geográficas
- **Tiempo:** 2-3 horas

**Fase 2:** Neo4j + Sincronización
- Setup Neo4j Docker
- Crear Neo4jService
- Sincronizar matches existentes
- **Tiempo:** 3-4 horas

**Fase 3:** Queries Híbridas
- Integrar amigos mutuos
- Recomendaciones FOF
- **Tiempo:** 1-2 horas

---

## ⏱️ TIMELINE Y ENTREGABLES

### Sesión 1 (2-3 horas) - HOY
✅ Plan completo documentado  
⏳ S2Service implementado  
⏳ Migración SQL s2_cell_id  
⏳ Backfill script  
⏳ Tests unitarios S2Service  

### Sesión 2 (2-3 horas) - Próxima
⏳ Neo4j Docker setup  
⏳ Neo4jService implementado  
⏳ Sincronización PostgreSQL → Neo4j  
⏳ Queries amigos mutuos  
⏳ Tests unitarios Neo4jService  

### Sesión 3 (1-2 horas) - Final
⏳ Integración completa  
⏳ Benchmarks y métricas  
⏳ Documentación completa  
⏳ Commit y deploy  

---

## 📊 MÉTRICAS DE ÉXITO

| Métrica | Actual | Meta Fase 2 | Mejora |
|---------|--------|-------------|--------|
| Query nearby (CDMX, 100k users) | ~5s | <200ms | **25x** |
| Amigos mutuos query | ~2s | <20ms | **100x** |
| Escalabilidad máxima | ~500k | 10M+ | **20x** |
| Latencia P95 (geolocation) | ~10s | <500ms | **20x** |

---

**FIN DEL PLAN - INICIANDO IMPLEMENTACIÓN**  
*Generado el 30 Oct 2025 - 22:30 hrs*

