// Sistema de Límites para Chats Grupales
// Basado en LIMITES_Y_PLANES_GRUPOS.md

export type PlanType = 'free' | 'basic' | 'premium' | 'vip';

export interface GroupChatLimits {
  // Salas públicas
  maxPublicRooms: number;        // Máx salas activas simultáneas (-1 = ilimitado)
  maxMessagesPerRoomDay: number; // Mensajes por sala/día (-1 = ilimitado)
  canCreateRooms: boolean;       // Puede crear salas
  maxOwnRooms: number;           // Máx salas propias
  maxMembersPerRoom: number;     // Máx personas en sala propia (-1 = ilimitado)
  
  // Privilegios
  canBeModerator: boolean;       // Puede moderar
  hasVIPAccess: boolean;         // Acceso salas VIP
  hasPriority: boolean;          // Prioridad en mensajes
  canVideoCall: boolean;         // Videollamadas grupales
  maxVideoParticipants: number;  // Máx personas en video
}

export const PLAN_LIMITS: Record<PlanType, GroupChatLimits> = {
  free: {
    maxPublicRooms: 3,
    maxMessagesPerRoomDay: 50,
    canCreateRooms: false,
    maxOwnRooms: 0,
    maxMembersPerRoom: 0,
    canBeModerator: false,
    hasVIPAccess: false,
    hasPriority: false,
    canVideoCall: false,
    maxVideoParticipants: 0
  },
  basic: {
    maxPublicRooms: 10,
    maxMessagesPerRoomDay: -1, // Ilimitado
    canCreateRooms: true,
    maxOwnRooms: 2,
    maxMembersPerRoom: 50,
    canBeModerator: false,
    hasVIPAccess: false,
    hasPriority: false,
    canVideoCall: false,
    maxVideoParticipants: 0
  },
  premium: {
    maxPublicRooms: -1, // Ilimitado
    maxMessagesPerRoomDay: -1,
    canCreateRooms: true,
    maxOwnRooms: 5,
    maxMembersPerRoom: 100,
    canBeModerator: true,
    hasVIPAccess: true,
    hasPriority: true,
    canVideoCall: false,
    maxVideoParticipants: 0
  },
  vip: {
    maxPublicRooms: -1,
    maxMessagesPerRoomDay: -1,
    canCreateRooms: true,
    maxOwnRooms: 10,
    maxMembersPerRoom: -1, // Ilimitado
    canBeModerator: true,
    hasVIPAccess: true,
    hasPriority: true,
    canVideoCall: true,
    maxVideoParticipants: 10
  }
};

// Plan del usuario (en demo siempre VIP para testing)
export const getUserPlan = (): PlanType => {
  // En fase beta, todos tienen acceso VIP gratis
  const isBeta = import.meta.env.VITE_BETA_MODE !== 'false';
  
  if (isBeta) {
    return 'vip'; // Beta: acceso completo
  }
  
  // Post-beta: obtener plan del usuario desde BD
  const userPlanFromDB = localStorage.getItem('user_plan') as PlanType;
  return userPlanFromDB || 'free';
};

// Obtener límites del usuario actual
export const getUserLimits = (): GroupChatLimits => {
  const plan = getUserPlan();
  return PLAN_LIMITS[plan];
};

// Verificar si usuario puede realizar acción
export const canPerformAction = (action: keyof GroupChatLimits): boolean => {
  const limits = getUserLimits();
  const value = limits[action];
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  return true; // Para valores numéricos, verificar en el contexto específico
};

// Verificar si usuario alcanzó límite de salas
export const canJoinMoreRooms = (currentRooms: number): boolean => {
  const limits = getUserLimits();
  if (limits.maxPublicRooms === -1) return true; // Ilimitado
  return currentRooms < limits.maxPublicRooms;
};

// Verificar si usuario puede enviar más mensajes hoy
export const canSendMoreMessages = (messagesSentToday: number): boolean => {
  const limits = getUserLimits();
  if (limits.maxMessagesPerRoomDay === -1) return true; // Ilimitado
  return messagesSentToday < limits.maxMessagesPerRoomDay;
};

// Mensaje de upgrade si alcanzó límite
export const getUpgradeMessage = (limitType: string): string => {
  const plan = getUserPlan();
  
  const messages: Record<string, string> = {
    rooms: `Has alcanzado el límite de salas públicas de tu plan ${plan}. Upgrade a Premium para salas ilimitadas.`,
    messages: `Has alcanzado el límite de mensajes diarios. Upgrade a Básico para mensajes ilimitados.`,
    create: `Solo usuarios Premium+ pueden crear salas. Upgrade ahora.`,
    video: `Videollamadas solo disponibles en plan VIP. Upgrade ahora.`,
    moderate: `Solo usuarios Premium+ pueden ser moderadores. Upgrade ahora.`
  };
  
  return messages[limitType] || 'Upgrade tu plan para desbloquear esta función.';
};
