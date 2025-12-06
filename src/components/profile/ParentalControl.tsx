import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Baby, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/shared/lib/cn';
import { ThemeConfig } from '../../theme/ThemeConfig';

interface ParentalControlProps {
  isLocked: boolean;
  onToggle: (locked: boolean) => void;
  onUnlock?: () => void;
}

type RestrictionLevel = 'soft' | 'normal' | 'strict';

const LEVEL_DURATIONS: Record<RestrictionLevel, number> = {
  strict: 60,
  normal: 180,
  soft: 360,
};

const DEFAULT_PIN = '1234';

const useLazyLockTimer = (onExpire: () => void) => {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSecondsLeft(null);
  }, []);

  const start = useCallback(
    (duration: number) => {
      clear();
      setSecondsLeft(duration);
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev === null) return prev;
          if (prev <= 1) {
            clear();
            onExpire();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clear, onExpire]
  );

  useEffect(() => () => clear(), [clear]);

  return { secondsLeft, start, clear };
};

export const ParentalControl = ({ isLocked, onToggle, onUnlock }: ParentalControlProps) => {
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [restrictionLevel, setRestrictionLevel] = useState<RestrictionLevel>('strict');
  const { secondsLeft, start, clear } = useLazyLockTimer(() => {
    onToggle(true);
  });

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (isLocked) {
      clear();
      setShowPinInput(false);
      setPin('');
    }
  }, [isLocked, clear]);

  const countdownLabel = useMemo(() => {
    if (secondsLeft === null) return null;
    const minutes = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (secondsLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  const handlePinSubmit = () => {
    if (pin === DEFAULT_PIN) {
      onToggle(false);
      start(LEVEL_DURATIONS[restrictionLevel]);
      setShowPinInput(false);
      setPin('');
      if (onUnlock) onUnlock();
    } else {
      alert('PIN incorrecto');
      setPin('');
    }
  };

  const handleRestrictionChange = (level: RestrictionLevel) => {
    setRestrictionLevel(level);
    if (secondsLeft !== null) {
      start(LEVEL_DURATIONS[level]);
    }
  };

  const restrictionGradient = (level: RestrictionLevel) => {
    switch (level) {
      case 'soft':
        return cn('bg-gradient-to-r', ThemeConfig.statusGradients.soft);
      case 'normal':
        return cn('bg-gradient-to-r', ThemeConfig.statusGradients.normal);
      case 'strict':
      default:
        return cn('bg-gradient-to-r', ThemeConfig.statusGradients.strict);
    }
  };

  const getRestrictionDescription = (level: string) => {
    switch (level) {
      case 'soft': return '⚡ Suave · 360s de acceso supervisado';
      case 'normal': return '🛡️ Normal · 180s de acceso';
      case 'strict': return '🔒 Estricto · 60s antes del relock';
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
          className={cn('fixed inset-0 z-50 flex items-center justify-center p-4', ThemeConfig.blurClasses.lockedOverlay)}
        >
          <Card className="w-full max-w-md bg-gradient-to-br from-purple-900/95 via-purple-800/95 to-blue-900/95 backdrop-blur-xl border border-white/20 shadow-2xl shadow-purple-900/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full w-fit border border-red-400/30" style={{ background: 'linear-gradient(120deg, rgba(239,68,68,0.2), rgba(249,115,22,0.2))' }}>
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
                <Badge className={cn(restrictionGradient(restrictionLevel), 'text-white font-semibold px-4 py-2 text-sm backdrop-blur-sm border border-white/20')}>
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
                    className={cn(
                      'w-full text-white font-semibold py-3 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-r',
                      ThemeConfig.palette.glassGradient
                    )}
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
                        className={cn(
                          'flex-1 rounded-xl py-3 font-semibold transition-all duration-300',
                          pin.length === 4
                            ? ['bg-gradient-to-r', ThemeConfig.statusGradients.soft, 'text-white shadow-lg hover:scale-105']
                            : 'bg-white/10 text-white/50 cursor-not-allowed backdrop-blur-sm border border-white/20'
                        )}
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
    <div className={cn('w-full space-y-6 p-6 rounded-3xl shadow-2xl', ThemeConfig.blurClasses.glassPanel)}>
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Control Parental</h3>
            <p className="text-sm text-zinc-400">Gestiona la seguridad y visibilidad</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Activo
        </div>
      </div>

      {/* Temporizador de auto-bloqueo */}
      {countdownLabel && (
        <div className="flex items-center gap-2 text-sm text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
          <Clock className="h-4 w-4" />
          <span>Auto-bloqueo en: {countdownLabel}</span>
        </div>
      )}

      {/* Barra de Nivel (Selector) */}
      <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-black/60 border border-white/10">
        {(['soft', 'normal', 'strict'] as const).map((level) => {
          const label = level.charAt(0).toUpperCase() + level.slice(1);
          const tooltipText =
            level === 'soft'
              ? 'Ligero: 360 segundos antes del siguiente bloqueo.'
              : level === 'strict'
                ? 'Estricto: 60 segundos de ventana segura.'
                : 'Normal: 180 segundos balanceado.';

          return (
            <TooltipProvider key={level}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleRestrictionChange(level)}
                    className={cn(
                      'py-2 text-sm font-medium rounded-lg transition-all duration-300 w-full',
                      restrictionLevel === level
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-900/40 border border-white/20'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-white/5'
                    )}
                  >
                    {label}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs bg-black/80 border border-white/10 text-zinc-100">
                  {tooltipText}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Info del Nivel */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-purple-300 text-sm font-medium">
          <Clock className="w-4 h-4" />
          <span>Auto-bloqueo: 5 min inactividad</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Protección activa contra contenido sensible. Se requerirá PIN para acceder a galerías privadas.
        </p>
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-400/60"
          onClick={() => {
            onToggle(true);
            clear();
          }}
        >
          <Lock className="w-4 h-4 mr-2" /> Bloquear Ahora
        </Button>
        <Button
          variant="outline"
          className="border-white/20 text-zinc-200 hover:bg-white/5"
          onClick={() => alert('PIN fijo 1234 (configurable en iteraciones futuras)')}
        >
          Cambiar PIN
        </Button>
      </div>

      {/* Descripción de niveles */}
      <div className="text-xs text-zinc-300 space-y-2 bg-black/40 rounded-xl p-4 border border-white/10">
        <div className="space-y-1">
          <p className="font-bold text-green-300">🟢 SUAVE (Básico):</p>
          <ul className="ml-4 space-y-0.5 text-zinc-300">
            <li>• Contenido sensible oculto con blur</li>
            <li>• NO hay auto-bloqueo automático</li>
            <li>• Perfecto para usuarios responsables</li>
          </ul>
        </div>
        
        <div className="space-y-1">
          <p className="font-bold text-amber-300">🟡 NORMAL (Recomendado):</p>
          <ul className="ml-4 space-y-0.5 text-zinc-300">
            <li>• Auto-bloqueo tras 180 segundos</li>
            <li>• Temporizador visible en pantalla</li>
            <li>• Balance entre seguridad y comodidad</li>
          </ul>
        </div>
        
        <div className="space-y-1">
          <p className="font-bold text-red-300">🔴 ESTRICTO (Máxima Seguridad):</p>
          <ul className="ml-4 space-y-0.5 text-zinc-300">
            <li>• Auto-bloqueo tras 5 min de inactividad</li>
            <li>• Requiere PIN para cada desbloqueo</li>
            <li>• NO permite bypass temporal</li>
            <li>• Máxima protección parental</li>
          </ul>
        </div>
        
        <p className="mt-2 pt-2 border-t border-white/10">
          <strong>📌 PIN actual:</strong>{' '}
          <span className="font-mono bg-white/10 px-2 py-0.5 rounded border border-white/20">{DEFAULT_PIN}</span>
          <br />
          <span className="text-zinc-500 text-[11px]">Click en "Cambiar PIN" para modificar</span>
        </p>
      </div>
    </div>
  );
}

