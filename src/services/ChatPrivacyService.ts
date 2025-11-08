/**
 * ChatPrivacyService - Wrapper de re-exportación
 * 
 * Este archivo actúa como wrapper para mantener compatibilidad con imports antiguos.
 * Re-exporta el servicio real desde su ubicación actual en @/features/chat/
 * 
 * @version 3.6.3
 */

// Re-exportar desde la ubicación real
export { chatPrivacyService, ChatPrivacyService } from '@/features/chat/ChatPrivacyService';
export type { ChatRequest, ChatPermission, GalleryAccessRequest } from '@/features/chat/ChatPrivacyService';

// Re-exportar default desde el módulo original
import { chatPrivacyService } from '@/features/chat/ChatPrivacyService';
export default chatPrivacyService;
