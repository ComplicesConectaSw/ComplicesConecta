// Sistema de roles multi-nivel - ComplicesConecta v3.0.0
// Fecha: 2025-09-22 23:31:00

export const ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator", 
  USER: "user"
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Jerarquía de permisos
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.MODERATOR]: 2,
  [ROLES.USER]: 1
};

// Permisos por rol
export const PERMISSIONS = {
  // Permisos de Admin 👑
  MANAGE_MODERATORS: [ROLES.ADMIN],
  MANAGE_USERS: [ROLES.ADMIN],
  VIEW_SENSITIVE_DATA: [ROLES.ADMIN],
  DOWNLOAD_DATA: [ROLES.ADMIN],
  SYSTEM_CONFIG: [ROLES.ADMIN],
  
  // Permisos de Moderador 🎭
  VIEW_REPORTS: [ROLES.ADMIN, ROLES.MODERATOR],
  MODERATE_CONTENT: [ROLES.ADMIN, ROLES.MODERATOR],
  SUSPEND_USERS: [ROLES.ADMIN, ROLES.MODERATOR],
  VALIDATE_PHOTOS: [ROLES.ADMIN, ROLES.MODERATOR],
  
  // Permisos de Usuario 💎
  CREATE_REPORTS: [ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER],
  VIEW_PROFILES: [ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER],
  SEND_MESSAGES: [ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER]
};

// Verificar si un rol tiene un permiso específico
export const hasPermission = (userRole: UserRole, permission: keyof typeof PERMISSIONS): boolean => {
  return PERMISSIONS[permission].includes(userRole as any);
};

// Verificar si un rol es superior a otro
export const isRoleHigher = (role1: UserRole, role2: UserRole): boolean => {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
};

// Obtener roles disponibles para asignar según el rol actual
export const getAssignableRoles = (currentRole: UserRole): UserRole[] => {
  if (currentRole === ROLES.ADMIN) {
    return [ROLES.MODERATOR, ROLES.USER];
  }
  return [];
};

// Estados de moderador
export const MODERATOR_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended", 
  PENDING: "pending",
  INACTIVE: "inactive"
} as const;

export type ModeratorStatus = typeof MODERATOR_STATUS[keyof typeof MODERATOR_STATUS];

// Tipos de reportes
export const REPORT_TYPES = {
  HARASSMENT: "harassment",
  INAPPROPRIATE_CONTENT: "inappropriate_content",
  FAKE_PROFILE: "fake_profile",
  SPAM: "spam",
  UNDERAGE: "underage",
  TERMS_VIOLATION: "terms_violation"
} as const;

export type ReportType = typeof REPORT_TYPES[keyof typeof REPORT_TYPES];

// Acciones de moderación
export const MODERATION_ACTIONS = {
  APPROVE: "approve",
  REJECT: "reject", 
  SUSPEND_3_DAYS: "suspend_3_days",
  SUSPEND_1_WEEK: "suspend_1_week",
  SUSPEND_1_MONTH: "suspend_1_month",
  SUSPEND_PERMANENT: "suspend_permanent",
  WARNING: "warning"
} as const;

export type ModerationAction = typeof MODERATION_ACTIONS[keyof typeof MODERATION_ACTIONS];

// Estados de reportes
export const REPORT_STATUS = {
  PENDING: "pending",
  UNDER_REVIEW: "under_review", 
  RESOLVED: "resolved",
  DISMISSED: "dismissed"
} as const;

export type ReportStatus = typeof REPORT_STATUS[keyof typeof REPORT_STATUS];
