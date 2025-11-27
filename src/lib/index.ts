// src/lib/index.ts - ARCHIVO MAESTRO DE IMPORTS
// USO: import { Button, Card, useAuth } from '@/lib'

// UI
export * from '@/shared/ui/Button';
export * from '@/shared/ui/Card';
export * from '@/shared/ui/Input';
export * from '@/shared/ui/Modal';

// Hooks compartidos
export * from '@/hooks/useGeolocation';
export * from '@/hooks/usePersistedState';
export * from '@/hooks/useIsomorphicLayoutEffect';
export * from '@/hooks/useToast';

// Utils
export * from '@/shared/lib/cn';
export * from '@/shared/lib/format';
export * from '@/shared/lib/validation';

// Entities
export * from '@/entities/user';
export * from '@/entities/club';
// Nota: @/entities/profile no existe, usar @/profiles/shared/ProfileCard o @/features/profile/