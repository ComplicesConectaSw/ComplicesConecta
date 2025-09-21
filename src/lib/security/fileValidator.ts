/**
 * Validador de archivos subidos con verificación de contenido y seguridad
 * Protege contra uploads maliciosos sin modificar lógica de negocio existente
 */

import { logger } from '@/lib/logger';

// Tipos MIME permitidos por categoría
const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif'
  ],
  documents: [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  audio: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4'
  ]
} as const;

// Extensiones permitidas por categoría
const ALLOWED_EXTENSIONS = {
  images: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'],
  documents: ['pdf', 'txt', 'doc', 'docx'],
  audio: ['mp3', 'wav', 'ogg', 'm4a']
} as const;

type AllowedExtensionCategory = keyof typeof ALLOWED_EXTENSIONS;

// Límites de tamaño por tipo (en bytes)
const SIZE_LIMITS = {
  images: 10 * 1024 * 1024,      // 10MB para imágenes
  documents: 25 * 1024 * 1024,   // 25MB para documentos
  audio: 50 * 1024 * 1024,       // 50MB para audio
  default: 5 * 1024 * 1024       // 5MB por defecto
} as const;

// Firmas de archivos (magic numbers) para verificación de contenido
const FILE_SIGNATURES = {
  // Imágenes
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF],                    // JPEG
    [0xFF, 0xD8, 0xFF, 0xE0],             // JPEG/JFIF
    [0xFF, 0xD8, 0xFF, 0xE1]              // JPEG/EXIF
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] // PNG
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]  // GIF89a
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46] // RIFF (WebP container)
  ],
  // PDFs
  'application/pdf': [
    [0x25, 0x50, 0x44, 0x46] // %PDF
  ]
} as const;

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: {
    name: string;
    size: number;
    type: string;
    extension: string;
    category?: keyof typeof ALLOWED_MIME_TYPES;
  };
  securityChecks: {
    mimeTypeValid: boolean;
    extensionValid: boolean;
    sizeValid: boolean;
    signatureValid: boolean;
    nameValid: boolean;
  };
}

export class FileValidator {
  
