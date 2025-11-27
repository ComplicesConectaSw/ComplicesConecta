import { z } from 'zod';

// Validación para solicitud de moderador
export const moderatorRequestSchema = z.object({
  fullName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  email: z.string()
    .email('Ingresa un email válido')
    .max(255, 'El email no puede exceder 255 caracteres'),
  
  experience: z.string()
    .max(1000, 'La experiencia no puede exceder 1000 caracteres')
    .optional(),
  
  motivation: z.string()
    .min(50, 'La motivación debe tener al menos 50 caracteres')
    .max(2000, 'La motivación no puede exceder 2000 caracteres'),
  
  availability: z.string()
    .max(200, 'La disponibilidad no puede exceder 200 caracteres')
    .optional(),
  
  previousModeration: z.string()
    .max(1000, 'La experiencia previa no puede exceder 1000 caracteres')
    .optional(),
  
  agreeToTerms: z.boolean()
    .refine(val => val === true, 'Debes aceptar los términos y condiciones')
});

// Validación para creación de moderador por admin
export const createModeratorSchema = z.object({
  email: z.string()
    .email('Ingresa un email válido')
    .max(255, 'El email no puede exceder 255 caracteres'),
  
  fullName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  permissions: z.array(z.string())
    .min(1, 'Debe seleccionar al menos un permiso')
    .optional()
});

// Validación para acciones de moderación
export const moderationActionSchema = z.object({
  reportId: z.string()
    .uuid('ID de reporte inválido'),
  
  action: z.enum(['approve', 'reject']),
  
  reason: z.string()
    .min(10, 'La razón debe tener al menos 10 caracteres')
    .max(500, 'La razón no puede exceder 500 caracteres'),
  
  suspensionDays: z.number()
    .min(0, 'Los días de suspensión no pueden ser negativos')
    .max(365, 'Los días de suspensión no pueden exceder 365')
    .optional()
});

// Validación para reportes de usuarios
export const userReportSchema = z.object({
  reportedUserId: z.string()
    .uuid('ID de usuario inválido'),
  
  reportType: z.enum([
    'harassment',
    'inappropriate_content',
    'fake_profile',
    'spam',
    'underage',
    'terms_violation'
  ]),
  
  reason: z.string()
    .min(10, 'La razón debe tener al menos 10 caracteres')
    .max(200, 'La razón no puede exceder 200 caracteres'),
  
  description: z.string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
});

// Tipos TypeScript derivados de los esquemas
export type ModeratorRequestInput = z.infer<typeof moderatorRequestSchema>;
export type CreateModeratorInput = z.infer<typeof createModeratorSchema>;
export type ModerationActionInput = z.infer<typeof moderationActionSchema>;
export type UserReportInput = z.infer<typeof userReportSchema>;

// Función helper para validar datos
export const validateModeratorRequest = (data: unknown) => {
  return moderatorRequestSchema.safeParse(data);
};

export const validateCreateModerator = (data: unknown) => {
  return createModeratorSchema.safeParse(data);
};

export const validateModerationAction = (data: unknown) => {
  return moderationActionSchema.safeParse(data);
};

export const validateUserReport = (data: unknown) => {
  return userReportSchema.safeParse(data);
};
