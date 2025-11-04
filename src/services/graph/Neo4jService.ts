/**
 * Neo4jService - Servicio para gestión de grafo social con Neo4j
 * 
 * Implementa:
 * - Creación de nodos de usuario
 * - Relaciones sociales (matches, likes, follows)
 * - Queries de grafo (amigos mutuos, friends of friends)
 * - Análisis de red social
 * 
 * Arquitectura Híbrida:
 * - PostgreSQL: Datos principales (users, profiles, messages)
 * - Neo4j: Grafo social (relaciones, conexiones, recomendaciones)
 * 
 * @version 3.5.0
 */

import neo4j, { Driver } from 'neo4j-driver';
import { logger } from '../../lib/logger';
import { getViteEnv } from '../../lib/env-utils';

export interface Neo4jConfig {
  uri: string;
  user: string;
  password: string;
  database?: string;
}

export interface UserNode {
  id: string;
  name?: string;
  email?: string;
  createdAt?: string;
  metadata?: Record<string, any>;
}

export interface Relationship {
  type: 'MATCHED_WITH' | 'LIKED' | 'FOLLOWS' | 'FRIENDS_WITH' | 'BLOCKED';
  properties?: Record<string, any>;
}

export interface MutualConnection {
  userId: string;
  mutualCount: number;
  mutualFriends: string[];
}

export interface FriendOfFriend {
  userId: string;
  mutualCount: number;
  path: string[];
}

class Neo4jService {
  private driver: Driver | null = null;
  private config: Neo4jConfig;
  private isEnabled: boolean;

  constructor() {
    this.config = {
      uri: getViteEnv('NEO4J_URI') || 'bolt://localhost:7687',
      user: getViteEnv('NEO4J_USER') || 'neo4j',
      password: getViteEnv('NEO4J_PASSWORD') || 'complices2025',
      database: getViteEnv('NEO4J_DATABASE') || 'neo4j',
    };

    this.isEnabled = getViteEnv('NEO4J_ENABLED') === 'true';

    if (this.isEnabled) {
      this.initializeDriver();
    } else {
      logger.info('⚠️ Neo4j está deshabilitado. Set VITE_NEO4J_ENABLED=true para habilitar.');
    }
  }

  /**
   * Inicializa el driver de Neo4j
   */
  private initializeDriver(): void {
    try {
      this.driver = neo4j.driver(
        this.config.uri,
        neo4j.auth.basic(this.config.user, this.config.password),
        {
          maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 horas
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutos
        }
      );

      logger.info('✅ Neo4j driver inicializado', {
        uri: this.config.uri.replace(/:[^:]*@/, ':****@'),
        database: this.config.database,
      });
    } catch (error) {
      logger.error('❌ Error inicializando Neo4j driver:', {
        error: error instanceof Error ? error.message : String(error),
      });
      this.isEnabled = false;
    }
  }

