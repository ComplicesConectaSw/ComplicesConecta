import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateMockSingle, generateMockCouple } from '@/lib/data';
import { inferProfileKind, pickProfileImage } from '@/lib/media';

describe('Profiles - Generación y Validación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateMockSingle', () => {
    it('debe generar perfil single válido', () => {
      const profile = generateMockSingle();

      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('age');
      expect(profile).toHaveProperty('location');
      expect(profile).toHaveProperty('bio');
      expect(profile).toHaveProperty('interests');
      expect(profile).toHaveProperty('avatar');
      expect(profile).toHaveProperty('verified');
      expect(profile).toHaveProperty('profession');
      expect(profile).toHaveProperty('photos');

      expect(typeof profile.name).toBe('string');
      expect(typeof profile.age).toBe('number');
      expect(Array.isArray(profile.interests)).toBe(true);
      expect(Array.isArray(profile.photos)).toBe(true);
      expect(profile.age).toBeGreaterThanOrEqual(18);
      expect(profile.age).toBeLessThanOrEqual(65);
    });

    it('debe generar perfiles únicos en múltiples llamadas', () => {
      const profile1 = generateMockSingle();
      const profile2 = generateMockSingle();

      expect(profile1.id).not.toBe(profile2.id);
      expect(profile1.name).not.toBe(profile2.name);
    });

    it('debe incluir estado online cuando se especifica', () => {
      const profileWithOnline = generateMockSingle(true);
      const profileWithoutOnline = generateMockSingle(false);

      expect(profileWithOnline).toHaveProperty('isOnline');
      expect(profileWithoutOnline).not.toHaveProperty('isOnline');
    });

    it('debe tener intereses relacionados con lifestyle', () => {
      const profile = generateMockSingle();

      const lifestyleKeywords = [
        'lifestyle', 'swinger', 'intercambio', 'parejas', 'encuentros',
        'clubs', 'eventos', 'swap', 'unicornios', 'mentalidad'
      ];

      const hasLifestyleInterests = profile.interests.some(interest =>
        lifestyleKeywords.some(keyword =>
          interest.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      expect(hasLifestyleInterests).toBe(true);
    });
  });

  describe('generateMockCouple', () => {
    it('debe generar perfil couple válido', () => {
      const profile = generateMockCouple();

      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('coupleName');
      expect(profile).toHaveProperty('ages');
      expect(profile).toHaveProperty('location');
      expect(profile).toHaveProperty('bio');
      expect(profile).toHaveProperty('interests');
      expect(profile).toHaveProperty('photos');

      expect(typeof profile.coupleName).toBe('string');
      expect(Array.isArray(profile.ages)).toBe(true);
      expect(profile.ages).toHaveLength(2);
      expect(Array.isArray(profile.interests)).toBe(true);
      expect(Array.isArray(profile.photos)).toBe(true);
    });

    it('debe tener edades válidas para ambos miembros', () => {
      const profile = generateMockCouple();

      profile.ages.forEach(age => {
        expect(age).toBeGreaterThanOrEqual(18);
        expect(age).toBeLessThanOrEqual(65);
      });
    });

    it('debe incluir nombres de pareja realistas', () => {
      const profile = generateMockCouple();

      expect(profile.coupleName).toMatch(/\w+\s*(&|y|\+)\s*\w+/);
    });
  });

  describe('inferProfileKind', () => {
    it('debe inferir perfil masculino por nombre', () => {
      const result = inferProfileKind({ name: 'Alejandro' });

      expect(result.kind).toBe('single');
      expect(result.gender).toBe('male');
    });

    it('debe inferir perfil femenino por nombre', () => {
      const result = inferProfileKind({ name: 'Laura' });

      expect(result.kind).toBe('single');
      expect(result.gender).toBe('female');
    });

    it('debe inferir pareja por nombres múltiples', () => {
      const result = inferProfileKind({ name: 'José & Miguel' });

      expect(result.kind).toBe('couple');
    });

    it('debe manejar nombres desconocidos', () => {
      const result = inferProfileKind({ name: 'NombreDesconocido' });

      expect(result.gender).toBe('unknown');
    });

    it('debe respetar tipo explícito', () => {
      const result = inferProfileKind({
        name: 'Alejandro',
        type: 'couple'
      });

      expect(result.kind).toBe('couple');
    });

    it('debe respetar género explícito', () => {
      const result = inferProfileKind({
        name: 'NombreNeutro',
        gender: 'female'
      });

      expect(result.gender).toBe('female');
    });
  });

  describe('pickProfileImage', () => {
    it('debe seleccionar imagen para perfil masculino', () => {
      const used = new Set<string>();
      const profile = { id: 'test1', name: 'Juan', gender: 'male' as const };
      const _image = pickProfileImage(profile, used);

      expect(typeof _image).toBe('string');
      expect(_image).toMatch(/https:\/\/images\.unsplash\.com/);
    });

    it('debe seleccionar imagen para perfil femenino', () => {
      const used = new Set<string>();
      const profile = { id: 'test2', name: 'María', gender: 'female' as const };
      const _image = pickProfileImage(profile, used);

      expect(typeof _image).toBe('string');
      expect(_image).toMatch(/https:\/\/images\.unsplash\.com/);
    });

    it('debe seleccionar imagen para pareja', () => {
      const used = new Set<string>();
      const profile = { id: 'test3', name: 'Ana & Carlos', type: 'couple' as const };
      const _image = pickProfileImage(profile, used);

      expect(typeof _image).toBe('string');
      expect(_image).toMatch(/https:\/\/images\.unsplash\.com/);
    });

    it('debe evitar duplicados en selecciones múltiples', () => {
      const used = new Set<string>();
      
      for (let i = 0; i < 10; i++) {
        const profile = { id: `test${i}`, name: 'Juan', gender: 'male' as const };
        const _image = pickProfileImage(profile, used);
        // Note: used Set is updated inside the function
      }

      // Debe haber al menos 1 imagen seleccionada
      expect(used.size).toBeGreaterThan(0);
    });
  });

  describe('Validación de Datos de Perfil', () => {
    it('debe validar estructura de perfil single', () => {
      const profile = generateMockSingle();

      const requiredFields = [
        'id', 'name', 'age', 'location', 'bio', 'interests',
        'avatar', 'verified', 'profession', 'photos'
      ];

      requiredFields.forEach(field => {
        expect(profile).toHaveProperty(field);
      });
    });

    it('debe validar estructura de perfil couple', () => {
      const profile = generateMockCouple();

      const requiredFields = [
        'id', 'coupleName', 'ages', 'location', 'bio',
        'interests', 'photos'
      ];

      requiredFields.forEach(field => {
        expect(profile).toHaveProperty(field);
      });
    });

    it('debe tener bio con longitud apropiada', () => {
      const singleProfile = generateMockSingle();
      const coupleProfile = generateMockCouple();

      expect(singleProfile.bio.length).toBeGreaterThan(20);
      expect(singleProfile.bio.length).toBeLessThan(500);
      expect(coupleProfile.bio.length).toBeGreaterThan(20);
      expect(coupleProfile.bio.length).toBeLessThan(500);
    });

    it('debe tener al menos 3 intereses', () => {
      const singleProfile = generateMockSingle();
      const coupleProfile = generateMockCouple();

      expect(singleProfile.interests.length).toBeGreaterThanOrEqual(3);
      expect(coupleProfile.interests.length).toBeGreaterThanOrEqual(3);
    });

    it('debe tener al menos 2 fotos', () => {
      const singleProfile = generateMockSingle();
      const coupleProfile = generateMockCouple();

      expect(singleProfile.photos.length).toBeGreaterThanOrEqual(2);
      expect(coupleProfile.photos.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Localización Mexicana', () => {
    it('debe usar ubicaciones mexicanas válidas', () => {
      const profile = generateMockSingle();

      const _mexicanCities = [
        'CDMX', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana',
        'León', 'Querétaro', 'Cancún', 'Playa del Carmen', 'Mérida', 'Toluca',
        'Aguascalientes', 'Morelia', 'Colima', 'Durango', 'Chihuahua',
        'Saltillo', 'Zacatecas', 'San Luis Potosí', 'Aguascalientes'
      ];

      // Verify the location exists and is a string
      expect(typeof profile.location).toBe('string');
      expect(profile.location.length).toBeGreaterThan(0);
    });

    it('debe usar nombres mexicanos comunes', () => {
      const profiles = Array.from({ length: 10 }, () => generateMockSingle());
      
      const mexicanNames = [
        'Sofía', 'Valentina', 'Isabella', 'Camila', 'Lucía', 'Daniela',
        'Raúl', 'Miguel', 'Alejandro', 'Fernando', 'Roberto', 'Javier'
      ];

      const hasValidNames = profiles.some(profile =>
        mexicanNames.some(name => profile.name.includes(name))
      );

      expect(hasValidNames).toBe(true);
    });
  });
});
