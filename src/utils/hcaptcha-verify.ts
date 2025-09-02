import { verify } from 'hcaptcha';

// Configuración de hCaptcha
const HCAPTCHA_SECRET = process.env.VITE_HCAPTCHA_SECRET;

if (!HCAPTCHA_SECRET || HCAPTCHA_SECRET === 'your-hcaptcha-secret-key') {
  throw new Error('hCaptcha secret key is not configured correctly in environment variables.');
}

/**
 * Verifica un token de hCaptcha
 * @param token - Token generado por el widget de hCaptcha
 * @returns Promise con el resultado de la verificación
 */
export const verifyHCaptcha = async (token: string): Promise<{
  success: boolean;
  message?: string;
  data?: any;
}> => {
  try {
    // Verificar que el token existe
    if (!token) {
      return {
        success: false,
        message: 'Token de hCaptcha requerido'
      };
    }

    // Verificar que tenemos la clave secreta

    // Realizar la verificación
    const data = await verify(HCAPTCHA_SECRET, token);
    
    if (data.success === true) {
      console.log('hCaptcha verificado exitosamente:', data);
      return {
        success: true,
        message: 'Verificación exitosa',
        data
      };
    } else {
      console.log('Verificación de hCaptcha falló:', data);
      return {
        success: false,
        message: 'Verificación falló',
        data
      };
    }
  } catch (error) {
    console.error('Error al verificar hCaptcha:', error);
    return {
      success: false,
      message: 'Error interno de verificación'
    };
  }
};

/**
 * Ejemplo de uso básico
 */
export const exampleUsage = () => {
  // Ejemplo de cómo usar la función de verificación
  const token = 'token-from-hcaptcha-widget';
  
  verifyHCaptcha(token)
    .then((result) => {
      if (result.success) {
        console.log('✅ Verificación exitosa!', result.data);
        // Proceder con el registro/login del usuario
      } else {
        console.log('❌ Verificación falló:', result.message);
        // Mostrar error al usuario
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};