  /**
   * Verifica la conexión con Neo4j
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.isEnabled || !this.driver) {
      return false;
    }

    try {
      const session = this.driver.session({ database: this.config.database });
      const result = await session.run('RETURN 1 as test');
      await session.close();
      return result.records.length > 0;
    } catch (error) {
      logger.error('❌ Error verificando conexión Neo4j:', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Crea o actualiza un nodo de usuario
   */
  async createUser(userId: string, metadata: Partial<UserNode> = {}): Promise<void> {
    if (!this.isEnabled || !this.driver) {
      logger.warn('⚠️ Neo4j deshabilitado. No se creó usuario:', { userId });
      return;
    }

    const session = this.driver.session({ database: this.config.database });
    try {
      await session.run(
        `
        MERGE (u:User {id: $userId})
        SET u += $metadata,
            u.updated_at = datetime()
        ON CREATE SET u.created_at = datetime()
        `,
        {
          userId,
          metadata: {
            ...metadata,
            id: userId,
          },
        }
      );

      logger.info('✅ Usuario creado/actualizado en Neo4j', {
        userId: userId.substring(0, 8) + '***',
      });
    } catch (error) {
      logger.error('❌ Error creando usuario en Neo4j:', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Crea una relación de match entre dos usuarios
   */
  async createMatch(user1Id: string, user2Id: string, metadata: Record<string, any> = {}): Promise<void> {
    if (!this.isEnabled || !this.driver) {
      logger.warn('⚠️ Neo4j deshabilitado. No se creó match:', { user1Id, user2Id });
      return;
    }

    const session = this.driver.session({ database: this.config.database });
    try {
      await session.run(
        `
        MATCH (u1:User {id: $user1Id})
        MATCH (u2:User {id: $user2Id})
        MERGE (u1)-[r:MATCHED_WITH]-(u2)
        SET r.created_at = datetime(),
            r += $metadata
        `,
        {
          user1Id,
          user2Id,
          metadata: {
            ...metadata,
            created_at: new Date().toISOString(),
          },
        }
      );

      logger.info('✅ Match creado en Neo4j', {
        user1Id: user1Id.substring(0, 8) + '***',
        user2Id: user2Id.substring(0, 8) + '***',
      });
    } catch (error) {
      logger.error('❌ Error creando match en Neo4j:', {
        user1Id,
        user2Id,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Crea una relación de like
   */
  async createLike(likerId: string, likedId: string, metadata: Record<string, any> = {}): Promise<void> {
    if (!this.isEnabled || !this.driver) {
      return;
    }

    const session = this.driver.session({ database: this.config.database });
    try {
      await session.run(
        `
        MATCH (liker:User {id: $likerId})
        MATCH (liked:User {id: $likedId})
        MERGE (liker)-[r:LIKED]->(liked)
        SET r.created_at = datetime(),
            r += $metadata
        `,
        {
          likerId,
          likedId,
          metadata: {
            ...metadata,
            created_at: new Date().toISOString(),
          },
        }
      );

      logger.info('✅ Like creado en Neo4j', {
        likerId: likerId.substring(0, 8) + '***',
        likedId: likedId.substring(0, 8) + '***',
      });
    } catch (error) {
      logger.error('❌ Error creando like en Neo4j:', {
        likerId,
        likedId,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Obtiene amigos mutuos entre dos usuarios
   */
  async getMutualFriends(user1Id: string, user2Id: string): Promise<string[]> {
    if (!this.isEnabled || !this.driver) {
      return [];
    }

    const session = this.driver.session({ database: this.config.database });
    try {
      const result = await session.run(
        `
        MATCH (u1:User {id: $user1Id})-[:FRIENDS_WITH]-(mutual)-[:FRIENDS_WITH]-(u2:User {id: $user2Id})
        WHERE u1 <> u2 AND mutual <> u1 AND mutual <> u2
        RETURN DISTINCT mutual.id AS friendId
        `,
        { user1Id, user2Id }
      );

      const mutualFriends = result.records.map((record) => record.get('friendId') as string);

      logger.info('✅ Amigos mutuos obtenidos', {
        user1Id: user1Id.substring(0, 8) + '***',
        user2Id: user2Id.substring(0, 8) + '***',
        count: mutualFriends.length,
      });

      return mutualFriends;
    } catch (error) {
      logger.error('❌ Error obteniendo amigos mutuos:', {
        user1Id,
        user2Id,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Obtiene recomendaciones "amigos de amigos" para un usuario
   */
  async getFriendsOfFriends(userId: string, limit: number = 10, excludeMatched: boolean = true): Promise<FriendOfFriend[]> {
    if (!this.isEnabled || !this.driver) {
      return [];
    }

    const session = this.driver.session({ database: this.config.database });
    try {
      const excludeClause = excludeMatched
        ? 'AND NOT (u)-[:MATCHED_WITH]-(fof)'
        : '';

      const result = await session.run(
        `
        MATCH path = (u:User {id: $userId})-[:FRIENDS_WITH*2]-(fof:User)
        WHERE u <> fof
        ${excludeClause}
        WITH fof, count(DISTINCT path) AS mutualCount
        RETURN fof.id AS userId, mutualCount
        ORDER BY mutualCount DESC
        LIMIT $limit
        `,
        { userId, limit }
      );

      const friendsOfFriends = result.records.map((record) => ({
        userId: record.get('userId') as string,
        mutualCount: Number(record.get('mutualCount')),
        path: [], // TODO: Extraer path completo si es necesario
      }));

      logger.info('✅ Friends of friends obtenidos', {
        userId: userId.substring(0, 8) + '***',
        count: friendsOfFriends.length,
      });

      return friendsOfFriends;
    } catch (error) {
      logger.error('❌ Error obteniendo friends of friends:', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Obtiene el camino más corto entre dos usuarios
   */
  async getShortestPath(user1Id: string, user2Id: string): Promise<string[] | null> {
    if (!this.isEnabled || !this.driver) {
      return null;
    }

    const session = this.driver.session({ database: this.config.database });
    try {
      const result = await session.run(
        `
        MATCH path = shortestPath((u1:User {id: $user1Id})-[*]-(u2:User {id: $user2Id}))
        WHERE length(path) > 0
        RETURN [n IN nodes(path) | n.id] AS path
        LIMIT 1
        `,
        { user1Id, user2Id }
      );

      if (result.records.length === 0) {
        return null;
      }

      const path = result.records[0].get('path') as string[];
      return path;
    } catch (error) {
      logger.error('❌ Error obteniendo shortest path:', {
        user1Id,
        user2Id,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    } finally {
      await session.close();
    }
  }

  /**
   * Sincroniza un usuario desde PostgreSQL a Neo4j
   */
  async syncUserFromPostgres(userId: string, profileData: Record<string, any>): Promise<void> {
    await this.createUser(userId, {
      name: profileData.name,
      email: profileData.email,
      createdAt: profileData.created_at,
      metadata: {
        age: profileData.age,
        location: profileData.location,
        gender: profileData.gender,
      },
    });
  }

  /**
   * Sincroniza un match desde PostgreSQL a Neo4j
   */
  async syncMatchFromPostgres(user1Id: string, user2Id: string, matchData: Record<string, any>): Promise<void> {
    await this.createMatch(user1Id, user2Id, {
      match_id: matchData.id,
      created_at: matchData.created_at,
      score: matchData.score,
    });
  }

  /**
   * Cierra la conexión con Neo4j
   */
  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
      logger.info('✅ Conexión Neo4j cerrada');
    }
  }

  /**
   * Obtiene estadísticas del grafo
   */
  async getGraphStats(): Promise<{
    userCount: number;
    matchCount: number;
    likeCount: number;
    friendCount: number;
  }> {
    if (!this.isEnabled || !this.driver) {
      return {
        userCount: 0,
        matchCount: 0,
        likeCount: 0,
        friendCount: 0,
      };
    }

    const session = this.driver.session({ database: this.config.database });
    try {
      // Query optimizado para obtener estadísticas
      const result = await session.run(
        `
        MATCH (u:User)
        WITH count(DISTINCT u) AS userCount
        MATCH ()-[r1:MATCHED_WITH]-()
        WITH userCount, count(DISTINCT r1) / 2 AS matchCount
        MATCH ()-[r2:LIKED]->()
        WITH userCount, matchCount, count(DISTINCT r2) AS likeCount
        MATCH ()-[r3:FRIENDS_WITH]-()
        RETURN 
          userCount,
          matchCount,
          likeCount,
          count(DISTINCT r3) / 2 AS friendCount
        `
      );

      if (result.records.length === 0) {
        return {
          userCount: 0,
          matchCount: 0,
          likeCount: 0,
          friendCount: 0,
        };
      }

      const record = result.records[0];
      return {
        userCount: Number(record.get('userCount')),
        matchCount: Number(record.get('matchCount')),
        likeCount: Number(record.get('likeCount')),
        friendCount: Number(record.get('friendCount')),
      };
    } catch (error) {
      logger.error('❌ Error obteniendo estadísticas del grafo:', {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        userCount: 0,
        matchCount: 0,
        likeCount: 0,
        friendCount: 0,
      };
    } finally {
      await session.close();
    }
  }
}

// Exportar instancia singleton
export const neo4jService = new Neo4jService();

// Exportar clase para testing
export default Neo4jService;

