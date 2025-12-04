/**
 * ConsentGuard.tsx - Sistema de Consentimiento Informado por Capas
 * 
 * Propósito: Mostrar consentimientos dinámicos con evidencia legal
 * Autor: Lead Architect & Legal Tech
 * Versión: v3.7.2 - Legal Tech Implementation
 * Fecha: 21 Noviembre 2025
 * 
 * Características:
 * - Carga dinámica de documentos desde @docs/
 * - Captura de IP y timestamp para evidencia legal
 * - Hash del contenido para integridad
 * - UI/UX optimizada para conversión
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, FileText, Shield, ExternalLink, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/useAuth';
import { logger } from '@/lib/logger';

interface ConsentGuardProps {
  /** Ruta al documento en @docs/ (ej: 'docs/legal/TERMS_OF_SERVICE.md') */
  docPath: string;
  
  /** Tipo de consentimiento para categorización */
  consentType: 'TERMS' | 'PRIVACY' | 'LEY_OLIMPIA' | 'WALLET_RISK' | 'COUPLE_AGREEMENT';
  
  /** Título del consentimiento */
  title: string;
  
  /** Resumen en bullets para mostrar */
  summary: string[];
  
  /** Callback cuando se otorga el consentimiento */
  onConsent: (consentId: string) => void;
  
  /** Callback cuando se rechaza */
  onReject?: () => void;
  
  /** Si es obligatorio para continuar */
  required?: boolean;
  
  /** Estilo del componente */
  variant?: 'modal' | 'inline' | 'banner';
  
  /** Duración del consentimiento (null = permanente) */
  expirationDays?: number | null;
}

interface ConsentData {
  id: string;
  isActive: boolean;
  consentedAt: string;
  expiresAt: string | null;
}

export const ConsentGuard: React.FC<ConsentGuardProps> = ({
  docPath,
  consentType,
  title,
  summary,
  onConsent,
  onReject,
  required = true,
  variant = 'modal',
  expirationDays = null
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showFullDoc, setShowFullDoc] = useState(false);
  const [userIP, setUserIP] = useState<string>('');
  const [_consentData, setConsentData] = useState<ConsentData | null>(null);

  // Obtener IP del usuario para evidencia legal
  useEffect(() => {
    const getUserIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setUserIP(data.ip);
      } catch (error) {
        logger.warn('No se pudo obtener IP del usuario', { error });
        setUserIP('unknown');
      }
    };

    getUserIP();
  }, []);

  // Verificar si el usuario ya tiene consentimiento activo
  useEffect(() => {
    const checkExistingConsent = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase!
          .from('user_consents')
          .select('id, is_active, consented_at, expires_at')
          .eq('user_id', user.id)
          .eq('document_path', docPath)
          .eq('consent_type', consentType)
          .eq('is_active', true)
          .order('consented_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          logger.error('Error verificando consentimiento existente', { error });
          return;
        }

        if (data) {
          // Verificar si no ha expirado
          const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
          
          if (!isExpired) {
            setHasConsent(true);
            setConsentData(data);
            logger.info('Consentimiento existente encontrado', { 
              consentId: data.id, 
              type: consentType 
            });
          }
        }
      } catch (error) {
        logger.error('Error verificando consentimiento', { error });
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingConsent();
  }, [user, docPath, consentType]);

  // Generar hash del contenido para integridad
  const generateContentHash = async (content: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Manejar aceptación del consentimiento
  const handleAccept = async () => {
    if (!user || !userIP) return;

    setIsAccepting(true);

    try {
      // Crear texto completo del consentimiento
      const consentText = `${title}\n\nResumen:\n${summary.join('\n')}\n\nDocumento: ${docPath}`;
      const contentHash = await generateContentHash(consentText);

      // Calcular fecha de expiración
      const expiresAt = expirationDays 
        ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Guardar consentimiento en la base de datos
      const { data, error } = await supabase!
        .from('user_consents')
        .insert({
          user_id: user.id,
          document_path: docPath,
          consent_type: consentType,
          ip_address: userIP,
          user_agent: navigator.userAgent,
          consent_text_hash: contentHash,
          expires_at: expiresAt,
          version: '1.0'
        })
        .select('id')
        .single();

      if (error) {
        logger.error('Error guardando consentimiento', { error });
        throw error;
      }

      logger.info('Consentimiento guardado exitosamente', {
        consentId: data.id,
        type: consentType,
        ip: userIP,
        hash: contentHash
      });

      setHasConsent(true);
      onConsent(data.id);

    } catch (error) {
      logger.error('Error procesando consentimiento', { error });
      alert('Error al procesar el consentimiento. Por favor, intenta de nuevo.');
    } finally {
      setIsAccepting(false);
    }
  };

  // Manejar rechazo
  const handleReject = () => {
    logger.info('Consentimiento rechazado', { type: consentType, docPath });
    onReject?.();
  };

  // Si está cargando
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Verificando consentimientos...</span>
      </div>
    );
  }

  // Si ya tiene consentimiento activo, no mostrar nada
  if (hasConsent) {
    return null;
  }

  // Determinar icono según el tipo
  const getIcon = () => {
    switch (consentType) {
      case 'LEY_OLIMPIA': return <Shield className="h-6 w-6 text-red-500" />;
      case 'WALLET_RISK': return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'COUPLE_AGREEMENT': return <FileText className="h-6 w-6 text-purple-500" />;
      default: return <FileText className="h-6 w-6 text-blue-500" />;
    }
  };

  // Determinar color del tema según el tipo
  const getThemeColors = () => {
    switch (consentType) {
      case 'LEY_OLIMPIA': return 'border-red-200 bg-red-50';
      case 'WALLET_RISK': return 'border-yellow-200 bg-yellow-50';
      case 'COUPLE_AGREEMENT': return 'border-purple-200 bg-purple-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  // Renderizar según variante
  const renderContent = () => (
    <div className={`rounded-lg border-2 p-6 ${getThemeColors()}`}>
      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        {getIcon()}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          {required && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Obligatorio
            </span>
          )}
        </div>
      </div>

      {/* Resumen en bullets */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Resumen del consentimiento:</h4>
        <ul className="space-y-2">
          {summary.map((item, index) => (
            <li key={index} className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Link al documento completo */}
      <div className="mb-6">
        <button
          onClick={() => setShowFullDoc(!showFullDoc)}
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Ver documento completo</span>
        </button>
        
        {showFullDoc && (
          <div className="mt-3 p-4 bg-white rounded border text-sm text-gray-600">
            <p>📄 <strong>Documento:</strong> {docPath}</p>
            <p>🔗 <strong>Ubicación:</strong> GitHub Repository → {docPath}</p>
            <p>⚖️ <strong>Evidencia Legal:</strong> IP, timestamp y hash serán registrados</p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-4">
        <button
          onClick={handleAccept}
          disabled={isAccepting}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {isAccepting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Procesando...
            </span>
          ) : (
            'Acepto y Consiento'
          )}
        </button>

        {!required && (
          <button
            onClick={handleReject}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Rechazar
          </button>
        )}
      </div>

      {/* Nota legal */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          🛡️ <strong>Protección Legal:</strong> Este consentimiento será registrado con tu IP ({userIP || 'obteniendo...'}), 
          timestamp y hash del contenido para evidencia legal según la normativa aplicable.
        </p>
      </div>
    </div>
  );

  // Renderizar según variante
  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="sticky top-0 z-40 shadow-lg">
        {renderContent()}
      </div>
    );
  }

  // variant === 'inline'
  return renderContent();
};

export default ConsentGuard;
