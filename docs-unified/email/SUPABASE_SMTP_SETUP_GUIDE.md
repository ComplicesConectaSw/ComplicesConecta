# Guía para Configurar SMTP Personalizado en Supabase

## Problema Identificado

El dashboard de Supabase muestra que estás usando el **servicio de email integrado** que tiene limitaciones:
- Rate limits restrictivos
- No apto para producción
- Variables de template pueden no procesarse correctamente

## Solución: Configurar SMTP Personalizado

### 1. Configurar SMTP en Supabase Dashboard

1. Ve a **Settings** > **Auth** > **SMTP Settings**
2. Habilita "Enable custom SMTP"
3. Configura los siguientes campos:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: [Tu SendGrid API Key]
Sender Email: noreply@complicesconecta.com
Sender Name: ComplicesConecta
```

### 2. Obtener API Key de SendGrid

1. Ve a [SendGrid](https://sendgrid.com)
2. Crea una cuenta o inicia sesión
3. Ve a **Settings** > **API Keys**
4. Crea una nueva API Key con permisos de "Mail Send"
5. Copia la API Key generada

### 3. Verificar Dominio (Importante)

Para evitar que los emails vayan a spam:
1. En SendGrid, ve a **Settings** > **Sender Authentication**
2. Verifica tu dominio agregando los DNS records requeridos
3. Configura SPF, DKIM y DMARC

### 4. Variables de Template Correctas

Los templates HTML usan estas variables que Supabase procesará automáticamente:

```html
{{.ConfirmationURL}} - URL de confirmación
{{.Token}} - Token de verificación  
{{.Email}} - Email del usuario
{{.RedirectTo}} - URL de redirección
{{.SiteURL}} - URL del sitio
```

### 5. Testing de Configuración

Una vez configurado SMTP, testa con:

```bash
# Test desde tu app
curl -X POST 'https://your-project.supabase.co/auth/v1/signup' \
-H 'apikey: your-anon-key' \
-H 'Content-Type: application/json' \
-d '{"email": "test@example.com", "password": "password123"}'
```

### 6. Monitoreo

- Revisa logs en SendGrid Dashboard
- Monitorea métricas de entrega
- Configura webhooks para eventos de email

## Alternativa: Usar Edge Function Personalizada

Si prefieres más control, puedes usar tu Edge Function existente:

1. Configura SendGrid en la Edge Function
2. Llama a la Edge Function desde tu app en lugar de usar Supabase Auth
3. Procesa los templates HTML manualmente

### Configuración en Edge Function:

```typescript
// Agregar a index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')

async function sendEmailViaSendGrid(to: string, subject: string, html: string) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'noreply@complicesconecta.com', name: 'ComplicesConecta' },
      subject,
      content: [{ type: 'text/html', value: html }]
    })
  })
  
  return response.ok
}
```

## Recomendación

**Para producción inmediata**: Configura SMTP personalizado en Supabase Dashboard
**Para control total**: Migra a Edge Function con SendGrid API directamente
