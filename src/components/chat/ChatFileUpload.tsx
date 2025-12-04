/**
 * =====================================================
 * CHAT FILE UPLOAD
 * =====================================================
 * Componente para subir archivos en el chat
 * Features: Drag & drop, preview, validación
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image as ImageIcon, Film, Music, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { logger } from '@/lib/logger';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onCancel?: () => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

interface FilePreview {
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
}

const FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

const getFileType = (mimeType: string): FilePreview['type'] => {
  if (FILE_TYPES.image.includes(mimeType)) return 'image';
  if (FILE_TYPES.video.includes(mimeType)) return 'video';
  if (FILE_TYPES.audio.includes(mimeType)) return 'audio';
  if (FILE_TYPES.document.includes(mimeType)) return 'document';
  return 'other';
};

const getFileIcon = (type: FilePreview['type']) => {
  switch (type) {
    case 'image': return <ImageIcon className="h-8 w-8" />;
    case 'video': return <Film className="h-8 w-8" />;
    case 'audio': return <Music className="h-8 w-8" />;
    case 'document': return <FileText className="h-8 w-8" />;
    default: return <File className="h-8 w-8" />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const ChatFileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onCancel,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = [...FILE_TYPES.image, ...FILE_TYPES.video, ...FILE_TYPES.audio, ...FILE_TYPES.document],
  className = ''
}) => {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validar archivo
   */
  const validateFile = (file: File): string | null => {
    // Validar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo "${file.name}" excede el tamaño máximo de ${maxSizeMB}MB`;
    }

    // Validar tipo
    if (!acceptedTypes.includes(file.type)) {
      return `El tipo de archivo "${file.type}" no está permitido`;
    }

    return null;
  };

  /**
   * Procesar archivos
   */
  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    
    // Validar número de archivos
    if (files.length + filesArray.length > maxFiles) {
      setError(`Solo puedes subir hasta ${maxFiles} archivos a la vez`);
      return;
    }

    const newPreviews: FilePreview[] = [];
    let hasError = false;

    for (const file of filesArray) {
      // Validar archivo
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        hasError = true;
        break;
      }

      const fileType = getFileType(file.type);
      const preview: FilePreview = {
        file,
        type: fileType
      };

      // Generar preview para imágenes
      if (fileType === 'image') {
        try {
          const previewUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          preview.preview = previewUrl;
        } catch (err) {
          logger.error('[ChatFileUpload] Error generating preview:', { error: err });
        }
      }

      newPreviews.push(preview);
    }

    if (!hasError) {
      setFiles(prev => [...prev, ...newPreviews]);
      setError('');
    }
  }, [files.length, maxFiles, maxSizeMB, acceptedTypes]);

  /**
   * Handle file input change
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  /**
   * Handle drag events
   */
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  /**
   * Remover archivo
   */
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError('');
  };

  /**
   * Subir archivos
   */
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const fileObjects = files.map(f => f.file);
      await onFileSelect(fileObjects);
      setFiles([]);
      setError('');
    } catch (err) {
      logger.error('[ChatFileUpload] Upload error:', { error: err });
      setError('Error al subir los archivos. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Subir Archivos
        </h3>
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <Upload className={`h-12 w-12 mx-auto mb-3 ${isDragging ? 'text-purple-500' : 'text-gray-400'}`} />
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic'}
        </p>
        <p className="text-xs text-gray-500">
          Máximo {maxFiles} archivos, {maxSizeMB}MB cada uno
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Seleccionar archivos"
        />
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}

      {/* File Previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2 max-h-60 overflow-y-auto"
          >
            {files.map((filePreview, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                {/* Preview/Icon */}
                <div className="flex-shrink-0">
                  {filePreview.preview ? (
                    <img
                      src={filePreview.preview}
                      alt={filePreview.file.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 flex items-center justify-center text-gray-400">
                      {getFileIcon(filePreview.type)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {filePreview.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(filePreview.file.size)}
                  </p>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {files.length > 0 && (
        <div className="mt-4 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setFiles([])}
            disabled={uploading}
          >
            Limpiar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="min-w-24"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              `Enviar (${files.length})`
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default ChatFileUpload;

