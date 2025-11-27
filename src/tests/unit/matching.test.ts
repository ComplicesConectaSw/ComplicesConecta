import { describe, it, expect } from 'vitest';
import { calculateCompatibility, calculateMatchScore, getSharedInterests } from '@/lib/matching';

describe('Matching Algorithm', () => {
  const _mockProfile1 = {
    id: '1',
    first_name: 'Ana',
    last_name: 'García',
    age: 28,
    bio: 'Me encanta el lifestyle swinger',
    gender: 'female',
    interested_in: 'both',
    is_premium: true,
    is_verified: true,
    relationship_type: 'single' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_id: '1',
    latitude: 19.4326,
    longitude: -99.1332,
    share_location: true,
    location: 'CDMX',
    profession: 'Ingeniera',
    interests: ['Lifestyle Swinger', 'Intercambio de Parejas', 'Fiestas Temáticas'],
    avatar: 'https://example.com/avatar1.jpg',
    photos: ['https://example.com/photo1.jpg'],
    stats: { matches: 15, likes: 50, views: 100 }
  };

  const _mockProfile2 = {
    id: '2',
    first_name: 'Carlos',
    last_name: 'López',
    age: 32,
    bio: 'Busco experiencias nuevas',
    gender: 'male',
    interested_in: 'both',
    is_premium: false,
    is_verified: true,
    relationship_type: 'single' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_id: '2',
    latitude: 19.4326,
    longitude: -99.1332,
    share_location: true,
    location: 'CDMX',
    profession: 'Médico',
    interests: ['Lifestyle Swinger', 'Encuentros Casuales', 'Mentalidad Abierta'],
    avatar: 'https://example.com/avatar2.jpg',
    photos: ['https://example.com/photo2.jpg'],
    stats: { matches: 8, likes: 25, views: 60 }
  };

  describe('calculateCompatibility', () => {
    it('should calculate compatibility between interest arrays', () => {
      const userInterests = ['Lifestyle Swinger', 'Intercambio de Parejas', 'Fiestas Temáticas'];
      const profileInterests = ['Lifestyle Swinger', 'Encuentros Casuales', 'Mentalidad Abierta'];
      
      const compatibility = calculateCompatibility(userInterests, profileInterests);
      expect(compatibility).toBeGreaterThan(0);
      expect(compatibility).toBeLessThanOrEqual(100);
    });

    it('should return higher compatibility for more shared interests', () => {
      const userInterests = ['Lifestyle Swinger', 'Intercambio de Parejas', 'Fiestas Temáticas'];
      const highSharedInterests = ['Lifestyle Swinger', 'Intercambio de Parejas', 'Fiestas Temáticas'];
      const lowSharedInterests = ['Encuentros Casuales', 'Mentalidad Abierta'];
      
      const highCompatibility = calculateCompatibility(userInterests, highSharedInterests);
      const lowCompatibility = calculateCompatibility(userInterests, lowSharedInterests);
      
      expect(highCompatibility).toBeGreaterThan(lowCompatibility);
    });

    it('should return 0 for empty interest arrays', () => {
      const compatibility = calculateCompatibility([], []);
      expect(compatibility).toBe(0);
    });
  });

  describe('getSharedInterests', () => {
    it('should return shared interests between arrays', () => {
      const userInterests = ['Lifestyle Swinger', 'Intercambio de Parejas', 'Fiestas Temáticas'];
      const profileInterests = ['Lifestyle Swinger', 'Encuentros Casuales', 'Fiestas Temáticas'];
      
      const shared = getSharedInterests(userInterests, profileInterests);
      expect(shared).toEqual(['Lifestyle Swinger', 'Fiestas Temáticas']);
    });

    it('should return empty array when no shared interests', () => {
      const userInterests = ['Lifestyle Swinger'];
      const profileInterests = ['Encuentros Casuales'];
      
      const shared = getSharedInterests(userInterests, profileInterests);
      expect(shared).toEqual([]);
    });
  });

  describe('calculateMatchScore', () => {
    it('should calculate match score for a profile', () => {
      const userInterests = ['Lifestyle Swinger', 'Intercambio de Parejas'];
      const profile = {
        id: '1',
        interests: ['Lifestyle Swinger', 'Encuentros Casuales']
      };
      
      const matchScore = calculateMatchScore(userInterests, profile);
      
      expect(matchScore.profileId).toBe('1');
      expect(matchScore.compatibilityScore).toBeGreaterThan(0);
      expect(matchScore.sharedInterests).toContain('Lifestyle Swinger');
      expect(Array.isArray(matchScore.matchReasons)).toBe(true);
    });
  });
});