  /**
   * Valida un archivo completo
   */
  public static async validateFile(
    file: File, 
    category?: keyof typeof ALLOWED_MIME_TYPES
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        extension: this.getFileExtension(file.name),
        category
      },
      securityChecks: {
        mimeTypeValid: false,
        extensionValid: false,
        sizeValid: false,
        signatureValid: false,
        nameValid: false
      }
    };

    try {
      // 1. Validar nombre del archivo
      result.securityChecks.nameValid = this.validateFileName(file.name);
      if (!result.securityChecks.nameValid) {
        result.errors.push('Nombre de archivo contiene caracteres no permitidos');
        result.isValid = false;
      }

      // Detectar categoría si no se especificó
      if (!category) {
        const detectedCategory = this.detectFileCategory(file.type, file.name);
        if (detectedCategory) {
          category = detectedCategory;
          result.fileInfo.category = category;
        }
      }

      // 3. Validar tipo MIME
      result.securityChecks.mimeTypeValid = this.validateMimeType(file.type, category);
      if (!result.securityChecks.mimeTypeValid) {
        result.errors.push(`Tipo de archivo no permitido: ${file.type}`);
        result.isValid = false;
      }

      // 4. Validar extensión
      result.securityChecks.extensionValid = this.validateExtension(
        result.fileInfo.extension, 
        category
      );
      if (!result.securityChecks.extensionValid) {
        result.errors.push(`Extensión no permitida: ${result.fileInfo.extension}`);
        result.isValid = false;
      }

      // 5. Validar tamaño
      result.securityChecks.sizeValid = this.validateFileSize(file.size, category);
      if (!result.securityChecks.sizeValid) {
        const limit = category ? SIZE_LIMITS[category] : SIZE_LIMITS.default;
        result.errors.push(`Archivo demasiado grande. Máximo: ${this.formatFileSize(limit)}`);
        result.isValid = false;
      }

      // 6. Validar firma del archivo (magic numbers)
      if (!(await this.validateFileContent(file))) {
        result.errors.push('El contenido del archivo no coincide con su tipo declarado');
        result.isValid = false;
      }

      // 7. Verificaciones adicionales de seguridad
      await this.performSecurityChecks(file, result);

      logger.info('📋 Validación de archivo completada', {
        fileName: file.name,
        isValid: result.isValid,
        errors: result.errors.length,
        warnings: result.warnings.length,
        category
      });

    } catch (error) {
      logger.error('❌ Error durante validación de archivo', { 
        fileName: file.name, 
        error 
      });
      result.errors.push('Error interno durante la validación');
      result.isValid = false;
    }

    return result;
  }

  /**
   * Valida nombre del archivo
   */
  private static validateFileName(fileName: string): boolean {
    // Verificar caracteres de control y caracteres peligrosos
    // eslint-disable-next-line no-control-regex
    const controlChars = /[\u0000-\u001f\u007f-\u009f]/g;
    
    // Caracteres prohibidos en nombres de archivo
    const forbiddenChars = /[<>:"/\\|?*]/;
    
    // Nombres reservados en Windows
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    
    // Verificaciones
    if (controlChars.test(fileName)) return false;
    if (forbiddenChars.test(fileName)) return false;
    if (reservedNames.test(fileName)) return false;
    if (fileName.length > 255) return false;
    if (fileName.startsWith('.') || fileName.endsWith('.')) return false;
    
    return true;
  }

  /**
   * Obtiene la extensión del archivo
   */
  private static getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > 0 ? fileName.substring(lastDot).toLowerCase() : '';
  }

  /**
   * Detecta la categoría del archivo
   */
  private static detectFileCategory(
    mimeType: string, 
    fileName: string
  ): keyof typeof ALLOWED_MIME_TYPES | undefined {
    // Buscar por MIME type
    for (const [category, types] of Object.entries(ALLOWED_MIME_TYPES)) {
      if ((types as readonly string[]).includes(mimeType)) {
        return category as keyof typeof ALLOWED_MIME_TYPES;
      }
    }

    // Buscar por extensión como fallback
    const extension = this.getFileExtension(fileName);
    const categoryKey = Object.keys(ALLOWED_EXTENSIONS).find(cat => {
      const category = cat as AllowedExtensionCategory;
      return ALLOWED_EXTENSIONS[category].includes(extension);
    }) as AllowedExtensionCategory | undefined;
  
    return categoryKey;
  }

  /**
   * Valida tipo MIME
   */
  private static validateMimeType(
    mimeType: string, 
    category?: keyof typeof ALLOWED_MIME_TYPES
  ): boolean {
    if (!category) return false;
    
    const allowedTypes = ALLOWED_MIME_TYPES[category];
    return (allowedTypes as readonly string[]).includes(mimeType);
  }

  /**
   * Valida extensión del archivo
   */
  private static validateExtension(
    extension: string, 
    category?: keyof typeof ALLOWED_MIME_TYPES
  ): boolean {
    if (!category || !extension) return false;
    
    const allowedExtensions = ALLOWED_EXTENSIONS[category];
    return (allowedExtensions as readonly string[]).includes(extension);
  }

  /**
   * Valida tamaño del archivo
   */
  private static validateFileSize(
    size: number, 
    category?: keyof typeof ALLOWED_MIME_TYPES
  ): boolean {
    const limit = category ? SIZE_LIMITS[category] : SIZE_LIMITS.default;
    return size <= limit;
  }

  /**
   * Valida el contenido del archivo usando magic numbers
   */
  private static validateFileContent(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          resolve(false);
          return;
        }
        
        const bytes = new Uint8Array(arrayBuffer.slice(0, 8));
        const extension = this.getFileExtension(file.name);
        
        // Magic numbers para validación
        const magicNumbers: Record<string, number[][]> = {
          'jpg': [[0xFF, 0xD8, 0xFF]],
          'jpeg': [[0xFF, 0xD8, 0xFF]],
          'png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
          'gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
          'webp': [[0x52, 0x49, 0x46, 0x46]],
          'pdf': [[0x25, 0x50, 0x44, 0x46]],
          'mp4': [[0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]]
        };
        
        const expectedSignatures = magicNumbers[extension];
        if (!expectedSignatures) {
          resolve(true); // Si no hay firma definida, aceptar
          return;
        }
        
        // Verificar si alguna firma coincide
        const isValid = expectedSignatures.some(signature => 
          signature.every((byte, index) => bytes[index] === byte)
        );
        
        resolve(isValid);
      };
      
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 8));
    });
  }

  /**
   * Verificaciones adicionales de seguridad
   */
  private static async performSecurityChecks(
    file: File, 
    result: ValidationResult
  ): Promise<void> {
    // Verificar si el archivo está vacío
    if (file.size === 0) {
      result.warnings.push('El archivo está vacío');
    }

    // Verificar nombres sospechosos
    const suspiciousPatterns = [
      /\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.scr$/i, 
      /\.vbs$/i, /\.js$/i, /\.jar$/i, /\.php$/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      result.errors.push('Tipo de archivo potencialmente peligroso');
      result.isValid = false;
    }

    // Para imágenes, verificar dimensiones básicas
    if (result.fileInfo.category === 'images') {
      try {
        const dimensions = await this.getImageDimensions(file);
        if (dimensions.width > 8000 || dimensions.height > 8000) {
          result.warnings.push('Imagen muy grande, puede afectar el rendimiento');
        }
        if (dimensions.width < 50 || dimensions.height < 50) {
          result.warnings.push('Imagen muy pequeña, puede no ser útil');
        }
      } catch {
        result.warnings.push('No se pudieron verificar las dimensiones de la imagen');
      }
    }
  }

  /**
   * Obtiene dimensiones de una imagen
   */
  private static async getImageDimensions(file: File): Promise<{width: number, height: number}> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo cargar la imagen'));
      };
      
      img.src = url;
    });
  }

  /**
   * Formatea el tamaño del archivo para mostrar
   */
  private static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

// Hook para usar en componentes React
export const useFileValidator = () => {
  const validateFile = async (
    file: File, 
    category?: keyof typeof ALLOWED_MIME_TYPES
  ) => {
    return await FileValidator.validateFile(file, category);
  };

  const validateMultipleFiles = async (
    files: FileList | File[], 
    category?: keyof typeof ALLOWED_MIME_TYPES
  ) => {
    const fileArray = Array.from(files);
    const results = await Promise.all(
      fileArray.map(file => FileValidator.validateFile(file, category))
    );
    
    return {
      results,
      allValid: results.every(r => r.isValid),
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0)
    };
  };

  return { validateFile, validateMultipleFiles };
};

export { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, SIZE_LIMITS };
export default FileValidator;
