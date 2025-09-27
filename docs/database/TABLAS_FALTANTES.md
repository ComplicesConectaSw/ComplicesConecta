# Tablas Faltantes en Base de Datos

## Resumen
Este documento lista las tablas que faltan en la base de datos de Supabase y que son requeridas por los formularios y funcionalidades actuales del proyecto.

## Tablas Requeridas

### 1. career_applications
**Propósito:** Almacenar solicitudes de trabajo y colaboración
**Ubicación de uso:** 
- `src/pages/Careers.tsx` (línea 109)
- `src/components/forms/ModeratorApplicationForm.tsx` (línea 120)

**Campos requeridos:**
```sql
CREATE TABLE career_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo TEXT NOT NULL,
  domicilio TEXT,
  puesto TEXT NOT NULL,
  experiencia TEXT NOT NULL,
  referencias TEXT,
  expectativas TEXT NOT NULL,
  cv_url TEXT,
  status TEXT DEFAULT 'pending',
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. moderator_requests
**Propósito:** Almacenar solicitudes específicas de moderadores
**Ubicación de uso:** `src/components/forms/ModeratorApplicationForm.tsx`

**Campos requeridos:**
```sql
CREATE TABLE moderator_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo TEXT NOT NULL,
  edad INTEGER NOT NULL,
  experiencia TEXT NOT NULL,
  motivacion TEXT NOT NULL,
  disponibilidad TEXT NOT NULL,
  zona_horaria TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. email_validations
**Propósito:** Almacenar validaciones de email
**Ubicación de uso:** `src/components/auth/EmailValidation.tsx`

**Campos requeridos:**
```sql
CREATE TABLE email_validations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  validation_code TEXT NOT NULL,
  validated BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Buckets de Storage Faltantes

### 1. career-files
**Propósito:** Almacenar CVs y documentos de solicitudes de trabajo
**Ubicación de uso:** `src/pages/Careers.tsx` (línea 95)

**Configuración requerida:**
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('career-files', 'career-files', false);
```

## Acciones Recomendadas

1. **Crear las tablas en Supabase** usando los scripts SQL proporcionados
2. **Configurar RLS (Row Level Security)** para cada tabla según las necesidades de seguridad
3. **Crear los buckets de storage** necesarios
4. **Actualizar las políticas de acceso** para los buckets
5. **Probar los formularios** después de crear las tablas

## Estado Actual
- ❌ career_applications - **FALTANTE**
- ❌ moderator_requests - **FALTANTE** 
- ❌ email_validations - **FALTANTE**
- ❌ career-files bucket - **FALTANTE**

## Notas
- Los formularios actualmente usan simulaciones que deben ser removidas una vez creadas las tablas
- Es crítico crear estas tablas antes del despliegue a producción
- Se recomienda crear índices en campos como `correo`, `status`, y `created_at` para optimizar consultas
