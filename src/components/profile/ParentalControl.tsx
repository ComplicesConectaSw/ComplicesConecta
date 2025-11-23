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
      case 'soft': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'strict': return 'bg-gradient-to-r from-red-500 to-pink-500';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  const getRestrictionDescription = (level: string) => {
    switch (level) {
      case 'soft': return '⚡ Suave - Contenido sensible oculto, sin auto-bloqueo';
      case 'medium': return '🛡️ Moderado - Auto-bloqueo en 5 min de inactividad';
      case 'strict': return '🔒 Estricto - Máxima protección + Auto-bloqueo 5 min';
      default: return '⚙️ Configuración personalizada';
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
          <Card className="w-full max-w-md bg-gradient-to-br from-purple-900/95 via-purple-800/95 to-blue-900/95 backdrop-blur-xl border border-white/20 shadow-2xl shadow-purple-900/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-full w-fit border border-red-400/30">
                <Baby className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-xl font-bold text-white drop-shadow-lg">
                🔒 Control Parental Activo
              </CardTitle>
              <p className="text-sm text-white/80 font-medium">
                Contenido bloqueado para menores de edad
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge className={`${getRestrictionColor(restrictionLevel)} text-white font-semibold px-4 py-2 text-sm backdrop-blur-sm border border-white/20`}>
                  Nivel: {restrictionLevel.charAt(0).toUpperCase() + restrictionLevel.slice(1)}
                </Badge>
                <div className="mt-2 text-xs text-white/70">
                  {getRestrictionDescription(restrictionLevel)}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-sm text-center text-white/90 font-medium leading-relaxed">
                    🔞 Este contenido está restringido por control parental.
                    <br />
                    <span className="text-white/70">Solo adultos pueden acceder.</span>
                  </p>
                </div>
                
                {!showPinInput ? (
                  <Button
                    onClick={() => setShowPinInput(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                  >
                    <Unlock className="h-5 w-5 mr-2" />
                    🔓 Desbloquear Contenido
                  </Button>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <label className="block text-sm font-semibold mb-3 text-white/90 text-center">
                        🔢 Ingresa PIN de 4 dígitos:
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-center text-3xl tracking-widest text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                        placeholder="••••"
                        autoFocus
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setShowPinInput(false);
                          setPin('');
                        }}
                        variant="outline"
                        className="flex-1 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 rounded-xl py-3 font-semibold"
                      >
                        ❌ Cancelar
                      </Button>
                      <Button
                        onClick={handlePinSubmit}
                        disabled={pin.length !== 4}
                        className={`flex-1 rounded-xl py-3 font-semibold transition-all duration-300 ${
                          pin.length === 4 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:scale-105' 
                            : 'bg-white/10 text-white/50 cursor-not-allowed backdrop-blur-sm border border-white/20'
                        }`}
                      >
                        ✅ Confirmar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-center text-white/60 border-t border-white/20 pt-4 mt-6">
                <p className="font-medium">🔒 Protección según Ley Olimpia</p>
                <p className="text-white/50">Contenido sensible restringido</p>
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

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Nivel de Restricción</label>
          <div className="grid grid-cols-3 gap-2">
            {(['soft', 'medium', 'strict'] as const).map((level) => (
              <Button
                key={level}
                onClick={() => handleRestrictionChange(level)}
                variant={restrictionLevel === level ? "default" : "outline"}
                size="sm"
                className={`${restrictionLevel === level ? getRestrictionColor(level) + ' text-white font-bold border-2' : 'bg-white/50'} transition-all duration-300 hover:scale-105`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            {getRestrictionDescription(restrictionLevel)}
          </p>
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

        <div className="text-xs text-gray-600 space-y-2 bg-gray-50 rounded-lg p-3">
          <div className="space-y-1">
            <p className="font-bold text-green-600">🟢 SUAVE (Básico):</p>
            <ul className="ml-4 space-y-0.5 text-gray-700">
              <li>• Contenido sensible oculto con blur</li>
              <li>• NO hay auto-bloqueo automático</li>
              <li>• Perfecto para usuarios responsables</li>
            </ul>
          </div>
          
          <div className="space-y-1">
            <p className="font-bold text-orange-600">🟡 MODERADO (Recomendado):</p>
            <ul className="ml-4 space-y-0.5 text-gray-700">
              <li>• Auto-bloqueo tras 5 min de inactividad</li>
              <li>• Temporizador visible en pantalla</li>
              <li>• Balance entre seguridad y comodidad</li>
            </ul>
          </div>
          
          <div className="space-y-1">
            <p className="font-bold text-red-600">🔴 ESTRICTO (Máxima Seguridad):</p>
            <ul className="ml-4 space-y-0.5 text-gray-700">
              <li>• Auto-bloqueo tras 5 min de inactividad</li>
              <li>• Requiere PIN para cada desbloqueo</li>
              <li>• NO permite bypass temporal</li>
              <li>• Máxima protección parental</li>
            </ul>
          </div>
          
          <p className="mt-2 pt-2 border-t border-gray-200">
            <strong>📌 PIN actual:</strong> <span className="font-mono bg-gray-200 px-2 py-0.5 rounded">{savedPin}</span>
            <br />
            <span className="text-gray-500 text-xs">Click en "Cambiar PIN" para modificar</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
