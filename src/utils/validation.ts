/**
 * Utilidades de validación para ComplicesConecta
 * Incluye validación de edad, email único y términos de uso
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

/**
 * Valida que el usuario sea mayor de 18 años
 * @param birthDate - Fecha de nacimiento en formato YYYY-MM-DD
 * @returns true si es mayor de 18 años, false en caso contrario
 */
export const validateAge = (birthDate: string): boolean => {
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Ajustar si no ha cumplido años este año
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }
    
    return age >= 18;
  } catch (error) {
    logger.error('Error validando edad:', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
};

/**
 * Valida que ambos miembros de una pareja sean mayores de 18 años
 * @param birthDate1 - Fecha de nacimiento del primer miembro
 * @param birthDate2 - Fecha de nacimiento del segundo miembro
 * @returns objeto con validación individual y general
 */
export const validateCoupleAge = (birthDate1: string, birthDate2: string) => {
  const member1Valid = validateAge(birthDate1);
  const member2Valid = validateAge(birthDate2);
  
  return {
    member1Valid,
    member2Valid,
    bothValid: member1Valid && member2Valid,
    message: !member1Valid || !member2Valid 
      ? 'Ambos miembros de la pareja deben ser mayores de 18 años'
      : 'Validación de edad exitosa'
  };
};

/**
 * Valida que el email sea único en la base de datos
 * @param email - Email a validar
 * @returns true si el email es único, false si ya existe
 */
export const validateUniqueEmail = async (email: string): Promise<boolean> => {
  try {
    if (!supabase) {
      logger.error('Supabase no está disponible');
      return false;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (error) {
      logger.error('Error validando email único:', { error: error.message });
      return false;
    }

    return !data || data.length === 0;
  } catch (error) {
    logger.error('Error en validateUniqueEmail:', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
};

/**
 * Valida formato de email
 * @param email - Email a validar
 * @returns true si el formato es válido
 */
export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida y normaliza números telefónicos de México
 * Acepta formatos: 5512345678, 044 55 1234 5678, 045 55 1234 5678, +52 55 1234 5678, 52 55 1234 5678
 * @param value - Número de teléfono a validar
 * @returns Objeto con validación, número normalizado y mensaje de error
 */
export const validateMXPhone = (value: string): {
  valid: boolean;
  normalized: string;
  error?: string;
} => {
  // Limpiar el número: eliminar espacios, guiones y paréntesis
  const clean = value.replace(/[\s\-()]/g, '');
  
  // Expresión regular para validar números mexicanos
  // Acepta: +52, 52, 044, 045 seguido de 10 dígitos
  // O directamente 10 dígitos
  const mexicanPhoneRegex = /^(\+?52|044|045)?(\d{10})$/;
  const match = clean.match(mexicanPhoneRegex);
  
  if (!match) {
    return {
      valid: false,
      normalized: '',
      error: '10 dígitos requeridos (ej: 55 1234 5678)'
    };
  }
  
  // Extraer los 10 dígitos finales
  const tenDigits = match[2];
  
  // Validar que los 10 dígitos sean válidos para México
  // Los números móviles en México empiezan típicamente con: 55, 33, 81, 222, etc.
  const firstTwoDigits = tenDigits.substring(0, 2);
  const validPrefixes = ['55', '33', '81', '22', '44', '66', '77', '99', '61', '62', '64', '65', '67', '68', '69', '71', '72', '73', '74', '75', '76'];
  
  const isValidPrefix = validPrefixes.includes(firstTwoDigits) || 
                       (parseInt(firstTwoDigits) >= 20 && parseInt(firstTwoDigits) <= 99);
  
  if (!isValidPrefix) {
    return {
      valid: false,
      normalized: '',
      error: 'Código de área no válido para México'
    };
  }
  
  // Normalizar al formato +52 seguido de los 10 dígitos
  const normalized = `+52${tenDigits}`;
  
  return {
    valid: true,
    normalized,
    error: undefined
  };
};

/**
 * Formatea un número de teléfono mexicano para visualización
 * @param phone - Número de teléfono (puede estar normalizado o no)
 * @returns Número formateado (ej: +52 55 1234 5678)
 */
export const formatMXPhone = (phone: string): string => {
  const validation = validateMXPhone(phone);
  
  if (!validation.valid || !validation.normalized) {
    return phone; // Devolver el original si no es válido
  }
  
  // Formato: +52 XX XXXX XXXX
  const normalized = validation.normalized;
  const countryCode = normalized.substring(0, 3);  // +52
  const areaCode = normalized.substring(3, 5);     // XX
  const firstPart = normalized.substring(5, 9);    // XXXX
  const secondPart = normalized.substring(9, 13);  // XXXX
  
  return `${countryCode} ${areaCode} ${firstPart} ${secondPart}`;
};

/**
 * Valida que los términos y políticas hayan sido aceptados
 * @param termsAccepted - Boolean indicando si se aceptaron los términos
 * @param privacyAccepted - Boolean indicando si se aceptó la política de privacidad
 * @returns objeto con validación y mensaje
 */
export const validateTermsAcceptance = (termsAccepted: boolean, privacyAccepted: boolean) => {
  const allAccepted = termsAccepted && privacyAccepted;
  
  return {
    valid: allAccepted,
    message: allAccepted 
      ? 'Términos y políticas aceptados correctamente'
      : 'Debe aceptar los Términos de Uso y la Política de Privacidad para continuar'
  };
};

/**
 * Validación completa para registro de usuario single
 * @param userData - Datos del usuario a validar
 * @returns objeto con resultado de validación
 */
export const validateSingleRegistration = async (userData: {
  email: string;
  birthDate: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}) => {
  const validations = {
    emailFormat: validateEmailFormat(userData.email),
    emailUnique: await validateUniqueEmail(userData.email),
    ageValid: validateAge(userData.birthDate),
    termsValid: validateTermsAcceptance(userData.termsAccepted, userData.privacyAccepted)
  };

  const allValid = validations.emailFormat && 
                   validations.emailUnique && 
                   validations.ageValid && 
                   validations.termsValid.valid;

  return {
    valid: allValid,
    validations,
    message: allValid ? 'Validación exitosa' : 'Hay errores en los datos proporcionados'
  };
};

/**
 * Validación completa para registro de pareja
 * @param coupleData - Datos de la pareja a validar
 * @returns objeto con resultado de validación
 */
export const validateCoupleRegistration = async (coupleData: {
  email: string;
  member1BirthDate: string;
  member2BirthDate: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}) => {
  const validations = {
    emailFormat: validateEmailFormat(coupleData.email),
    emailUnique: await validateUniqueEmail(coupleData.email),
    ageValid: validateCoupleAge(coupleData.member1BirthDate, coupleData.member2BirthDate),
    termsValid: validateTermsAcceptance(coupleData.termsAccepted, coupleData.privacyAccepted)
  };

  const allValid = validations.emailFormat && 
                   validations.emailUnique && 
                   validations.ageValid.bothValid && 
                   validations.termsValid.valid;

  return {
    valid: allValid,
    validations,
    message: allValid ? 'Validación exitosa' : 'Hay errores en los datos proporcionados'
  };
};
