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
