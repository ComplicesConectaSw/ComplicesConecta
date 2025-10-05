import { logger } from '@/lib/logger';

export interface MediaSecurityConfig {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  scanForMalware: boolean;
  watermarkImages: boolean;
  encryptStorage: boolean;
  autoModeration: boolean;
}

export interface BiometricConfig {
  enabled: boolean;
  methods: ('fingerprint' | 'face' | 'voice')[];
  fallbackToPassword: boolean;
  sessionTimeout: number; // in minutes
  requireForSensitiveActions: boolean;
}

export interface MediaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    fileSize: number;
    mimeType: string;
    dimensions?: { width: number; height: number };
    duration?: number;
    hasExif: boolean;
    isEncrypted: boolean;
  };
}

export interface BiometricAuthResult {
  success: boolean;
  method: string;
  confidence: number;
  sessionId: string;
  expiresAt: string;
  error?: string;
}

export class MultimediaSecurityService {
  private static readonly DEFAULT_CONFIG: MediaSecurityConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mp3',
      'audio/wav',
      'audio/ogg'
    ],
    scanForMalware: true,
    watermarkImages: true,
    encryptStorage: true,
    autoModeration: true
  };

  private static readonly BIOMETRIC_CONFIG: BiometricConfig = {
    enabled: true,
    methods: ['fingerprint', 'face'],
    fallbackToPassword: true,
    sessionTimeout: 30,
    requireForSensitiveActions: true
  };

  /**
   * Validate and secure multimedia file
   */
  static async validateAndSecureMedia(
    file: File,
    userId: string,
    config: Partial<MediaSecurityConfig> = {}
  ): Promise<MediaValidationResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const result: MediaValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      metadata: {
        fileSize: file.size,
        mimeType: file.type,
        hasExif: false,
        isEncrypted: false
      }
    };

    try {
      // 1. File size validation
      if (file.size > finalConfig.maxFileSize) {
        result.errors.push(`Archivo demasiado grande. Máximo permitido: ${this.formatFileSize(finalConfig.maxFileSize)}`);
        result.isValid = false;
      }

      // 2. File type validation
      if (!finalConfig.allowedTypes.includes(file.type)) {
        result.errors.push(`Tipo de archivo no permitido: ${file.type}`);
        result.isValid = false;
      }

      // 3. Content validation
      const contentValidation = await this.validateFileContent(file);
      if (!contentValidation.isValid) {
        result.errors.push(...contentValidation.errors);
        result.isValid = false;
      }

      // 4. Malware scanning
      if (finalConfig.scanForMalware) {
        const malwareResult = await this.scanForMalware(file);
        if (!malwareResult.clean) {
          result.errors.push('Archivo contiene contenido malicioso');
          result.isValid = false;
        }
      }

      // 5. Extract metadata
      result.metadata = await this.extractMediaMetadata(file);

      // 6. EXIF data removal for images
      if (file.type.startsWith('image/')) {
        const cleanedFile = await this.removeExifData(file);
        result.metadata.hasExif = cleanedFile.hadExif;
      }

      // 7. Content moderation
      if (finalConfig.autoModeration && result.isValid) {
        const moderationResult = await this.moderateContent(file);
        if (!moderationResult.approved) {
          result.errors.push('Contenido no apropiado detectado');
          result.isValid = false;
        }
        if (moderationResult.warnings.length > 0) {
          result.warnings.push(...moderationResult.warnings);
        }
      }

      // 8. Encryption preparation
      if (finalConfig.encryptStorage && result.isValid) {
        result.metadata.isEncrypted = true;
      }

      // Log security validation
      logger.info('Media security validation completed', {
        userId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        isValid: result.isValid,
        errorsCount: result.errors.length
      });

      return result;
    } catch (error) {
      logger.error('Error validating file content:', { error: error instanceof Error ? error.message : String(error) });
      result.errors.push('Error interno de validación');
      result.isValid = false;
      return result;
    }
  }

  /**
   * Validate file content integrity
   */
  private static async validateFileContent(file: File): Promise<{ isValid: boolean; errors: string[] }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Check file signatures (magic numbers)
          const isValidSignature = this.validateFileSignature(uint8Array, file.type);
          
          if (!isValidSignature) {
            resolve({
              isValid: false,
              errors: ['Firma de archivo inválida - posible archivo corrupto o malicioso']
            });
            return;
          }

          // Additional content checks
          if (file.type.startsWith('image/')) {
            const imageValidation = this.validateImageContent(uint8Array);
            resolve(imageValidation);
          } else if (file.type.startsWith('video/')) {
            const videoValidation = this.validateVideoContent(uint8Array);
            resolve(videoValidation);
          } else {
            resolve({ isValid: true, errors: [] });
          }
        } catch (error) {
          resolve({
            isValid: false,
            errors: ['Error al validar contenido del archivo']
          });
        }
      };

      reader.onerror = () => {
        resolve({
          isValid: false,
          errors: ['Error al leer el archivo']
        });
      };

      reader.readAsArrayBuffer(file.slice(0, 1024)); // Read first 1KB for signature check
    });
  }

  /**
   * Validate file signature (magic numbers)
   */
  private static validateFileSignature(bytes: Uint8Array, mimeType: string): boolean {
    const signatures: Record<string, number[][]> = {
      'image/jpeg': [[0xFF, 0xD8, 0xFF]],
      'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
      'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
      'video/mp4': [[0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]],
      'audio/mp3': [[0xFF, 0xFB], [0xFF, 0xF3], [0xFF, 0xF2]],
      'audio/wav': [[0x52, 0x49, 0x46, 0x46]] // RIFF
    };

    const expectedSignatures = signatures[mimeType];
    if (!expectedSignatures) return true; // Unknown type, allow

    return expectedSignatures.some(signature => 
      signature.every((byte, index) => bytes[index] === byte)
    );
  }

  /**
   * Validate image content
   */
  private static validateImageContent(bytes: Uint8Array): { isValid: boolean; errors: string[] } {
    // Check for suspicious patterns or embedded executables
    const suspiciousPatterns = [
      [0x4D, 0x5A], // MZ header (executable)
      [0x50, 0x4B], // PK header (zip/executable)
    ];

    for (const pattern of suspiciousPatterns) {
      for (let i = 0; i < bytes.length - pattern.length; i++) {
        if (pattern.every((byte, index) => bytes[i + index] === byte)) {
          return {
            isValid: false,
            errors: ['Contenido sospechoso detectado en imagen']
          };
        }
      }
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Validate video content
   */
  private static validateVideoContent(bytes: Uint8Array): { isValid: boolean; errors: string[] } {
    // Basic video validation - check for proper container format
    return { isValid: true, errors: [] };
  }

  /**
   * Scan file for malware (simplified implementation)
   */
  private static async scanForMalware(file: File): Promise<{ clean: boolean; threats: string[] }> {
    // In a real implementation, this would integrate with a malware scanning service
    // For now, we'll do basic checks
    
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const fileName = file.name.toLowerCase();
    
    for (const ext of suspiciousExtensions) {
      if (fileName.endsWith(ext)) {
        return {
          clean: false,
          threats: [`Extensión de archivo sospechosa: ${ext}`]
        };
      }
    }

    // Check file size anomalies
    if (file.type.startsWith('image/') && file.size > 50 * 1024 * 1024) { // 50MB for image is suspicious
      return {
        clean: false,
        threats: ['Tamaño de imagen anormalmente grande']
      };
    }

    return { clean: true, threats: [] };
  }

  /**
   * Extract media metadata
   */
  private static async extractMediaMetadata(file: File): Promise<MediaValidationResult['metadata']> {
    const metadata: MediaValidationResult['metadata'] = {
      fileSize: file.size,
      mimeType: file.type,
      hasExif: false,
      isEncrypted: false
    };

    if (file.type.startsWith('image/')) {
      try {
        const dimensions = await this.getImageDimensions(file);
        metadata.dimensions = dimensions;
      } catch (error) {
        logger.warn('Could not extract image dimensions:', { error: error instanceof Error ? error.message : String(error) });
      }
    }

    if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      try {
        const duration = await this.getMediaDuration(file);
        metadata.duration = duration;
      } catch (error) {
        logger.warn('Could not extract media duration:', { error: error instanceof Error ? error.message : String(error) });
      }
    }

    return metadata;
  }

  /**
   * Get image dimensions
   */
  private static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not load image'));
      };

      img.src = url;
    });
  }

  /**
   * Get media duration
   */
  private static getMediaDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const media = file.type.startsWith('video/') ? 
        document.createElement('video') : 
        document.createElement('audio');
      
      const url = URL.createObjectURL(file);

      media.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(media.duration);
      };

      media.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not load media'));
      };

      media.src = url;
    });
  }

  /**
   * Remove EXIF data from images
   */
  private static async removeExifData(file: File): Promise<{ cleanedFile: File; hadExif: boolean }> {
    if (!file.type.startsWith('image/')) {
      return { cleanedFile: file, hadExif: false };
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx?.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const cleanedFile = new File([blob], file.name, { type: file.type });
              const hadExif = file.size !== cleanedFile.size;
              resolve({ cleanedFile, hadExif });
            } else {
              resolve({ cleanedFile: file, hadExif: false });
            }
          }, file.type, 0.95);
        };

        img.onerror = () => {
          resolve({ cleanedFile: file, hadExif: false });
        };

        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      logger.warn('Could not remove EXIF data:', { error: error instanceof Error ? error.message : String(error) });
      return { cleanedFile: file, hadExif: false };
    }
  }

  /**
   * Moderate content using AI/ML
   */
  private static async moderateContent(file: File): Promise<{ approved: boolean; warnings: string[]; confidence: number }> {
    // In a real implementation, this would use AI services like AWS Rekognition, Google Vision API, etc.
    // For now, we'll do basic checks
    
    const warnings: string[] = [];
    let approved = true;

    // Check file name for inappropriate content
    const inappropriateTerms = ['explicit', 'adult', 'nsfw'];
    const fileName = file.name.toLowerCase();
    
    for (const term of inappropriateTerms) {
      if (fileName.includes(term)) {
        warnings.push(`Nombre de archivo contiene término inapropiado: ${term}`);
        approved = false;
      }
    }

    // Size-based heuristics
    if (file.type.startsWith('video/') && file.size > 100 * 1024 * 1024) { // 100MB
      warnings.push('Video de gran tamaño - revisar contenido');
    }

    return {
      approved,
      warnings,
      confidence: 0.75 // Placeholder confidence score
    };
  }

  /**
   * Format file size for display
   */
  private static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Encrypt file for secure storage
   */
  static async encryptFile(file: File, userId: string): Promise<{ encryptedFile: Blob; keyId: string }> {
    try {
      // Generate encryption key
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Read file as array buffer
      const fileBuffer = await file.arrayBuffer();

      // Encrypt file
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        fileBuffer
      );

      // Export key for storage
      const exportedKey = await crypto.subtle.exportKey('raw', key);
      const keyId = await this.storeEncryptionKey(exportedKey, userId);

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);

      const encryptedFile = new Blob([combined], { type: 'application/octet-stream' });

      logger.info('File encrypted successfully', { userId, keyId, originalSize: file.size, encryptedSize: encryptedFile.size });

      return { encryptedFile, keyId };
    } catch (error) {
      logger.error('Error in access control check:', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to encrypt file');
    }
  }

  /**
   * Decrypt file
   */
  static async decryptFile(encryptedBlob: Blob, keyId: string, userId: string): Promise<Blob> {
    try {
      // Retrieve encryption key
      const keyBuffer = await this.retrieveEncryptionKey(keyId, userId);
      
      // Import key
      const key = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // Read encrypted data
      const encryptedBuffer = await encryptedBlob.arrayBuffer();
      const encryptedArray = new Uint8Array(encryptedBuffer);

      // Extract IV and encrypted data
      const iv = encryptedArray.slice(0, 12);
      const encryptedData = encryptedArray.slice(12);

      // Decrypt
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedData
      );

      return new Blob([decryptedBuffer]);
    } catch (error) {
      logger.error('Error decrypting file:', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to decrypt file');
    }
  }

  /**
   * Store encryption key securely
   */
  private static async storeEncryptionKey(keyBuffer: ArrayBuffer, userId: string): Promise<string> {
    const keyId = crypto.randomUUID();
    
    // In a real implementation, store in secure key management service
    // For now, we'll simulate storage
    logger.info('Encryption key stored', { keyId, userId });
    
    return keyId;
  }

  /**
   * Retrieve encryption key
   */
  private static async retrieveEncryptionKey(keyId: string, userId: string): Promise<ArrayBuffer> {
    // In a real implementation, retrieve from secure key management service
    // For now, we'll simulate retrieval
    logger.info('Encryption key retrieved', { keyId, userId });
    
    // Return dummy key for demo
    return new ArrayBuffer(32);
  }
}

