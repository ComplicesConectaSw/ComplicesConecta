# 🛡️ Sistema de Reportes de Perfiles - ComplicesConecta v3.1.0

**Fecha:** 23 de Septiembre, 2025  
**Versión:** 3.1.0  
**Estado:** Implementado y Funcional  

## 📋 Resumen

El Sistema de Reportes de Perfiles permite a los usuarios reportar perfiles sospechosos o que violen las normas comunitarias, implementando un flujo completo de moderación con lógica anti-falsos positivos y sistema de reincidencias.

## 🎯 Objetivos

- Permitir que cualquier usuario registrado pueda reportar un perfil sospechoso
- Clasificar reportes con motivos claros y específicos
- Bloquear temporalmente perfiles reportados hasta revisión
- Notificar al usuario sobre el estatus de su cuenta
- Habilitar flujo de revisión para moderadores y administradores
- Implementar sistema de reincidencias para suspensiones progresivas

## 🔧 Funcionalidades Implementadas

### 1️⃣ Reportar un Perfil

**Ubicación:** Botón "Reportar Perfil" en perfiles públicos  
**Componente:** `ProfileReportButton.tsx`  
**Modal:** `ProfileReportModal.tsx`  

**Motivos predefinidos:**
- 🚫 **Acoso o intimidación**: Comportamiento agresivo, amenazas
- 👤 **Suplantación de identidad**: Se hace pasar por otra persona  
- 🕵️ **Perfil falso**: Información falsa o perfil ficticio
- 💳 **Fraude o estafa**: Actividad fraudulenta
- 🚸 **Menor de edad**: Usuario menor de 18 años
- ⚠️ **Otro motivo**: Campo libre para otros casos

**Flujo:**
1. Usuario hace clic en "Reportar Perfil"
2. Sistema verifica permisos y límites
3. Modal muestra motivos predefinidos
4. Usuario selecciona motivo y añade descripción opcional
5. Reporte se guarda con estado `pending`

### 2️⃣ Sistema de Notificaciones

**Servicio:** `ProfileReportService.ts`  
**Tabla:** `notifications`  

**Tipos de notificaciones:**

**Bloqueo preventivo:**
> "Tu perfil fue bloqueado preventivamente por reportes. Será revisado por nuestro equipo. Esto no implica automáticamente una violación de términos."

**Suspensión confirmada:**
> "Tu perfil fue suspendido por infringir nuestras políticas: [motivo]. Duración: [3 días / 7 días / 1 mes / permanente]."

**Falso positivo:**
> "Tu perfil fue restaurado tras revisión. No se detectó violación a las políticas."

### 3️⃣ Panel Administrativo

**Componente:** `ProfileReportsPanel.tsx`  
**Ruta:** `/admin/reports`  

**Funcionalidades:**
- Filtrar por estado: `pending`, `reviewed`, `dismissed`, `confirmed`
- Ver detalles del perfil reportado (nombre, avatar, email, fecha creación)
- Ver motivo y número de reportes acumulados
- Estadísticas en tiempo real

**Acciones del administrador:**
- **Desestimar**: Falso positivo, restaurar perfil
- **Advertir**: Enviar advertencia al usuario
- **Suspender temporalmente**: 3 días, 7 días, 1 mes
- **Suspender permanentemente**: En casos graves

### 4️⃣ Panel de Moderadores

**Permisos limitados:**
- Revisar reportes pendientes
- Recomendar acciones ("procede" o "no procede")
- No pueden suspender directamente
- Requieren validación de administrador

### 5️⃣ Lógica Anti-Falsos Positivos

**Umbrales de acción:**
- **1 reporte**: Solo marca como "en revisión"
- **≥3 reportes en 24h**: Bloqueo preventivo automático
- **Confirmación múltiple**: Suspensión del perfil

**Sistema de reincidencias:**
- **1ª falta confirmada**: Suspensión leve (3-7 días)
- **2ª falta confirmada**: Suspensión media (1 mes)
- **3ª falta**: Suspensión permanente

## 🗄️ Estructura de Base de Datos

### Tabla `profile_reports`

```sql
CREATE TABLE profile_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_user_id UUID NOT NULL REFERENCES auth.users(id),
  reporter_user_id UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL CHECK (reason IN (
    'harassment', 'impersonation', 'fake-profile', 'fraud', 'underage', 'other'
  )),
  status TEXT CHECK (status IN ('pending','reviewed','dismissed','confirmed')) DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  action_taken VARCHAR(50) CHECK (action_taken IN ('none', 'warning', 'temporary_suspension', 'permanent_suspension'))
);
```

### Índices Optimizados

