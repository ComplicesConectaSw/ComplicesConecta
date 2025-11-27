/**
 * WalletConsentInjection.tsx - Inyección de Consentimiento en Wallet
 * 
 * Propósito: Mostrar alerta de "Saldo Digital No Reembolsable" en wallet
 * Autor: Lead Architect & Legal Tech
 * Versión: v3.7.2 - Legal Tech Implementation
 * Fecha: 21 Noviembre 2025
 */

import React, { useState, useEffect } from 'react';
// Icons removed as they are not used in this component
import ConsentGuard from '@/shared/ui/ConsentGuard';
import ConsentService from '@/services/legal/ConsentService';
import { logger } from '@/lib/logger';

interface WalletConsentInjectionProps {
  userId: string;
  onConsentComplete?: () => void;
  children: React.ReactNode;
}

export const WalletConsentInjection: React.FC<WalletConsentInjectionProps> = ({
  userId,
  onConsentComplete,
  children
}) => {
  const [needsConsent, setNeedsConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkWalletConsent = async () => {
      try {
        const hasConsent = await ConsentService.hasActiveConsent(
          userId,
          'docs/legal/WALLET_RISK_DISCLOSURE.md',
          'WALLET_RISK'
        );

        setNeedsConsent(!hasConsent);
        
      } catch (error) {
        logger.error('Error verificando consentimiento de wallet', { error });
        setNeedsConsent(true); // Por seguridad, mostrar consentimiento si hay error
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      checkWalletConsent();
    }
  }, [userId]);

  const handleConsentComplete = (consentId: string) => {
    logger.info('Consentimiento de wallet completado', { consentId, userId });
    setNeedsConsent(false);
    onConsentComplete?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Verificando permisos...</span>
      </div>
    );
  }

  if (needsConsent) {
    return (
      <ConsentGuard
        docPath="docs/legal/WALLET_RISK_DISCLOSURE.md"
        consentType="WALLET_RISK"
        title="⚠️ Saldo Digital No Reembolsable"
        summary={[
          "Los tokens CMPX y GTK son activos digitales virtuales sin valor monetario garantizado",
          "No son reembolsables ni convertibles a dinero real bajo ninguna circunstancia",
          "Su valor depende exclusivamente del ecosistema de la plataforma ComplicesConecta",
          "La plataforma no garantiza la permanencia o disponibilidad perpetua de los tokens",
          "Al usar el wallet, aceptas estos riesgos y renuncias a reclamaciones monetarias"
        ]}
        onConsent={handleConsentComplete}
        variant="banner"
        required={true}
        expirationDays={90} // Renovar cada 3 meses
      />
    );
  }

  return <>{children}</>;
};

export default WalletConsentInjection;
