/**
 * Tests unitarios para validaciones Zod
 * Verifica que los esquemas funcionen correctamente
 */

import { describe, it, expect } from 'vitest';
import {
  ProfileCardSchema, 
  ThemeSelectorSchema,
  EmailValidationSchema as EmailSchema,
  StakingSchema,
  TokenTransactionSchema
} from '@/lib/zod-schemas';

describe('Zod Schema Validation', () => {
  describe('ProfileCard Validation', () => {
    it('should validate correct profile data', () => {
      const validProfile = {
        id: 'profile-123',
        name: 'Alejandra Martínez',
        age: 28,
        location: 'Ciudad de México, México',
        bio: 'Pareja aventurera buscando nuevas experiencias y conexiones auténticas',
        interests: ['lifestyle swinger', 'intercambio de parejas', 'fiestas temáticas', 'mentalidad abierta'],
        isOnline: true,
        verified: true
      };

      const validResult = ProfileCardSchema.safeParse(validProfile);
      expect(validResult.success).toBe(true);
      if (validResult.success) {
        expect(validResult.data).toMatchObject(validProfile);
        expect(validResult.data.name).toBe('Alejandra Martínez');
        expect(validResult.data.age).toBe(28);
      }
    });

    it('should reject profile with invalid age', () => {
      const invalidProfile = {
        id: 'profile-123',
        name: 'Carlos Joven',
        age: 16, // Menor de 18
        location: 'Guadalajara, México',
        bio: 'Persona joven explorando nuevas experiencias',
        images: ['carlos.jpg'],
        interests: ['encuentros casuales'],
        isOnline: true,
        verified: true
      };

      const result = ProfileCardSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('18');
      }
    });

    it('should reject profile with empty name', () => {
      const invalidProfile = {
        id: 'profile-123',
        name: '', // Nombre vacío
        age: 25,
        location: 'Monterrey, México',
        bio: 'Pareja liberal con mente abierta buscando diversión',
        images: ['pareja.jpg'],
        interests: ['intercambio de parejas', 'eventos privados'],
        isOnline: true,
        verified: true
      };

      const result = ProfileCardSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });
  });

  describe('ThemeSelector Validation', () => {
    it('should validate correct theme selector props', () => {
      const validThemeProps = {
        currentTheme: 'modern' as const,
        onThemeChange: (theme: string) => console.log(theme),
        disabled: false,
        showPreview: true,
        className: 'theme-selector'
      };

      const result = ThemeSelectorSchema.safeParse(validThemeProps);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentTheme).toBe('modern');
        expect(result.data.showPreview).toBe(true);
      }
    });

    it('should reject invalid theme', () => {
      const invalidThemeProps = {
        currentTheme: 'invalid-theme' as any,
        onThemeChange: (theme: string) => console.log(theme),
        disabled: false,
        showPreview: true
      };

      const result = ThemeSelectorSchema.safeParse(invalidThemeProps);
      expect(result.success).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email data', () => {
      const validEmail = {
        email: 'usuario@complicesconecta.com',
        template: 'welcome' as const,
        variables: {
          name: 'María',
          company: 'ComplicesConecta',
          ubicacion: 'México'
        }
      };

      const result = EmailSchema.safeParse(validEmail);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('usuario@complicesconecta.com');
        expect(result.data.template).toBe('welcome');
      }
    });

    it('should reject invalid email format', () => {
      const invalidEmail = {
        email: 'correo-invalido',
        template: 'welcome' as const
      };

      const result = EmailSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email');
      }
    });

    it('should reject email that is too short', () => {
      const shortEmail = {
        email: 'a@b',
        template: 'welcome' as const
      };

      const result = EmailSchema.safeParse(shortEmail);
      expect(result.success).toBe(false);
    });
  });

  describe('Staking Validation', () => {
    it('should validate correct staking data', () => {
      const validStaking = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100,
        duration: 30,
        tokenType: 'cmpx' as const
      };

      const result = StakingSchema.safeParse(validStaking);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(100);
        expect(result.data.tokenType).toBe('cmpx');
      }
    });

    it('should reject staking with invalid amount', () => {
      const invalidStaking = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 0, // Cantidad inválida
        duration: 30,
        tokenType: 'cmpx' as const
      };

      const result = StakingSchema.safeParse(invalidStaking);
      expect(result.success).toBe(false);
    });

    it('should reject staking with invalid duration', () => {
      const invalidStaking = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100,
        duration: 0, // Duración inválida (menor a 1)
        tokenType: 'cmpx' as const
      };

      const result = StakingSchema.safeParse(invalidStaking);
      expect(result.success).toBe(false);
    });

    it('should reject staking with invalid token type', () => {
      const invalidStaking = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100,
        duration: 30,
        tokenType: 'invalid' as any
      };

      const result = StakingSchema.safeParse(invalidStaking);
      expect(result.success).toBe(false);
    });
  });

  describe('Token Transaction Validation', () => {
    it('should validate correct transaction data', () => {
      const validTransaction = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        tokenType: 'gtk' as const,
        amount: 50,
        transactionType: 'referral_bonus' as const,
        description: 'Bono por referir nuevo usuario a la plataforma'
      };

      const result = TokenTransactionSchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(50);
        expect(result.data.transactionType).toBe('referral_bonus');
      }
    });

    it('should reject transaction with excessive amount', () => {
      const invalidTransaction = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        tokenType: 'gtk' as const,
        amount: 15000, // Cantidad excesiva
        transactionType: 'referral_bonus' as const,
        description: 'Transacción inválida - cantidad muy alta'
      };

      const result = TokenTransactionSchema.safeParse(invalidTransaction);
      expect(result.success).toBe(false);
    });
  });

  describe('Schema Direct Usage', () => {
    it('should parse valid data with ProfileCardSchema', () => {
      const validData = {
        id: 'test-id',
        name: 'Carmen López',
        age: 25,
        location: 'Cancún, México',
        bio: 'Pareja divertida que disfruta de la vida nocturna y nuevas aventuras',
        images: ['carmen.jpg'],
        interests: ['lifestyle swinger', 'clubs privados', 'fiestas temáticas', 'intercambio de parejas'],
        isOnline: true,
        verified: true
      };

      const result = ProfileCardSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle schema parsing errors gracefully', () => {
      const invalidData = {
        id: '', // ID vacío
        name: 'Persona Joven',
        age: 15, // Edad inválida
      };

      const result = ProfileCardSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined values correctly', () => {
      const result = ProfileCardSchema.safeParse(undefined as any);
      expect(result.success).toBe(false);
    });

    it('should handle null values correctly', () => {
      const result = EmailSchema.safeParse(null as any);
      expect(result.success).toBe(false);
    });

    it('should handle empty objects correctly', () => {
      const result = StakingSchema.safeParse({} as any);
      expect(result.success).toBe(false);
    });
  });
});
