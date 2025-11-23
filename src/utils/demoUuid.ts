/**
 * Utilidad para generar UUIDs válidos para usuarios demo
 * Versión: 3.7.3
 */

/**
 * Genera un UUID válido para usuarios demo basado en un seed
 * @param seed - String base para generar el UUID (email, timestamp, etc.)
 * @returns UUID válido en formato estándar
 */
export const generateDemoUUID = (seed: string): string => {
  // Usar hash simple del seed para generar UUID consistente
  const hash = seed.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Convertir a UUID válido (formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const uuid = `${hex.slice(0,8)}-${hex.slice(0,4)}-4${hex.slice(1,4)}-a${hex.slice(2,4)}-${hex.repeat(3).slice(0,12)}`;
  
  return uuid;
};

/**
 * Genera un UUID demo para usuarios basado en email
 */
export const generateDemoUserUUID = (email: string): string => {
  return generateDemoUUID(`user-${email}`);
};

/**
 * Genera un UUID demo para transacciones
 */
export const generateDemoTransactionUUID = (type: string, userId: string): string => {
  return generateDemoUUID(`transaction-${type}-${userId}-${Date.now()}`);
};

/**
 * Genera un UUID demo para elementos generales
 */
export const generateDemoElementUUID = (type: string): string => {
  return generateDemoUUID(`${type}-${Date.now()}`);
};
