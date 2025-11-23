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
  
  // Generar múltiples segmentos para un UUID válido
  const hash2 = (seed + 'salt1').split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
  const hash3 = (seed + 'salt2').split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
  const hash4 = (seed + 'salt3').split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
  
  // Convertir a UUID válido (formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
  const hex1 = Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
  const hex2 = Math.abs(hash2).toString(16).padStart(4, '0').slice(0, 4);
  const hex3 = Math.abs(hash3).toString(16).padStart(4, '0').slice(0, 4);
  const hex4 = Math.abs(hash4).toString(16).padStart(12, '0').slice(0, 12);
  
  // Formato UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // Segmento 1: 8 caracteres (hex1)
  // Segmento 2: 4 caracteres (hex2)
  // Segmento 3: 4 caracteres (4xxx)
  // Segmento 4: 4 caracteres (axxx)
  // Segmento 5: 12 caracteres (hex4)
  const segment3 = `4${hex3.slice(0, 3)}`;  // 4 + 3 chars = 4 chars total
  const segment4 = `a${hex3.slice(3, 6)}`.padEnd(4, '0');  // a + 3 chars padded = 4 chars total
  const segment5 = hex4.padStart(12, '0');  // 12 chars
  
  const uuid = `${hex1}-${hex2}-${segment3}-${segment4}-${segment5}`;
  
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
