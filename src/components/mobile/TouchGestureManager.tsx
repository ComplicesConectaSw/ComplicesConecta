/**
 * Gestor de gestos táctiles para mejoras mobile-first
 * Implementa swipe, pinch, drag y otros gestos nativos móviles
 */

import React, { useRef, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

interface PinchGesture {
  scale: number;
  center: { x: number; y: number };
}

interface TouchGestureCallbacks {
  onSwipe?: (gesture: SwipeGesture) => void;
  onPinch?: (gesture: PinchGesture) => void;
  onTap?: (point: TouchPoint) => void;
  onDoubleTap?: (point: TouchPoint) => void;
  onLongPress?: (point: TouchPoint) => void;
  onDragStart?: (point: TouchPoint) => void;
  onDrag?: (point: TouchPoint, delta: { x: number; y: number }) => void;
  onDragEnd?: (point: TouchPoint) => void;
}

interface TouchGestureConfig {
  swipeThreshold: number;      // Distancia mínima para swipe
  swipeVelocityThreshold: number; // Velocidad mínima para swipe
  longPressDelay: number;      // Tiempo para long press
  doubleTapDelay: number;      // Tiempo máximo entre taps
  pinchThreshold: number;      // Cambio mínimo de escala para pinch
}

const DEFAULT_CONFIG: TouchGestureConfig = {
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.3,
  longPressDelay: 500,
  doubleTapDelay: 300,
  pinchThreshold: 0.1
};

export class TouchGestureManager {
  private element: HTMLElement;
  private config: TouchGestureConfig;
  private callbacks: TouchGestureCallbacks;
  
  // Estado de gestos
  private touchStart: TouchPoint | null = null;
  private touchCurrent: TouchPoint | null = null;
  private lastTap: TouchPoint | null = null;
  private longPressTimer: NodeJS.Timeout | null = null;
  private isDragging = false;
  private initialDistance = 0;
  private currentScale = 1;

  constructor(
    element: HTMLElement,
    callbacks: TouchGestureCallbacks,
    config: Partial<TouchGestureConfig> = {}
  ) {
    this.element = element;
    this.callbacks = callbacks;
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    this.bindEvents();
    
    logger.info('👆 TouchGestureManager inicializado', {
      element: element.tagName,
      callbacks: Object.keys(callbacks)
    });
  }

  private bindEvents(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel, { passive: false });
  }

  private unbindEvents(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);
  }

  private getTouchPoint(touch: Touch): TouchPoint {
    return {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getCenter(touch1: Touch, touch2: Touch): { x: number; y: number } {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }

  private handleTouchStart = (event: TouchEvent): void => {
    const touches = event.touches;
    
    if (touches.length === 1) {
      // Gesto con un dedo
      this.touchStart = this.getTouchPoint(touches[0]);
      this.touchCurrent = this.touchStart;
      
      // Iniciar timer para long press
      if (this.callbacks.onLongPress) {
        this.longPressTimer = setTimeout(() => {
          if (this.touchStart && !this.isDragging) {
            this.callbacks.onLongPress!(this.touchStart);
            logger.info('👆 Long press detectado');
          }
        }, this.config.longPressDelay);
      }
      
    } else if (touches.length === 2) {
      // Gesto con dos dedos (pinch)
      this.initialDistance = this.getDistance(touches[0], touches[1]);
      this.currentScale = 1;
      this.clearLongPressTimer();
    }
  };

  private handleTouchMove = (event: TouchEvent): void => {
    event.preventDefault(); // Prevenir scroll por defecto
    
    const touches = event.touches;
    
    if (touches.length === 1 && this.touchStart) {
      // Movimiento con un dedo
      const currentPoint = this.getTouchPoint(touches[0]);
      const delta = {
        x: currentPoint.x - this.touchCurrent!.x,
        y: currentPoint.y - this.touchCurrent!.y
      };
      
      this.touchCurrent = currentPoint;
      
      // Detectar inicio de drag
      if (!this.isDragging) {
        const totalDistance = Math.sqrt(
          Math.pow(currentPoint.x - this.touchStart.x, 2) +
          Math.pow(currentPoint.y - this.touchStart.y, 2)
        );
        
        if (totalDistance > 10) { // Threshold para iniciar drag
          this.isDragging = true;
          this.clearLongPressTimer();
          
          if (this.callbacks.onDragStart) {
            this.callbacks.onDragStart(this.touchStart);
          }
        }
      }
      
      // Continuar drag
      if (this.isDragging && this.callbacks.onDrag) {
        this.callbacks.onDrag(currentPoint, delta);
      }
      
    } else if (touches.length === 2 && this.callbacks.onPinch) {
      // Gesto pinch
      const currentDistance = this.getDistance(touches[0], touches[1]);
      const scale = currentDistance / this.initialDistance;
      
      if (Math.abs(scale - this.currentScale) > this.config.pinchThreshold) {
        const center = this.getCenter(touches[0], touches[1]);
        
        this.callbacks.onPinch({
          scale,
          center
        });
        
        this.currentScale = scale;
      }
    }
  };

  private handleTouchEnd = (_event: TouchEvent): void => {
    if (this.isDragging) {
      // Finalizar drag
      if (this.callbacks.onDragEnd && this.touchCurrent) {
        this.callbacks.onDragEnd(this.touchCurrent);
      }
      this.isDragging = false;
      
    } else if (this.touchStart && this.touchCurrent) {
      // Detectar tap, double tap o swipe
      const distance = Math.sqrt(
        Math.pow(this.touchCurrent.x - this.touchStart.x, 2) +
        Math.pow(this.touchCurrent.y - this.touchStart.y, 2)
      );
      
      const duration = this.touchCurrent.timestamp - this.touchStart.timestamp;
      
      if (distance >= this.config.swipeThreshold) {
        // Es un swipe
        this.handleSwipe(this.touchStart, this.touchCurrent, duration);
      } else {
        // Es un tap
        this.handleTap(this.touchStart);
      }
    }
    
    this.clearLongPressTimer();
    this.resetTouchState();
  };

  private handleTouchCancel = (): void => {
    this.clearLongPressTimer();
    this.resetTouchState();
  };

  private handleSwipe(start: TouchPoint, end: TouchPoint, duration: number): void {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / duration;
    
    if (velocity < this.config.swipeVelocityThreshold) {
      return; // Muy lento para ser swipe
    }
    
    let direction: SwipeGesture['direction'];
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    const gesture: SwipeGesture = {
      direction,
      distance,
      velocity,
      duration
    };
    
    if (this.callbacks.onSwipe) {
      this.callbacks.onSwipe(gesture);
      logger.info('👆 Swipe detectado', { direction, distance, velocity });
    }
  }

  private handleTap(point: TouchPoint): void {
    const now = Date.now();
    
    // Verificar double tap
    if (this.lastTap && 
        now - this.lastTap.timestamp < this.config.doubleTapDelay &&
        Math.abs(point.x - this.lastTap.x) < 50 &&
        Math.abs(point.y - this.lastTap.y) < 50) {
      
      if (this.callbacks.onDoubleTap) {
        this.callbacks.onDoubleTap(point);
        logger.info('👆 Double tap detectado');
      }
      
      this.lastTap = null;
    } else {
      // Single tap
      if (this.callbacks.onTap) {
        this.callbacks.onTap(point);
      }
      
      this.lastTap = point;
      
      // Limpiar lastTap después del delay
      setTimeout(() => {
        if (this.lastTap === point) {
          this.lastTap = null;
        }
      }, this.config.doubleTapDelay);
    }
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private resetTouchState(): void {
    this.touchStart = null;
    this.touchCurrent = null;
    this.isDragging = false;
  }

  public destroy(): void {
    this.unbindEvents();
    this.clearLongPressTimer();
    this.resetTouchState();
    
    logger.info('👆 TouchGestureManager destruido');
  }
}

// Hook para usar gestos táctiles en componentes React
export const useTouchGestures = (
  callbacks: TouchGestureCallbacks,
  config?: Partial<TouchGestureConfig>
) => {
  const elementRef = useRef<HTMLElement>(null);
  const managerRef = useRef<TouchGestureManager | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      managerRef.current = new TouchGestureManager(
        elementRef.current,
        callbacks,
        config
      );
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
      }
    };
  }, [callbacks, config]);

  return elementRef;
};

