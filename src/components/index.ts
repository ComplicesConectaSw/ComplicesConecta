/**
 * Índice centralizado de componentes - ComplicesConecta v3.6.3
 * Organización y exportación centralizada de componentes principales
 */

// === COMPONENTES DE NAVEGACIÓN ===
export { default as HeaderNav } from './HeaderNav';
export { default as Navigation } from './Navigation';

// === COMPONENTES DECORATIVOS ===
export { DecorativeHearts } from './DecorativeHearts';

// === CONFIGURACIONES DE COMPONENTES ===
export const COMPONENTS_CONFIG = {
  // Configuración de animaciones
  ANIMATIONS: {
    DURATION: 300, // 300ms
    EASING: 'ease-in-out',
    STAGGER_DELAY: 50 // 50ms entre elementos
  },
  
  // Configuración de lazy loading
  LAZY_LOADING: {
    ROOT_MARGIN: '50px',
    THRESHOLD: 0.1
  },
  
  // Configuración de modales
  MODALS: {
    BACKDROP_BLUR: true,
    CLOSE_ON_ESCAPE: true,
    CLOSE_ON_BACKDROP_CLICK: true
  },
  
  // Configuración de toasts
  TOASTS: {
    DURATION: 4000, // 4 segundos
    MAX_VISIBLE: 3,
    POSITION: 'bottom-right' as const
  }
} as const;
