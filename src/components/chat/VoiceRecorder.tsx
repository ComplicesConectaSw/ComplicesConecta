/**
 * =====================================================
 * VOICE RECORDER
 * =====================================================
 * Grabador de mensajes de voz para el chat
 * Features: Grabar, pausar, vista de onda, enviar
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { logger } from '@/lib/logger';

interface VoiceRecorderProps {
  onAudioReady: (blob: Blob, duration: number) => void;
  onCancel?: () => void;
  maxDuration?: number; // en segundos
  className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAudioReady,
  onCancel,
  maxDuration = 120, // 2 minutos por defecto
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Formatear duración
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Iniciar grabación
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Detener tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setError('');

      // Iniciar timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      logger.error('[VoiceRecorder] Error starting recording:', { error: err });
      setError('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  /**
   * Pausar/reanudar grabación
   */
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  /**
   * Detener grabación
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
    setIsPaused(false);
  };

  /**
   * Cancelar y limpiar
   */
  const handleCancel = () => {
    stopRecording();
    setDuration(0);
    setAudioBlob(null);
    setAudioUrl('');
    chunksRef.current = [];
    onCancel?.();
  };

  /**
   * Enviar audio
   */
  const handleSend = () => {
    if (audioBlob) {
      onAudioReady(audioBlob, duration);
      handleCancel();
    }
  };

  /**
   * Toggle play/pause de audio
   */
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  /**
   * Cleanup al desmontar
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mic className={`h-5 w-5 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mensaje de Voz
          </h3>
        </div>
        <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
          {formatDuration(duration)} / {formatDuration(maxDuration)}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Waveform Visualization (simulado) */}
      <div className="mb-4 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center gap-1 p-4">
        {isRecording ? (
          Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-purple-500 rounded-full"
              animate={{
                height: [
                  Math.random() * 40 + 10,
                  Math.random() * 60 + 10,
                  Math.random() * 40 + 10
                ]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.05
              }}
            />
          ))
        ) : audioBlob ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Grabación completada
            </p>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayback}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Escuchar
                </>
              )}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            Presiona el botón de grabar para iniciar
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        {!audioBlob ? (
          <>
            {/* Recording controls */}
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Grabar
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={togglePause}
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Continuar
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={stopRecording}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Detener
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <>
            {/* Playback controls */}
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
            <Button
              onClick={handleSend}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </>
        )}
      </div>

      {/* Info */}
      <p className="mt-3 text-xs text-gray-500 text-center">
        {isRecording
          ? isPaused
            ? 'Grabación pausada'
            : 'Grabando...'
          : audioBlob
          ? 'Escucha tu mensaje antes de enviar'
          : 'Máximo 2 minutos de grabación'}
      </p>
    </motion.div>
  );
};

export default VoiceRecorder;
