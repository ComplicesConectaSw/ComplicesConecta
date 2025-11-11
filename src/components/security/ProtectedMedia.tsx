import React, { useState, useEffect, useRef } from 'react';
import { Shield, Download, Eye, AlertTriangle } from 'lucide-react';
import { useSecureMedia } from '@/lib/secureMediaService';
import { useAuth } from '@/features/auth/useAuth';
import { useWatermark } from '@/components/security/DynamicWatermark';
import { logger } from '@/lib/logger';

interface ProtectedMediaProps {
  mediaPath: string;
  mediaOwnerId: string;
  mediaType: 'image' | 'video' | 'audio';
  alt?: string;
  className?: string;
  showDownloadButton?: boolean;
  watermarkText?: string;
}

export const ProtectedMedia: React.FC<ProtectedMediaProps> = ({
  mediaPath,
  mediaOwnerId,
  mediaType,
  alt = '',
  className = '',
  showDownloadButton = true,
  watermarkText
}) => {
  const { user } = useAuth();
  const { getSecureUrl, checkPermissions, logAccess } = useSecureMedia();
  const [secureUrl, setSecureUrl] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Aplicar watermark según el tipo de media
  useWatermark(imageRef as React.RefObject<HTMLElement>, {
    intensity: 'medium',
    showUserId: true,
    showTimestamp: true,
    customText: watermarkText
  });
  
  useWatermark(videoRef as React.RefObject<HTMLElement>, {
    intensity: 'medium',
    showUserId: true,
    showTimestamp: true,
    customText: watermarkText
  });

  useEffect(() => {
    loadSecureMedia();
  }, [mediaPath, mediaOwnerId, user?.id]);

  const loadSecureMedia = async () => {
    if (!user?.id) {
      logger.error('Usuario no autenticado intentando acceder a media protegida');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Verificar permisos
      const userPermissions = await checkPermissions(user.id, mediaOwnerId);
      setPermissions(userPermissions);

      if (!userPermissions.canView) {
        setError('No tienes permisos para ver este contenido');
        await logAccess(user.id, mediaPath, 'denied', 'no_view_permission');
        setLoading(false);
        return;
      }

      // Obtener URL segura
      const secureMedia = await getSecureUrl(mediaPath, user.id, mediaOwnerId, 'view');
      
      if (secureMedia) {
        setSecureUrl(secureMedia.url);
        await logAccess(user.id, mediaPath, 'view');
      } else {
        setError('Error cargando contenido multimedia');
        await logAccess(user.id, mediaPath, 'denied', 'url_generation_failed');
      }
    } catch (err) {
      logger.error('Error en ProtectedMedia:', { 
        error: err instanceof Error ? err.message : String(err),
        mediaPath 
      });
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!user?.id || !permissions?.canDownload) {
      await logAccess(user?.id || '', mediaPath, 'denied', 'no_download_permission');
      alert('No tienes permisos para descargar este contenido');
      return;
    }

    try {
      const downloadMedia = await getSecureUrl(mediaPath, user.id, mediaOwnerId, 'download');
      
      if (downloadMedia) {
        // Crear enlace temporal para descarga
        const link = document.createElement('a');
        link.href = downloadMedia.url;
        link.download = mediaPath.split('/').pop() || 'media';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        await logAccess(user.id, mediaPath, 'download');
      } else {
        alert('Error generando enlace de descarga');
      }
    } catch (err) {
      logger.error('Error en descarga:', { 
        error: err instanceof Error ? err.message : String(err),
        mediaPath 
      });
      alert('Error durante la descarga');
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    // Bloquear clic derecho en imágenes
    if (mediaType === 'image') {
      e.preventDefault();
      return false;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Bloquear teclas de captura
    if (e.key === 'PrintScreen' || 
        (e.ctrlKey && e.key === 's') || 
        (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      e.preventDefault();
      showScreenshotWarning();
    }
  };

  const showScreenshotWarning = () => {
    // Crear elementos DOM de forma segura sin innerHTML
    const warning = document.createElement('div');
    warning.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); color: white; padding: 20px; border-radius: 8px; z-index: 10000; text-align: center;';
    
    const title = document.createElement('div');
    title.textContent = '⚠️ ADVERTENCIA DE SEGURIDAD';
    title.style.cssText = 'color: #ff4444; margin-bottom: 10px;';
    
    const message = document.createElement('div');
    message.textContent = 'Las capturas de pantalla están restringidas en este contenido';
    
    warning.appendChild(title);
    warning.appendChild(message);
    document.body.appendChild(warning);
    setTimeout(() => document.body.removeChild(warning), 3000);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando contenido seguro...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-red-700">{error}</span>
      </div>
    );
  }

  const renderMedia = () => {

    switch (mediaType) {
      case 'image':
        return (
          <img
            src={secureUrl || ''}
            alt={alt}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            ref={imageRef}
            className={`max-w-full h-auto ${className}`}
            onContextMenu={handleContextMenu}
            style={{
              userSelect: 'none' as const,
              WebkitUserSelect: 'none' as const,
              MozUserSelect: 'none' as const,
              msUserSelect: 'none' as const,
              WebkitTouchCallout: 'none'
            }}
          />
        );
      
      case 'video':
        return (
          <video
            controls
            controlsList="nodownload"
            disablePictureInPicture
            ref={videoRef}
            className={`max-w-full h-auto ${className}`}
            onContextMenu={handleContextMenu}
            style={{
              userSelect: 'none' as const,
              WebkitUserSelect: 'none' as const,
              MozUserSelect: 'none' as const,
              msUserSelect: 'none' as const
            }}
          >
            <source src={secureUrl || ''} />
            Tu navegador no soporta video HTML5.
          </video>
        );
      
      case 'audio':
        return (
          <audio
            controls
            controlsList="nodownload"
            ref={audioRef}
            className={className}
            onContextMenu={handleContextMenu}
            style={{
              userSelect: 'none' as const,
              WebkitUserSelect: 'none' as const,
              MozUserSelect: 'none' as const,
              msUserSelect: 'none' as const
            }}
          >
            <source src={secureUrl || ''} />
            Tu navegador no soporta audio HTML5.
          </audio>
        );
      
      default:
        return <div>Tipo de media no soportado</div>;
    }
  };

  return (
    <div className="relative">
      {renderMedia()}
      
      {/* Controles de seguridad */}
      <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-1" />
          <span>Contenido protegido</span>
          {permissions && (
            <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
              {permissions.role === 'owner' ? 'Propietario' : 
               permissions.role === 'admin' ? 'Administrador' :
               permissions.role === 'moderator' ? 'Moderador' : 'Usuario'}
            </span>
          )}
        </div>
        
        {showDownloadButton && permissions?.canDownload && (
          <button
            onClick={handleDownload}
            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-1" />
            Descargar
          </button>
        )}
        
        {!permissions?.canDownload && (
          <div className="flex items-center text-gray-400">
            <Eye className="h-4 w-4 mr-1" />
            Solo vista
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtectedMedia;
