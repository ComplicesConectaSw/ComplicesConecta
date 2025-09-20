/**
 * VALIDACIONES ZOD - ComplicesConecta v2.9.x
 * Schemas de validación para formularios críticos
 */

import { z } from 'zod';

// Validaciones básicas
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(1, 'Email es requerido');

export const passwordSchema = z
  .string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .max(100, 'La contraseña es demasiado larga');

export const ageSchema = z
  .number()
  .int('La edad debe ser un número entero')
  .min(18, 'Debes ser mayor de 18 años')
  .max(100, 'Edad inválida');

// Schema para registro de usuario
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  first_name: z
    .string()
    .min(1, 'Nombre es requerido')
    .max(50, 'Nombre demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),
  last_name: z
    .string()
    .max(50, 'Apellido demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, 'Solo se permiten letras y espacios')
    .optional(),
  age: ageSchema,
  profile_type: z.enum(['single', 'couple'], {
    errorMap: () => ({ message: 'Tipo de perfil debe ser single o couple' })
  }),
  bio: z
    .string()
    .max(500, 'La biografía no puede exceder 500 caracteres')
    .optional(),
  location: z
    .string()
    .min(1, 'Ubicación es requerida')
    .max(100, 'Ubicación demasiado larga'),
});

// Schema para login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Contraseña es requerida'),
});

// Schema para perfil
export const profileUpdateSchema = z.object({
  first_name: z
    .string()
    .min(1, 'Nombre es requerido')
    .max(50, 'Nombre demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),
  last_name: z
    .string()
    .max(50, 'Apellido demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, 'Solo se permiten letras y espacios')
    .optional(),
  age: ageSchema,
  bio: z
    .string()
    .max(500, 'La biografía no puede exceder 500 caracteres')
    .optional(),
  location: z
    .string()
    .min(1, 'Ubicación es requerida')
    .max(100, 'Ubicación demasiado larga'),
});

// Schema para intereses
export const interestsSchema = z.array(
  z.enum([
    'lifestyle',
    'aventuras', 
    'nuevas_experiencias',
    'conexiones_autenticas',
    'vida_social',
    'intercambio_parejas',
    'parejas',
    'experiencias_compartidas',
    'discrecion',
    'negocios',
    'networking',
    'lujo',
    'experiencias_exclusivas',
    'hotwife',
    'bull',
    'trios',
    'orgias',
    'cuckold',
    'tercera_persona',
    'bisexual',
    'sensualidad',
    'encuentros_grupales',
    'experiencias_intensas',
    'exhibicionismo'
  ], {
    errorMap: () => ({ message: 'Interés no válido' })
  })
).min(1, 'Debes seleccionar al menos un interés')
  .max(10, 'No puedes seleccionar más de 10 intereses');

// Schema para chat
export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(1000, 'El mensaje es demasiado largo'),
  room_id: z.string().uuid('ID de sala inválido'),
});

// Schema para invitaciones
export const invitationSchema = z.object({
  to_profile: z.string().uuid('ID de perfil inválido'),
  type: z.enum(['profile', 'gallery'], {
    errorMap: () => ({ message: 'Tipo de invitación debe ser profile o gallery' })
  }),
  message: z
    .string()
    .max(200, 'El mensaje no puede exceder 200 caracteres')
    .optional(),
});

// Tipos TypeScript derivados de los schemas
export type UserRegistrationData = z.infer<typeof userRegistrationSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type InterestsData = z.infer<typeof interestsSchema>;
export type ChatMessageData = z.infer<typeof chatMessageSchema>;
export type InvitationData = z.infer<typeof invitationSchema>;

// Funciones helper para validación
export const validateUserRegistration = (data: unknown): UserRegistrationData => {
  return userRegistrationSchema.parse(data);
};

export const validateLogin = (data: unknown): LoginData => {
  return loginSchema.parse(data);
};

export const validateProfileUpdate = (data: unknown): ProfileUpdateData => {
  return profileUpdateSchema.parse(data);
};

export const validateInterests = (data: unknown): InterestsData => {
  return interestsSchema.parse(data);
};

export const validateChatMessage = (data: unknown): ChatMessageData => {
  return chatMessageSchema.parse(data);
};

export const validateInvitation = (data: unknown): InvitationData => {
  return invitationSchema.parse(data);
};

// Validación segura que retorna resultado con errores
export const safeValidateUserRegistration = (data: unknown) => {
  return userRegistrationSchema.safeParse(data);
};

export const safeValidateLogin = (data: unknown) => {
  return loginSchema.safeParse(data);
};

export const safeValidateProfileUpdate = (data: unknown) => {
  return profileUpdateSchema.safeParse(data);
};

export const safeValidateInterests = (data: unknown) => {
  return interestsSchema.safeParse(data);
};

export const safeValidateChatMessage = (data: unknown) => {
  return chatMessageSchema.safeParse(data);
};

export const safeValidateInvitation = (data: unknown) => {
  return invitationSchema.safeParse(data);
};
