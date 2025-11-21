import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Baby, Clock, Shield, Settings } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/components/ui/badge';

interface ParentalControlProps {
  isLocked: boolean;
  onToggle: (locked: boolean) => void;
  onUnlock?: () => void;
}

export const ParentalControl = ({ isLocked, onToggle, onUnlock }: ParentalControlProps) => {
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState(localStorage.getItem('parentalPin') || '1234');
  const [_autoLockTimer, _setAutoLockTimer] = useState<NodeJS.Timeout | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [restrictionLevel, setRestrictionLevel] = useState<'soft' | 'medium' | 'strict'>(
    (localStorage.getItem('restrictionLevel') as any) || 'medium'
  );

  // Auto-lock después de 5 minutos de inactividad
  const AUTO_LOCK_TIME = 5 * 60 * 1000; // 5 minutos

  useEffect(() => {
    if (!isLocked && restrictionLevel !== 'soft') {
      // Iniciar timer de auto-lock
      const timer = setTimeout(() => {
        onToggle(true);
        setTimeRemaining(0);
      }, AUTO_LOCK_TIME);
      
      _setAutoLockTimer(timer);
      setTimeRemaining(AUTO_LOCK_TIME);

      // Countdown timer
      const countdown = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdown);
      };
    }
  }, [isLocked, restrictionLevel, onToggle]);

  const handlePinSubmit = () => {
    if (pin === savedPin) {
      onToggle(false);
      setShowPinInput(false);
      setPin('');
      if (onUnlock) onUnlock();
    } else {
      alert('PIN incorrecto');
      setPin('');
    }
  };

  const handlePinChange = (newPin: string) => {
    setSavedPin(newPin);
    localStorage.setItem('parentalPin', newPin);
  };

  const handleRestrictionChange = (level: 'soft' | 'medium' | 'strict') => {
    setRestrictionLevel(level);
    localStorage.setItem('restrictionLevel', level);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRestrictionColor = (level: string) => {
    switch (level) {
      case 'soft': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'strict': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLocked) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <Card className="w-full max-w-md bg-white/95 backdrop-blur border-2 border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <Baby className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold text-red-700">
                Control Parental Activo
              </CardTitle>
              <p className="text-sm text-gray-600">
                Contenido bloqueado para menores de edad
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${getRestrictionColor(restrictionLevel)} text-white`}>
                  Nivel: {restrictionLevel.charAt(0).toUpperCase() + restrictionLevel.slice(1)}
                </Badge>
              </div>

              {!showPinInput ? (
                <div className="space-y-4">
                  <p className="text-sm text-center text-gray-700">
                    Este contenido está restringido por control parental.
                    Solo adultos pueden acceder.
                  </p>
                  
                  <Button
                    onClick={() => setShowPinInput(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    Desbloquear con PIN
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ingresa PIN de 4 dígitos:
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full p-3 border rounded-lg text-center text-2xl tracking-widest"
                      placeholder="••••"
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setShowPinInput(false);
                        setPin('');
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handlePinSubmit}
                      disabled={pin.length !== 4}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Confirmar
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-xs text-center text-gray-500 border-t pt-3">
                <p>🔒 Protección según Ley Olimpia</p>
                <p>Contenido sensible restringido</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Panel de configuración cuando está desbloqueado
  return (
    <Card className="mb-4 border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg text-green-700">
              Control Parental
            </CardTitle>
          </div>
          <Badge className="bg-green-500 text-white">
            Desbloqueado
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {timeRemaining > 0 && restrictionLevel !== 'soft' && (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
            <Clock className="h-4 w-4" />
            <span>Auto-bloqueo en: {formatTime(timeRemaining)}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {(['soft', 'medium', 'strict'] as const).map((level) => (
            <Button
              key={level}
              onClick={() => handleRestrictionChange(level)}
              variant={restrictionLevel === level ? "default" : "outline"}
              size="sm"
              className={restrictionLevel === level ? getRestrictionColor(level) : ''}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onToggle(true)}
            variant="outline"
            size="sm"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
          >
            <Lock className="h-4 w-4 mr-1" />
            Bloquear Ahora
          </Button>
          
          <Button
            onClick={() => {
              const newPin = prompt('Nuevo PIN (4 dígitos):', savedPin);
              if (newPin && newPin.length === 4 && /^\d+$/.test(newPin)) {
                handlePinChange(newPin);
                alert('PIN actualizado');
              }
            }}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Settings className="h-4 w-4 mr-1" />
            Cambiar PIN
          </Button>
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Soft:</strong> Sin auto-bloqueo</p>
          <p><strong>Medium:</strong> Auto-bloqueo 5min</p>
          <p><strong>Strict:</strong> Auto-bloqueo 5min + restricciones</p>
        </div>
      </CardContent>
    </Card>
  );
};
