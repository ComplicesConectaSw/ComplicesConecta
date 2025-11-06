/**
 * SustainabilityService - Tracking CO2 ahorrado
 * 
 * Calcula CO2 ahorrado por eventos virtuales
 * 
 * @version 3.5.0
 */

import { logger } from '@/lib/logger';

// Factores de emisión CO2 (kg CO2 por actividad)
const CO2_FACTORS = {
  virtual_event: 0.5, // kg CO2 ahorrado por participante en evento virtual
  virtual_meeting: 0.3, // kg CO2 ahorrado por reunión virtual
  online_chat: 0.1 // kg CO2 ahorrado por chat online vs presencial
};

class SustainabilityService {
  private static instance: SustainabilityService;

  static getInstance(): SustainabilityService {
    if (!SustainabilityService.instance) {
      SustainabilityService.instance = new SustainabilityService();
    }
    return SustainabilityService.instance;
  }

  /**
   * Calcula CO2 ahorrado por actividad virtual
   */
  async calculateCO2Saved(activityType: keyof typeof CO2_FACTORS): Promise<number> {
    const factor = CO2_FACTORS[activityType] || 0;
    logger.debug('Calculando CO2 ahorrado', { activityType, factor });
    return factor;
  }

  /**
   * Obtiene total de CO2 ahorrado por usuario
   */
  async getTotalCO2Saved(userId: string): Promise<number> {
    // En producción, esto consultaría la BD
    logger.debug('Obteniendo total CO2 ahorrado', { userId: userId.substring(0, 8) + '***' });
    return 0; // Stub
  }
}

export const sustainabilityService = SustainabilityService.getInstance();
export default sustainabilityService;

