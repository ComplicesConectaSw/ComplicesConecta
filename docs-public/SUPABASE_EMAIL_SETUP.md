# Configuración de Email Templates en Supabase

Esta guía explica cómo configurar las plantillas de email personalizadas y el servicio SMTP en Supabase para ComplicesConecta.

## 1. Configuración de SMTP en Supabase

### Acceder a la configuración de Auth
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** > **Settings**
3. Busca la sección **SMTP Settings**

### Configurar proveedor SMTP
Puedes usar cualquiera de estos proveedores:

#### Opción A: Gmail/Google Workspace
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: tu-email@gmail.com
SMTP Pass: tu-app-password
```

#### Opción B: Outlook/Hotmail
```
SMTP Host: smtp-mail.outlook.com
SMTP Port: 587
SMTP User: tu-email@outlook.com
SMTP Pass: tu-contraseña
```

#### Opción C: SendGrid (Recomendado para producción)
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: tu-sendgrid-api-key
```

### Configurar remitente
En **Sender Name** y **Sender Email**, configura:
- **Sender Name**: `ComplicesConecta`
- **Sender Email**: `noreply@complicesconecta.com` (o tu dominio)

## 2. Plantillas de Email Personalizadas

### Plantillas disponibles
El sistema incluye plantillas HTML personalizadas para:

1. **Confirmación de email** (`confirmation.html`)
2. **Restablecimiento de contraseña** (`reset-password.html`)

### Ubicación de las plantillas
```
supabase/functions/send-email/templates/
├── confirmation.html
└── reset-password.html
```

### Estructura de las plantillas
Las plantillas incluyen:
- Diseño responsive
- Colores de marca de ComplicesConecta
- Botones de acción estilizados
- Footer con información de contacto

## 3. Configuración de Auth Templates

### En Supabase Dashboard
1. Ve a **Authentication** > **Email Templates**
2. Para cada tipo de email (Confirm signup, Reset password, etc.):
   - Habilita **Use custom template**
   - El contenido se genera automáticamente por la función Edge

### Variables disponibles en plantillas
- `{{ .ConfirmationURL }}` - URL de confirmación
- `{{ .Token }}` - Token de verificación
- `{{ .RedirectTo }}` - URL de redirección
- `{{ .SiteURL }}` - URL del sitio
- `{{ .Email }}` - Email del usuario

## 4. Configurar Plantillas en Supabase Dashboard

### Acceder a Email Templates
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** > **Email Templates**
3. Configura cada plantilla con el HTML personalizado

### Plantillas Disponibles

#### Reset Password (Recuperar Contraseña)
- **Asunto**: `Recupera tu contraseña - ComplicesConecta`
- **HTML**: Usar contenido de `reset-password.html`
- **Variables**: `{{ .Email }}`, `{{ .ConfirmationURL }}`

#### Confirm Signup (Confirmar Registro)  
- **Asunto**: `Confirma tu cuenta - ComplicesConecta`
- **HTML**: Usar contenido de `confirm-signup.html`
- **Variables**: `{{ .Email }}`, `{{ .ConfirmationURL }}`, `{{ .Token }}`

#### Magic Link (Enlace Mágico)
- **Asunto**: `Tu enlace de acceso - ComplicesConecta` 
- **HTML**: Usar contenido de `magic-link.html`
- **Variables**: `{{ .Email }}`, `{{ .ConfirmationURL }}`

#### Invite User (Invitar Usuario)
- **Asunto**: `Te han invitado a ComplicesConecta`
- **HTML**: Usar contenido de `invite-user.html` 
- **Variables**: `{{ .Email }}`, `{{ .ConfirmationURL }}`

#### Change Email (Cambiar Email)
- **Asunto**: `Confirma tu nuevo email - ComplicesConecta`
- **HTML**: Usar contenido de `change-email.html`
- **Variables**: `{{ .Email }}`, `{{ .ConfirmationURL }}`

### Configuración Adicional
- Configurar SMTP en **Settings** > **Auth** > **SMTP Settings**
- Verificar que las URLs de redirección estén configuradas correctamente
- Probar cada plantilla enviando emails de prueba

### Variables de Supabase Disponibles
- `{{ .Email }}` - Email del usuario
- `{{ .ConfirmationURL }}` - URL de confirmación con token
- `{{ .Token }}` - Token de verificación (solo para confirm signup)
- `{{ .SiteURL }}` - URL base del sitio
- `{{ .RedirectTo }}` - URL de redirección personalizada

## 5. Verificación del Sistema Completo

### ✅ Sistema de Chat Verificado
- **Salas públicas y privadas**: Funcionando correctamente
- **Mensajes en tiempo real**: Supabase Realtime configurado
- **Invitaciones y permisos**: Sistema de acceso granular implementado
- **Multimedia**: Soporte para texto, imágenes y archivos

### ✅ Sistema de Imágenes Verificado  
- **Buckets de Storage**: profile-images, gallery-images, chat-media
- **Validación de archivos**: Tipos permitidos (JPG, PNG, WebP, GIF), límite 10MB
- **Imágenes públicas/privadas**: Control de privacidad implementado
- **Metadatos completos**: Título, descripción, tamaño, tipo MIME

### ✅ Sistema de Geolocalización Verificado
- **API de Geolocalización**: Manejo de permisos y errores
- **Seguimiento en tiempo real**: watchPosition para actualizaciones
- **Cálculo de distancias**: Fórmula Haversine implementada
- **Limpieza de recursos**: useEffect cleanup para evitar memory leaks

### ✅ Plantillas de Email Completadas
- **5 plantillas HTML**: reset-password, confirm-signup, magic-link, invite-user, change-email
- **Diseño responsive**: Compatible con todos los clientes de email
- **Branding consistente**: Logo y colores de ComplicesConecta
- **Variables dinámicas**: Personalización automática por Supabase
2. Revisa los logs para verificar el envío exitoso
3. Verifica que no haya errores de SMTP

## 6. Solución de Problemas Comunes

### Error: "Invalid Refresh Token"
- **Causa**: Conflicto entre autenticación demo y Supabase
- **Solución**: Implementada en `client.ts` para evitar conexiones innecesarias

### Emails no se envían
1. Verifica configuración SMTP en Supabase
2. Revisa que el proveedor SMTP esté activo
3. Confirma que las credenciales sean correctas
4. Verifica logs de la función Edge

### Plantillas no se cargan
1. Verifica que las plantillas estén en la carpeta correcta
2. Confirma que la función Edge tenga acceso a los archivos
3. Revisa la sintaxis HTML de las plantillas

## 7. Configuración de Producción

### Variables de entorno requeridas
```env
VITE_SUPABASE_URL=tu-supabase-url
VITE_SUPABASE_ANON_KEY=tu-supabase-anon-key
```

### Configuración de dominio
1. Configura SPF, DKIM y DMARC para tu dominio
2. Verifica el dominio en tu proveedor SMTP
3. Actualiza el **Sender Email** en Supabase

### Monitoreo
- Configura alertas para fallos de envío
- Monitorea la tasa de entrega de emails
- Revisa regularmente los logs de la función Edge

## 8. Mantenimiento

### Actualizar plantillas
1. Modifica los archivos HTML en `templates/`
2. Redespliega la función Edge
3. Prueba el envío con las nuevas plantillas

### Backup de configuración
- Exporta la configuración SMTP
- Guarda copias de las plantillas personalizadas
- Documenta cualquier cambio en la configuración

---

**Nota**: Esta configuración está optimizada para el entorno de ComplicesConecta y incluye todas las mejores prácticas de seguridad y entregabilidad de emails.
