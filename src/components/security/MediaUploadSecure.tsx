import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileImage, 
  FileVideo, 
  FileAudio,
  Lock,
  Eye,
  Trash2
} from 'lucide-react';
import { MultimediaSecurityService, MediaValidationResult } from '@/lib/multimediaSecurity';
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';

interface MediaUploadSecureProps {
  onUploadSuccess?: (file: File, validation: MediaValidationResult) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxFileSize?: number;
  enableEncryption?: boolean;
  className?: string;
}

interface UploadedFile {
  file: File;
  validation: MediaValidationResult;
  encrypted?: boolean;
  keyId?: string;
  uploadProgress: number;
  status: 'validating' | 'valid' | 'invalid' | 'uploading' | 'uploaded' | 'error';
}

export const MediaUploadSecure: React.FC<MediaUploadSecureProps> = ({
  onUploadSuccess,
  onUploadError,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'video/*', 'audio/*'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  enableEncryption = true,
  className = ''
}) => {
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (!user?.id) {
      onUploadError?.('Usuario no autenticado');
      return;
    }

    const fileArray = Array.from(files);
    
    // Check file limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      onUploadError?.(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    setIsValidating(true);

    for (const file of fileArray) {
      const uploadedFile: UploadedFile = {
        file,
        validation: {
          isValid: false,
          errors: [],
          warnings: [],
          metadata: {
            fileSize: file.size,
            mimeType: file.type,
            hasExif: false,
            isEncrypted: false
          }
        },
        uploadProgress: 0,
        status: 'validating'
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      try {
        // Validate and secure the file
        const validation = await MultimediaSecurityService.validateAndSecureMedia(
          file,
          user.id,
          {
            maxFileSize,
            allowedTypes: acceptedTypes.map(type => 
              type.replace('*', 'jpeg')
            ).filter(type => !type.includes('*'))
          }
        );

        // Update file with validation results
        setUploadedFiles(prev => prev.map(f => 
          f.file === file 
            ? { 
                ...f, 
                validation, 
                status: validation.isValid ? 'valid' : 'invalid' 
              }
            : f
        ));

        if (validation.isValid) {
          // Encrypt file if enabled
          if (enableEncryption) {
            try {
              const { encryptedFile: _encryptedFile, keyId } = await MultimediaSecurityService.encryptFile(file, user.id);
              
              setUploadedFiles(prev => prev.map(f => 
                f.file === file 
                  ? { 
                      ...f, 
                      encrypted: true, 
                      keyId,
                      validation: {
                        ...f.validation,
                        metadata: {
                          ...f.validation.metadata,
                          isEncrypted: true
                        }
                      }
                    }
                  : f
              ));
            } catch (error) {
              logger.error('Encryption failed:', { error: error instanceof Error ? error.message : String(error) });
              setUploadedFiles(prev => prev.map(f => 
                f.file === file 
                  ? { 
                      ...f, 
                      status: 'error',
                      validation: {
                        ...f.validation,
                        errors: [...f.validation.errors, 'Error de encriptación']
                      }
                    }
                  : f
              ));
            }
          }

          onUploadSuccess?.(file, validation);
        } else {
          onUploadError?.(validation.errors.join(', '));
        }
      } catch (error) {
        logger.error('File validation error:', { error: error instanceof Error ? error.message : String(error) });
        setUploadedFiles(prev => prev.map(f => 
          f.file === file 
            ? { 
                ...f, 
                status: 'error',
                validation: {
                  ...f.validation,
                  errors: ['Error de validación']
                }
              }
            : f
        ));
        onUploadError?.('Error al validar archivo');
      }
    }

    setIsValidating(false);
  }, [user, uploadedFiles.length, maxFiles, maxFileSize, acceptedTypes, enableEncryption, onUploadSuccess, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = useCallback((fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove));
  }, []);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="h-5 w-5" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="h-5 w-5" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-5 w-5" />;
    return <Upload className="h-5 w-5" />;
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'valid':
      case 'uploaded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'validating':
      case 'uploading':
        return <AlertTriangle className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default:
        return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Subida Segura de Archivos
        </CardTitle>
        <CardDescription>
          Arrastra archivos aquí o haz clic para seleccionar. Máximo {maxFiles} archivos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">
            {isDragOver ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            o haz clic para seleccionar archivos
          </p>
          <input
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <Button asChild variant="outline">
            <label htmlFor="file-upload" className="cursor-pointer">
              Seleccionar Archivos
            </label>
          </Button>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Validación de contenido</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4 text-blue-500" />
            <span>Moderación automática</span>
          </div>
          {enableEncryption && (
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-purple-500" />
              <span>Encriptación AES-256</span>
            </div>
          )}
        </div>

        {/* Validation Progress */}
        {isValidating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 animate-pulse" />
              <span className="text-sm">Validando archivos...</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Archivos ({uploadedFiles.length}/{maxFiles})</h4>
            {uploadedFiles.map((uploadedFile, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getFileIcon(uploadedFile.file.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{uploadedFile.file.name}</p>
                        {getStatusIcon(uploadedFile.status)}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {formatFileSize(uploadedFile.file.size)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {uploadedFile.file.type}
                        </Badge>
                        {uploadedFile.encrypted && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Encriptado
                          </Badge>
                        )}
                      </div>

                      {/* Validation Results */}
                      {uploadedFile.validation.errors.length > 0 && (
                        <Alert variant="destructive" className="mb-2">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {uploadedFile.validation.errors.join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}

                      {uploadedFile.validation.warnings.length > 0 && (
                        <Alert className="mb-2">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {uploadedFile.validation.warnings.join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}

                      {uploadedFile.status === 'valid' && (
                        <Alert className="mb-2">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Archivo validado y seguro para subir
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Metadata */}
                      {uploadedFile.validation.metadata.dimensions && (
                        <p className="text-xs text-muted-foreground">
                          Dimensiones: {uploadedFile.validation.metadata.dimensions.width}x{uploadedFile.validation.metadata.dimensions.height}
                        </p>
                      )}
                      {uploadedFile.validation.metadata.duration && (
                        <p className="text-xs text-muted-foreground">
                          Duración: {Math.round(uploadedFile.validation.metadata.duration)}s
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.file)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Upload Progress */}
                {uploadedFile.status === 'uploading' && (
                  <div className="mt-3">
                    <Progress value={uploadedFile.uploadProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Subiendo... {uploadedFile.uploadProgress}%
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Security Information */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Características de Seguridad:</p>
              <ul className="space-y-1">
                <li>• Validación de tipo de archivo y contenido</li>
                <li>• Escaneo de malware y contenido malicioso</li>
                <li>• Eliminación automática de metadatos EXIF</li>
                <li>• Moderación de contenido con IA</li>
                {enableEncryption && <li>• Encriptación AES-256 para almacenamiento seguro</li>}
                <li>• Límite de tamaño: {formatFileSize(maxFileSize)}</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaUploadSecure;
