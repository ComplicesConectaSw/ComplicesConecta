/**
 * Modal de Staking - Interfaz amigable para usuarios Beta
 * Explicación simple del staking con ejemplos y confirmación
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { useTokens } from '../../hooks/useTokens';
import { Lock, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StakingModal({ isOpen, onClose }: StakingModalProps) {
  const { balance, startStaking } = useTokens();
  const [amount, setAmount] = useState<string>('100');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stakingAmount = parseInt(amount) || 0;
  const rewardAmount = Math.round(stakingAmount * 0.1); // 10% reward
  const totalReturn = stakingAmount + rewardAmount;
  const maxAmount = balance?.cmpxBalance || 0;

  const handleStaking = async () => {
    if (!stakingAmount || stakingAmount < 50) {
      setError('Mínimo 50 CMPX para staking');
      return;
    }

    if (stakingAmount > maxAmount) {
      setError(`No tienes suficientes CMPX. Máximo: ${maxAmount}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await startStaking(stakingAmount);
      
      if (result) {
        onClose();
        // Mostrar mensaje de éxito (podría ser un toast)
        alert(`🎉 ¡Staking iniciado! ${stakingAmount} CMPX bloqueados por 30 días`);
      } else {
        setError('No se pudo iniciar el staking');
      }
    } catch (err) {
      setError('Error iniciando staking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            🔒 Staking - Alcancía Especial
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Explicación simple */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-700">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-semibold">¿Qué es staking?</span>
                </div>
                <p className="text-sm text-blue-600">
                  Es como una alcancía especial: guardas tus CMPX por 30 días 
                  y al final recibes un <strong>+10% de recompensa</strong>.
                </p>
                <div className="bg-white p-2 rounded border border-blue-200">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Ejemplo:</strong> Si pones 100 CMPX, en 30 días tendrás 110 CMPX
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de cantidad */}
          <div className="space-y-2">
            <Label htmlFor="staking-amount">Cantidad a poner en staking</Label>
            <div className="relative">
              <Input
                id="staking-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="50"
                max={maxAmount}
                placeholder="100"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                CMPX
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Mínimo: 50 CMPX</span>
              <span>Disponible: {maxAmount} CMPX</span>
            </div>
          </div>

          {/* Botones rápidos */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount('50')}
              disabled={maxAmount < 50}
            >
              50 CMPX
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount('100')}
              disabled={maxAmount < 100}
            >
              100 CMPX
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(maxAmount.toString())}
              disabled={maxAmount < 50}
            >
              Todo ({maxAmount})
            </Button>
          </div>

          {/* Preview de recompensas */}
          {stakingAmount >= 50 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-700">
                    <Calendar className="h-4 w-4" />
                    <span className="font-semibold">Resumen del Staking</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Cantidad inicial:</span>
                      <span className="font-semibold">{stakingAmount} CMPX</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duración:</span>
                      <span className="font-semibold">30 días</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recompensa (10%):</span>
                      <span className="font-semibold text-green-600">+{rewardAmount} CMPX</span>
                    </div>
                    <hr className="border-green-200" />
                    <div className="flex justify-between font-semibold">
                      <span>Total al finalizar:</span>
                      <span className="text-green-600">{totalReturn} CMPX</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advertencia importante */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-semibold mb-1">⚠️ Importante:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Los tokens estarán bloqueados por 30 días</li>
                    <li>• No podrás usarlos hasta que termine el período</li>
                    <li>• La recompensa se paga automáticamente al finalizar</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">❌ {error}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleStaking}
              className="flex-1"
              disabled={loading || stakingAmount < 50 || stakingAmount > maxAmount}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </div>
              ) : (
                `🔒 Iniciar Staking`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
