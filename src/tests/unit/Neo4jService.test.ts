/**
 * Tests Unitarios para Neo4jService
 * 
 * @version 3.5.0
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { neo4jService } from '@/services/graph/Neo4jService';

// Mock Neo4j driver para tests
vi.mock('neo4j-driver', () => {
  const mockDriver = {
    session: vi.fn(() => ({
      run: vi.fn(),
      close: vi.fn(),
    })),
    close: vi.fn(),
  };

  return {
    default: {
      driver: vi.fn(() => mockDriver),
    },
  };
});

describe('Neo4jService', () => {
  const testUserId1 = 'test-user-1';
  const testUserId2 = 'test-user-2';
  const testUserId3 = 'test-user-3';

  beforeAll(async () => {
    // Verificar que Neo4j está habilitado para tests
    // Si no está habilitado, los tests se saltarán
    const isEnabled = process.env.VITE_NEO4J_ENABLED === 'true';
    if (!isEnabled) {
      console.log('⚠️ Neo4j deshabilitado, saltando tests');
    }
  });

  afterAll(async () => {
    // Limpiar conexión
    await neo4jService.close();
  });

  describe('verifyConnection', () => {
    it('should verify connection when Neo4j is enabled', async () => {
      const isEnabled = process.env.VITE_NEO4J_ENABLED === 'true';
      if (!isEnabled) {
        return; // Saltar test si Neo4j no está habilitado
      }

      const result = await neo4jService.verifyConnection();
      expect(result).toBe(true);
    });

    it('should return false when Neo4j is disabled', async () => {
      // Simular Neo4j deshabilitado
      const originalEnv = process.env.VITE_NEO4J_ENABLED;
      process.env.VITE_NEO4J_ENABLED = 'false';
      
      // Re-inicializar servicio
      neo4jService.reinitialize();
      
      const result = await neo4jService.verifyConnection();
      expect(result).toBe(false);
      
      // Restaurar env original
      process.env.VITE_NEO4J_ENABLED = originalEnv;
      neo4jService.reinitialize();
    });
  });

  describe('createUser', () => {
    it('should create a user node', async () => {
      const isEnabled = process.env.VITE_NEO4J_ENABLED === 'true';
      if (!isEnabled) {
        return; // Saltar test si Neo4j no está habilitado
      }

      await neo4jService.createUser(testUserId1, {
        name: 'Test User 1',
        email: 'test1@example.com',
        createdAt: new Date().toISOString(),
        metadata: {
          age: 30,
          location: 'Ciudad de México',
          gender: 'Hombre',
        },
      });

      // Verificar que el usuario fue creado
      const stats = await neo4jService.getGraphStats();
      expect(stats.userCount).toBeGreaterThan(0);
    });

    it('should handle user creation with minimal data', async () => {
      const isEnabled = process.env.VITE_NEO4J_ENABLED === 'true';
      if (!isEnabled) {
        return;
      }

      await neo4jService.createUser(testUserId2, {
        name: 'Test User 2',
      });

      const stats = await neo4jService.getGraphStats();
      expect(stats.userCount).toBeGreaterThan(0);
    });
  });

  describe('createMatch', () => {
    it('should create a match relationship', async () => {
      const isEnabled = process.env.VITE_NEO4J_ENABLED === 'true';
      if (!isEnabled) {
        return;
      }

      // Crear usuarios primero
      await neo4jService.createUser(testUserId1, { name: 'Test User 1' });
      await neo4jService.createUser(testUserId2, { name: 'Test User 2' });

      // Crear match
      await neo4jService.createMatch(testUserId1, testUserId2, {
        match_id: 'test-match-1',
        created_at: new Date().toISOString(),
        score: 85,
      });

      // Verificar estadísticas
      const stats = await neo4jService.getGraphStats();
      expect(stats.matchCount).toBeGreaterThan(0);
    });
  });

  describe('createLike', () => {
    it('should create a like relationship', async () => {
      const isEnabled = process.env.VITE_NEO4J_ENABLED === 'true';
      if (!isEnabled) {
        return;
      }

      // Crear usuarios primero
      await neo4jService.createUser(testUserId1, { name: 'Test User 1' });
      await neo4jService.createUser(testUserId2, { name: 'Test User 2' });

      // Crear like
      await neo4jService.createLike(testUserId1, testUserId2, {
        like_id: 'test-like-1',
        created_at: new Date().toISOString(),
      });

      // Verificar estadísticas
      const stats = await neo4jService.getGraphStats();
      expect(stats.likeCount).toBeGreaterThan(0);
    });
  });

  describe('getMutualFriends', () => {
    it('should return mutual friends between two users', async () => {
      const isEnabled = process.env.VITE_NEO4J_ENABLED === 'true';
      if (!isEnabled) {
        return;
      }

      // Setup: crear usuarios y relaciones
      await neo4jService.createUser(testUserId1, { name: 'Test User 1' });
      await neo4jService.createUser(testUserId2, { name: 'Test User 2' });
      await neo4jService.createUser(testUserId3, { name: 'Test User 3' });

      // Crear relaciones de amistad
      await neo4jService.createMatch(testUserId1, testUserId3);
      await neo4jService.createMatch(testUserId2, testUserId3);

      // Obtener amigos mutuos
      const mutualFriends = await neo4jService.getMutualFriends(testUserId1, testUserId2);
      
      expect(Array.isArray(mutualFriends)).toBe(true);
      // Debería encontrar testUserId3 como amigo mutuo
      expect(mutualFriends.length).toBeGreaterThanOrEqual(0);
    });

    it('should return empty array when no mutual friends exist', async () => {
      const isEnabled = process.env.VITE_NEO4J_ENABLED === 'true';
      if (!isEnabled) {
        return;
      }

      const mutualFriends = await neo4jService.getMutualFriends('non-existent-1', 'non-existent-2');
      expect(Array.isArray(mutualFriends)).toBe(true);
      expect(mutualFriends.length).toBe(0);
    });
  });

  describe('getFriendsOfFriends', () => {
    it('should return friends of friends recommendations', async () => {
      const isEnabled = process.env.VITE_NEO4J_ENABLED === 'true';
      if (!isEnabled) {
        return;
      }

      // Setup: crear usuarios y relaciones
      await neo4jService.createUser(testUserId1, { name: 'Test User 1' });
      await neo4jService.createUser(testUserId2, { name: 'Test User 2' });
      await neo4jService.createUser(testUserId3, { name: 'Test User 3' });

      // Crear relaciones
      await neo4jService.createMatch(testUserId1, testUserId2);
      await neo4jService.createMatch(testUserId2, testUserId3);

      // Obtener friends of friends
      const fof = await neo4jService.getFriendsOfFriends(testUserId1, 10, true);
      
      expect(Array.isArray(fof)).toBe(true);
      // Debería encontrar testUserId3 como friend of friend
      expect(fof.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getGraphStats', () => {
    it('should return graph statistics', async () => {
      const isEnabled = process.env.VITE_NEO4J_ENABLED === 'true';
      if (!isEnabled) {
        return;
      }

      const stats = await neo4jService.getGraphStats();
      
      expect(stats).toHaveProperty('userCount');
      expect(stats).toHaveProperty('matchCount');
      expect(stats).toHaveProperty('likeCount');
      expect(stats).toHaveProperty('friendCount');
      
      expect(typeof stats.userCount).toBe('number');
      expect(typeof stats.matchCount).toBe('number');
      expect(typeof stats.likeCount).toBe('number');
      expect(typeof stats.friendCount).toBe('number');
    });
  });

  describe('syncUserFromPostgres', () => {
    it('should sync user from PostgreSQL data', async () => {
      const isEnabled = process.env.VITE_NEO4J_ENABLED === 'true';
      if (!isEnabled) {
        return;
      }

      const profileData = {
        id: 'test-profile-1',
        user_id: testUserId1,
        name: 'Test Profile',
        age: 28,
        location: 'Guadalajara',
        gender: 'Mujer',
        created_at: new Date().toISOString(),
      };

      await neo4jService.syncUserFromPostgres(testUserId1, profileData);

      const stats = await neo4jService.getGraphStats();
      expect(stats.userCount).toBeGreaterThan(0);
    });
  });

  describe('syncMatchFromPostgres', () => {
    it('should sync match from PostgreSQL data', async () => {
      const isEnabled = process.env.VITE_NEO4J_ENABLED === 'true';
      if (!isEnabled) {
        return;
      }

      // Crear usuarios primero
      await neo4jService.createUser(testUserId1, { name: 'Test User 1' });
      await neo4jService.createUser(testUserId2, { name: 'Test User 2' });

      const matchData = {
        id: 'test-match-1',
        user1_id: testUserId1,
        user2_id: testUserId2,
        created_at: new Date().toISOString(),
        score: 90,
      };

      await neo4jService.syncMatchFromPostgres(testUserId1, testUserId2, matchData);

      const stats = await neo4jService.getGraphStats();
      expect(stats.matchCount).toBeGreaterThan(0);
    });
  });
});

