# Configuración de Templates de Email en Supabase

## Templates HTML Existentes en el Proyecto

**✅ IMPORTANTE**: El proyecto ya cuenta con templates de email HTML profesionales ubicados en:
`supabase/functions/send-email/templates/`

### Templates Disponibles:

1. **confirmation.html** - Confirmación de registro con diseño lifestyle
2. **reset-password.html** - Recuperación de contraseña con consejos de seguridad  
3. **magic-link.html** - Enlaces mágicos de acceso
4. **welcome.html** - Bienvenida a nuevos usuarios
5. **change-email.html** - Cambio de dirección de email
6. **invite-user.html** - Invitaciones a la plataforma
7. **confirm-signup.html** - Confirmación de registro alternativo

### Características de los Templates:

- **Diseño Profesional**: Gradientes modernos, tipografía optimizada
- **Responsive**: Adaptados para móvil y desktop
- **Branding Completo**: Logo y colores de ComplicesConecta
- **Variables Dinámicas**: `{{.ConfirmationURL}}`, `{{.Token}}`, `{{.ResetURL}}`
- **Contenido Lifestyle**: Messaging específico para la comunidad
- **Elementos de Seguridad**: Indicadores de expiración y privacidad

## Guía de Configuración en Supabase Dashboard

### 1. Acceso al Dashboard

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto ComplicesConecta
3. Ve a **Authentication** > **Email Templates**

### 2. Usar Templates Existentes en Supabase

Para cada tipo de email en el dashboard de Supabase:

#### A. Confirmation Email
Copiar el contenido completo de `supabase/functions/send-email/templates/confirmation.html`

#### B. Recovery Email  
Copiar el contenido completo de `supabase/functions/send-email/templates/reset-password.html`

#### C. Magic Link
Copiar el contenido completo de `supabase/functions/send-email/templates/magic-link.html`

#### D. Invite User
Copiar el contenido completo de `supabase/functions/send-email/templates/invite-user.html`

### 3. Configuración de SMTP (Recomendado para Producción)

#### Proveedores Recomendados:
- **SendGrid** (Recomendado)
- **Mailgun**
- **Amazon SES**
- **Postmark**

#### Configuración SMTP en Supabase:
1. Ve a **Settings** > **Auth** > **SMTP Settings**
2. Configura los siguientes campos:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP Username: apikey
   SMTP Password: [Tu API Key de SendGrid]
   Sender Email: noreply@complicesconecta.com
   Sender Name: ComplicesConecta
   ```

### 4. Variables de Entorno Necesarias

Agrega estas variables a tu `.env`:
```bash
# Email Configuration
SUPABASE_SMTP_HOST=smtp.sendgrid.net
SUPABASE_SMTP_PORT=587
SUPABASE_SMTP_USER=apikey
SUPABASE_SMTP_PASS=your_sendgrid_api_key
SUPABASE_SMTP_SENDER_EMAIL=noreply@complicesconecta.com
SUPABASE_SMTP_SENDER_NAME=ComplicesConecta
```

### 5. URLs de Redirección

Configura las siguientes URLs en **Authentication** > **URL Configuration**:

```bash
# Development
Site URL: http://localhost:5173
Redirect URLs: 
- http://localhost:5173/auth/callback
- http://localhost:5173/auth/reset-password

# Production
Site URL: https://complicesconecta.vercel.app
Redirect URLs:
- https://complicesconecta.vercel.app/auth/callback
- https://complicesconecta.vercel.app/auth/reset-password
```

### 6. Personalización Avanzada

#### CSS Personalizado para Emails:
```css
<style>
  body { 
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    margin: 0;
    padding: 20px;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  .header {
    background: linear-gradient(135deg, #8B5CF6 0%, #DB2777 100%);
    padding: 30px;
    text-align: center;
  }
  .content {
    padding: 30px;
  }
  .footer {
    background: #f8fafc;
    padding: 20px;
    text-align: center;
    border-top: 1px solid #e2e8f0;
  }
</style>
```

### 7. Testing y Verificación

#### Comandos para Testing:
```bash
# Test signup email
curl -X POST 'https://your-project.supabase.co/auth/v1/signup' \
-H 'apikey: your-anon-key' \
-H 'Content-Type: application/json' \
-d '{"email": "test@example.com", "password": "password123"}'

# Test password reset
curl -X POST 'https://your-project.supabase.co/auth/v1/recover' \
-H 'apikey: your-anon-key' \
-H 'Content-Type: application/json' \
-d '{"email": "test@example.com"}'
```

### 8. Monitoreo y Logs

1. Ve a **Logs** > **Auth Logs** para monitorear emails enviados
2. Configura alertas para fallos de email
3. Revisa métricas de entrega en tu proveedor SMTP

### 9. Troubleshooting Común

#### Emails no se envían:
- Verificar configuración SMTP
- Revisar límites de rate limiting
- Confirmar que el dominio esté verificado

#### Emails van a spam:
- Configurar SPF, DKIM y DMARC records
- Usar dominio verificado
- Evitar palabras spam en subject/content

#### Variables no se reemplazan:
- Verificar sintaxis: `{{ .Variable }}`
- Usar variables correctas: `.Name`, `.Email`, `.ConfirmationURL`

### 10. Checklist de Configuración

- [ ] Templates HTML configurados
- [ ] SMTP configurado y testado
- [ ] URLs de redirección configuradas
- [ ] Variables de entorno actualizadas
- [ ] Dominio verificado en proveedor SMTP
- [ ] DNS records configurados (SPF, DKIM)
- [ ] Testing completado
- [ ] Monitoreo configurado

---

**Nota**: Esta configuración debe realizarse tanto en el entorno de desarrollo como en producción. Asegúrate de usar diferentes API keys y configuraciones para cada entorno.
