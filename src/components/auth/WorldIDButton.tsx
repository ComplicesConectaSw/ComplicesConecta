// ✅ AUTO-FIX aplicado por Auditoría ComplicesConecta v2.1.2
// Fecha: 2025-01-06

import React, { useState } from 'react';
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit'
import { Button } from "@/shared/ui/Button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/features/auth/useAuth"
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Loader2, Globe, Shield } from 'lucide-react';
import { logger } from '@/lib/logger';

interface WorldIDButtonProps {
  onSuccess?: (result: ISuccessResult) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  invitedBy?: string;
}

interface WorldIDVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    user_id: string;
    worldid_verified: boolean;
    verification_level: string;
    rewards: {
      worldid_reward: number;
      referral_reward: number;
      total: number;
    };
  };
  error?: string;
}

export const WorldIDButton: React.FC<WorldIDButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  variant = 'default',
  size = 'default',
  className = '',
  invitedBy
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleVerify = async (proof: ISuccessResult) => {
    if (!user?.id) {
      toast({
        title: "Error de Autenticación",
        description: "Debes estar autenticado para verificar con World ID",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      if (!supabase) {
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con el servidor",
          variant: "destructive"
        });
        setIsVerifying(false);
        return;
      }
      
      // Call our Edge Function for World ID verification
      const { data, error } = await supabase.functions.invoke('worldid-verify', {
        body: {
          proof: {
            merkle_root: proof.merkle_root,
            nullifier_hash: proof.nullifier_hash,
            proof: proof.proof,
            verification_level: proof.verification_level,
            action: import.meta.env.VITE_WORLD_APP_ACTION || 'verify-human',
            signal: user.id
          },
          user_id: user.id,
          invited_by: invitedBy
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const response: WorldIDVerificationResponse = data;

      if (response.success) {
        setIsVerified(true);
        
        toast({
          title: "🎉 Verificación Exitosa",
          description: `Has recibido ${response.data?.rewards.total || 0} CMPX por verificarte con World ID`,
          variant: "default"
        });

        onSuccess?.(proof);
      } else {
        throw new Error(response.message || 'Verificación fallida');
      }

    } catch (error) {
      logger.error('World ID verification error:', { error: error instanceof Error ? error.message : String(error) });
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      toast({
        title: "Error de Verificación",
        description: errorMessage,
        variant: "destructive"
      });

      onError?.(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleError = (error: { code?: string; message?: string; detail?: string } | string | unknown) => {
    logger.error('World ID widget error:', { error: typeof error === 'object' ? JSON.stringify(error) : String(error) });
    
    let errorMessage = 'Error en la verificación con World ID';
    
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const errorObj = error as { code?: string; message?: string; detail?: string };
      if (errorObj.code === 'verification_rejected') {
        errorMessage = 'Verificación rechazada por el usuario';
      } else if (errorObj.code === 'already_verified') {
        errorMessage = 'Esta identidad ya ha sido verificada';
      }
    }

    toast({
      title: "Error de World ID",
      description: errorMessage,
      variant: "destructive"
    });

    onError?.(errorMessage);
  };

  if (isVerified) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={`bg-green-50 border-green-200 text-green-700 hover:bg-green-50 ${className}`}
      >
        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="text-xs sm:text-sm">Verificado con World ID</span>
        <Badge variant="secondary" className="ml-1 sm:ml-2 bg-green-100 text-green-800 text-xs">
          ✓
        </Badge>
      </Button>
    );
  }

  return (
    <IDKitWidget
      app_id={import.meta.env.VITE_WORLD_APP_ID || ""}
      action={import.meta.env.VITE_WORLD_APP_ACTION || "verify-human"}
      verification_level={VerificationLevel.Orb}
      handleVerify={handleVerify}
      onError={handleError}
    >
      {({ open }: { open: () => void }) => (
        <Button
          onClick={open}
          disabled={disabled || isVerifying || !user}
          variant={variant}
          size={size}
          className={`relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white border-0 ${className}`}
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
              <span className="text-xs sm:text-sm">Verificando...</span>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Verificar con World ID</span>
              </div>
              <Badge 
                variant="secondary" 
                className="ml-2 bg-white/20 text-white border-white/30"
              >
                +100 CMPX
              </Badge>
            </>
          )}
          
          {/* Glassmorphism effect */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </Button>
      )}
    </IDKitWidget>
  );
};

export default WorldIDButton;