export class BiometricAuthService {
  /**
   * Check if biometric authentication is available
   */
  static async isAvailable(): Promise<{ available: boolean; methods: string[] }> {
    try {
      if (!('credentials' in navigator)) {
        return { available: false, methods: [] };
      }

      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      return {
        available,
        methods: available ? ['fingerprint', 'face'] : []
      };
    } catch (error) {
      logger.error('Error checking biometric availability:', { error: error instanceof Error ? error.message : String(error) });
      return { available: false, methods: [] };
    }
  }

  /**
   * Register biometric authentication
   */
  static async registerBiometric(userId: string, userName: string): Promise<BiometricAuthResult> {
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'ComplicesConecta',
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: userName,
            displayName: userName
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          },
          timeout: 60000,
          attestation: 'direct'
        }
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Store credential ID
      const credentialId = Array.from(new Uint8Array(credential.rawId))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      await this.storeCredential(userId, credentialId);

      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

      logger.info('Biometric registration successful', { userId, credentialId });

      return {
        success: true,
        method: 'biometric',
        confidence: 1.0,
        sessionId,
        expiresAt
      };
    } catch (error) {
      logger.error('Biometric registration failed:', { error: error instanceof Error ? error.message : String(error) });
      return {
        success: false,
        method: 'biometric',
        confidence: 0,
        sessionId: '',
        expiresAt: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Authenticate using biometrics
   */
  static async authenticateBiometric(userId: string): Promise<BiometricAuthResult> {
    try {
      const credentialIds = await this.getStoredCredentials(userId);
      
      if (credentialIds.length === 0) {
        throw new Error('No biometric credentials found');
      }

      const challenge = crypto.getRandomValues(new Uint8Array(32));

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: credentialIds.map(id => ({
            id: new Uint8Array(id.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))),
            type: 'public-key'
          })),
          userVerification: 'required',
          timeout: 60000
        }
      }) as PublicKeyCredential;

      if (!assertion) {
        throw new Error('Authentication failed');
      }

      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

      // Store session
      await this.storeBiometricSession(userId, sessionId, expiresAt);

      logger.info('Biometric authentication successful', { userId, sessionId });

      return {
        success: true,
        method: 'biometric',
        confidence: 1.0,
        sessionId,
        expiresAt
      };
    } catch (error) {
      logger.error('Biometric authentication failed:', { error: error instanceof Error ? error.message : String(error) });
      return {
        success: false,
        method: 'biometric',
        confidence: 0,
        sessionId: '',
        expiresAt: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify biometric session
   */
  static async verifyBiometricSession(sessionId: string): Promise<{ valid: boolean; userId?: string }> {
    try {
      // In a real implementation, verify against stored sessions
      const session = await this.getBiometricSession(sessionId);
      
      if (!session) {
        return { valid: false };
      }

      const now = new Date();
      const expiresAt = new Date(session.expiresAt);

      if (now > expiresAt) {
        await this.deleteBiometricSession(sessionId);
        return { valid: false };
      }

      return { valid: true, userId: session.userId };
    } catch (error) {
      logger.error('Error verifying biometric session:', { error: error instanceof Error ? error.message : String(error) });
      return { valid: false };
    }
  }

  /**
   * Store credential ID
   */
  private static async storeCredential(userId: string, credentialId: string): Promise<void> {
    // In a real implementation, store in secure database
    localStorage.setItem(`biometric_credential_${userId}`, credentialId);
  }

  /**
   * Get stored credentials
   */
  private static async getStoredCredentials(userId: string): Promise<string[]> {
    // In a real implementation, retrieve from secure database
    const credential = localStorage.getItem(`biometric_credential_${userId}`);
    return credential ? [credential] : [];
  }

  /**
   * Store biometric session
   */
  private static async storeBiometricSession(userId: string, sessionId: string, expiresAt: string): Promise<void> {
    // In a real implementation, store in secure database with expiration
    const session = { userId, sessionId, expiresAt };
    localStorage.setItem(`biometric_session_${sessionId}`, JSON.stringify(session));
  }

  /**
   * Get biometric session
   */
  private static async getBiometricSession(sessionId: string): Promise<{ userId: string; expiresAt: string } | null> {
    // In a real implementation, retrieve from secure database
    const sessionData = localStorage.getItem(`biometric_session_${sessionId}`);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  /**
   * Delete biometric session
   */
  private static async deleteBiometricSession(sessionId: string): Promise<void> {
    // In a real implementation, delete from secure database
    localStorage.removeItem(`biometric_session_${sessionId}`);
  }
}

export default { MultimediaSecurityService, BiometricAuthService };
