/**
 * =====================================================
 * USER IDENTIFICATION SERVICE
 * =====================================================
 * Sistema de IDs únicos para usuarios Single y Pareja
 * Features: Generación, validación, búsqueda
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import { logger } from '@/lib/logger';

export type ProfileType = 'single' | 'couple';

export interface UserIdentifier {
  uniqueId: string;          // ID único generado
  userId: string;            // UUID de Supabase
  profileType: ProfileType;  // Tipo de perfil
  prefix: string;            // Prefijo (SNG- o CPL-)
  numericId: number;         // Número secuencial
  createdAt: Date;
  metadata?: {
    name?: string;
    email?: string;
    verificationLevel?: number;
  };
}

class UserIdentificationService {
  private readonly SINGLE_PREFIX = 'SNG';
  private readonly COUPLE_PREFIX = 'CPL';
  private readonly ID_LENGTH = 8; // Longitud del número (ej: 00000001)

  /**
   * Generar ID único para usuario
   */
  async generateUniqueId(
    userId: string,
    profileType: ProfileType,
    metadata?: UserIdentifier['metadata']
  ): Promise<UserIdentifier> {
    try {
      logger.info('[UserIdentification] Generating unique ID', { userId, profileType });

      // Obtener el siguiente número secuencial
      const numericId = await this.getNextSequentialNumber(profileType);

      // Generar ID con formato: PREFIX-NNNNNNNN
      const prefix = profileType === 'single' ? this.SINGLE_PREFIX : this.COUPLE_PREFIX;
      const paddedNumber = String(numericId).padStart(this.ID_LENGTH, '0');
      const uniqueId = `${prefix}-${paddedNumber}`;

      const identifier: UserIdentifier = {
        uniqueId,
        userId,
        profileType,
        prefix,
        numericId,
        createdAt: new Date(),
        metadata
      };

      // Guardar en base de datos
      await this.saveIdentifier(identifier);

      logger.info('[UserIdentification] Unique ID generated', { uniqueId });

      return identifier;
    } catch (error) {
      logger.error('[UserIdentification] Error generating ID:', { error });
      throw error;
    }
  }

  /**
   * Obtener siguiente número secuencial
   */
  private async getNextSequentialNumber(profileType: ProfileType): Promise<number> {
    try {
      // TODO: En producción, obtener desde Supabase
      // SELECT MAX(numeric_id) FROM user_identifiers WHERE profile_type = ?
      
      // Simulación temporal
      const key = `last_${profileType}_id`;
      const lastId = parseInt(localStorage.getItem(key) || '0', 10);
      const nextId = lastId + 1;
      localStorage.setItem(key, String(nextId));

      return nextId;
    } catch (error) {
      logger.error('[UserIdentification] Error getting sequential number:', { error });
      return 1;
    }
  }

  /**
   * Guardar identificador en BD
   */
  private async saveIdentifier(identifier: UserIdentifier): Promise<void> {
    try {
      // TODO: En producción, guardar en Supabase
      /*
      await supabase
        .from('user_identifiers')
        .insert({
          unique_id: identifier.uniqueId,
          user_id: identifier.userId,
          profile_type: identifier.profileType,
          prefix: identifier.prefix,
          numeric_id: identifier.numericId,
          metadata: identifier.metadata,
          created_at: identifier.createdAt.toISOString()
        });
      */

      // Simulación temporal
      const identifiers = JSON.parse(localStorage.getItem('user_identifiers') || '[]');
      identifiers.push(identifier);
      localStorage.setItem('user_identifiers', JSON.stringify(identifiers));

      logger.info('[UserIdentification] Identifier saved', { uniqueId: identifier.uniqueId });
    } catch (error) {
      logger.error('[UserIdentification] Error saving identifier:', { error });
      throw error;
    }
  }

  /**
   * Buscar usuario por ID único
   */
  async findByUniqueId(uniqueId: string): Promise<UserIdentifier | null> {
    try {
      logger.info('[UserIdentification] Searching by unique ID', { uniqueId });

      // TODO: En producción, buscar en Supabase
      /*
      const { data, error } = await supabase
        .from('user_identifiers')
        .select('*')
        .eq('unique_id', uniqueId)
        .single();

      if (error) throw error;
      return data;
      */

      // Simulación temporal
      const identifiers = JSON.parse(localStorage.getItem('user_identifiers') || '[]');
      const found = identifiers.find((id: UserIdentifier) => id.uniqueId === uniqueId);

      return found || null;
    } catch (error) {
      logger.error('[UserIdentification] Error finding by unique ID:', { error });
      return null;
    }
  }

  /**
   * Buscar usuario por UUID
   */
  async findByUserId(userId: string): Promise<UserIdentifier | null> {
    try {
      // TODO: En producción, buscar en Supabase
      const identifiers = JSON.parse(localStorage.getItem('user_identifiers') || '[]');
      const found = identifiers.find((id: UserIdentifier) => id.userId === userId);

      return found || null;
    } catch (error) {
      logger.error('[UserIdentification] Error finding by user ID:', { error });
      return null;
    }
  }

  /**
   * Validar formato de ID único
   */
  validateUniqueId(uniqueId: string): boolean {
    const pattern = /^(SNG|CPL)-\d{8}$/;
    return pattern.test(uniqueId);
  }

  /**
   * Extraer información de ID único
   */
  parseUniqueId(uniqueId: string): { profileType: ProfileType; numericId: number } | null {
    if (!this.validateUniqueId(uniqueId)) {
      return null;
    }

    const [prefix, numericPart] = uniqueId.split('-');
    const profileType: ProfileType = prefix === this.SINGLE_PREFIX ? 'single' : 'couple';
    const numericId = parseInt(numericPart, 10);

    return { profileType, numericId };
  }

  /**
   * Listar todos los usuarios de un tipo
   */
  async listByProfileType(profileType: ProfileType): Promise<UserIdentifier[]> {
    try {
      // TODO: En producción, obtener de Supabase
      const identifiers = JSON.parse(localStorage.getItem('user_identifiers') || '[]');
      return identifiers.filter((id: UserIdentifier) => id.profileType === profileType);
    } catch (error) {
      logger.error('[UserIdentification] Error listing by type:', { error });
      return [];
    }
  }

  /**
   * Obtener estadísticas
   */
  async getStats(): Promise<{ singles: number; couples: number; total: number }> {
    try {
      const identifiers = JSON.parse(localStorage.getItem('user_identifiers') || '[]');
      const singles = identifiers.filter((id: UserIdentifier) => id.profileType === 'single').length;
      const couples = identifiers.filter((id: UserIdentifier) => id.profileType === 'couple').length;

      return {
        singles,
        couples,
        total: singles + couples
      };
    } catch (error) {
      logger.error('[UserIdentification] Error getting stats:', { error });
      return { singles: 0, couples: 0, total: 0 };
    }
  }
}

export const userIdentificationService = new UserIdentificationService();
export default userIdentificationService;