```sql
-- Para rastrear reincidencias
CREATE INDEX idx_profile_reports_user ON profile_reports (reported_user_id);
CREATE INDEX idx_profile_reports_status ON profile_reports (status);
CREATE INDEX idx_profile_reports_created_at ON profile_reports (created_at DESC);
```

### Campos Añadidos a `profiles`

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspension_end_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS warning_count INTEGER DEFAULT 0;
```

## 🔐 Seguridad y Permisos

### Row Level Security (RLS)

**Usuarios pueden:**
- Ver sus propios reportes hechos
- Crear reportes de otros usuarios
- Ver notificaciones propias

**Moderadores pueden:**
- Ver todos los reportes pendientes
- Actualizar estado de reportes
- Crear acciones de moderación

**Administradores pueden:**
- Acceso completo a todos los reportes
- Aplicar cualquier acción disciplinaria
- Ver estadísticas completas

### Límites Anti-Spam

- **5 reportes por día** por usuario
- **No reportar el mismo perfil** dos veces
- **Verificación de permisos** antes de mostrar modal
- **Bloqueo automático** de usuarios abusivos

## 📊 Métricas y Auditoría

### Logs de Auditoría

Todos los reportes generan registros auditables:
- Quién reportó y cuándo
- Motivo y descripción
- Acciones tomadas por moderadores
- Cambios de estado con timestamps

### Estadísticas Disponibles

- Total de reportes por período
- Reportes pendientes vs resueltos
- Tasa de falsos positivos
- Usuarios más reportados
- Moderadores más activos

## 🧪 Flujo de Pruebas

### Casos de Prueba Validados

1. ✅ **Usuario reporta perfil** → Modal aparece con motivos
2. ✅ **Perfil con ≥3 reportes** → Bloqueo automático temporal
3. ✅ **Usuario reportado** → Recibe notificación de estado
4. ✅ **Admin revisa reporte** → Puede restaurar o suspender
5. ✅ **Moderador recomienda** → Admin valida acción
6. ✅ **Perfil reincidente** → Suspensión progresiva aplicada

### Validaciones de Seguridad

- ❌ Usuario no puede reportarse a sí mismo
- ❌ No se puede reportar el mismo perfil dos veces
- ❌ Límite de reportes diarios respetado
- ❌ Usuarios bloqueados no pueden reportar
- ✅ Solo moderadores/admins ven panel de reportes

## 🚀 Integración con Componentes Existentes

### About.tsx
```tsx
import { ProfileReportButton } from '@/components/reports/ProfileReportButton';

// En el perfil del usuario
<ProfileReportButton 
  reportedUserId={user.id}
  reportedUserName={user.full_name}
  variant="button"
  size="sm"
/>
```

### AdminPanel.tsx
```tsx
import { ProfileReportsPanel } from '@/components/admin/ProfileReportsPanel';

// Nueva sección en el panel admin
<ProfileReportsPanel />
```

## 📋 Archivos Creados/Modificados

### Nuevos Archivos
- `src/services/ProfileReportService.ts` - Servicio principal
- `src/components/reports/ProfileReportModal.tsx` - Modal de reporte
- `src/components/reports/ProfileReportButton.tsx` - Botón de reporte
- `src/components/admin/ProfileReportsPanel.tsx` - Panel administrativo
- `scripts/sql_scripts/16_CREATE_REPORTS_TABLES.sql` - Script SQL
- `docs-unified/features/PROFILE_REPORTS_FEATURE.md` - Esta documentación

### Archivos Modificados
- `src/components/About.tsx` - Integración del botón de reporte
- Base de datos - Nuevas tablas y campos

## 🔮 Próximas Mejoras (v3.2)

- **Sistema de apelaciones** para usuarios suspendidos
- **Moderación comunitaria** con usuarios de confianza
- **Reportes de contenido multimedia** (fotos, videos)
- **Dashboard analytics** con métricas avanzadas
- **Integración con IA** para detección automática
- **Sistema de reputación** basado en reportes válidos

## ⚠️ Consideraciones Importantes

1. **Privacidad**: Los reportes son confidenciales entre reportero, moderadores y admins
2. **Transparencia**: Los usuarios reportados reciben notificaciones claras
3. **Proporcionalidad**: Las sanciones son progresivas según gravedad
4. **Reversibilidad**: Todas las acciones pueden ser revertidas por administradores
5. **Documentación**: Cada acción queda registrada para auditoría

---

**Desarrollado por:** ComplicesConecta Team  
**Contacto:** [soporte@complicesconecta.com](mailto:soporte@complicesconecta.com)  
**Última actualización:** 23 de Septiembre, 2025