// Componente wrapper para agregar gestos táctiles
export const TouchGestureWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  callbacks: TouchGestureCallbacks;
  config?: Partial<TouchGestureConfig>;
}> = ({ children, className = '', callbacks, config }) => {
  const gestureRef = useTouchGestures(callbacks, config);

  return (
    <div ref={gestureRef as React.RefObject<HTMLDivElement>} className={className}>
      {children}
    </div>
  );
};

// Componente específico para perfiles con swipe
export const SwipeableProfileCard: React.FC<{
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}> = ({ children, onSwipeLeft, onSwipeRight, className = '' }) => {
  const callbacks: TouchGestureCallbacks = {
    onSwipe: (gesture) => {
      if (gesture.direction === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (gesture.direction === 'right' && onSwipeRight) {
        onSwipeRight();
      }
    }
  };

  return (
    <TouchGestureWrapper 
      callbacks={callbacks} 
      className={`transition-transform duration-200 ${className}`}
    >
      {children}
    </TouchGestureWrapper>
  );
};

// Componente para galería de imágenes con pinch-to-zoom
export const PinchZoomGallery: React.FC<{
  children: React.ReactNode;
  className?: string;
  maxScale?: number;
  minScale?: number;
}> = ({ children, className = '', maxScale = 3, minScale = 1 }) => {
  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const callbacks: TouchGestureCallbacks = {
    onPinch: (gesture) => {
      const newScale = Math.max(minScale, Math.min(maxScale, gesture.scale));
      setScale(newScale);
    },
    
    onDoubleTap: () => {
      // Reset zoom en double tap
      setScale(1);
      setPosition({ x: 0, y: 0 });
    },
    
    onDrag: (point, delta) => {
      if (scale > 1) {
        setPosition(prev => ({
          x: prev.x + delta.x,
          y: prev.y + delta.y
        }));
      }
    }
  };

  return (
    <TouchGestureWrapper 
      callbacks={callbacks} 
      className={`overflow-hidden ${className}`}
    >
      <div 
        style={{
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: 'center',
          transition: scale === 1 ? 'transform 0.3s ease' : 'none'
        }}
      >
        {children}
      </div>
    </TouchGestureWrapper>
  );
};

export default TouchGestureManager;
