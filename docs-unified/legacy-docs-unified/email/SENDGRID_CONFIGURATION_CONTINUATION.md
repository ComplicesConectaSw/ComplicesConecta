# Continuación Configuración SendGrid - ComplicesConecta

## Estado Actual
Has iniciado el proceso de configuración de SendGrid para autenticar tu dominio `complices-conecta.vercel.app`.

## Próximos Pasos Detallados

### 1. Completar Configuración en SendGrid

#### Configuración Recomendada:
- ✅ **Domain**: `complices-conecta.vercel.app`
- ✅ **Brand the link**: YES
- ✅ **Use automated security**: YES (DKIM automático)
- ❌ **Use custom return path**: NO
- ❌ **Use custom link subdomain**: NO
- ❌ **Use custom DKIM selector**: NO

#### Hacer clic en "Next" para obtener DNS records

### 2. DNS Records que Recibirás

SendGrid te proporcionará estos tipos de records:

#### A. CNAME Records (para verificación de dominio)
```
Host: em1234.complices-conecta.vercel.app
Value: u1234567.wl123.sendgrid.net
```

#### B. TXT Records (para DKIM)
```
Host: s1._domainkey.complices-conecta.vercel.app
Value: s1.domainkey.u1234567.wl123.sendgrid.net
```

#### C. TXT Record adicional
```
Host: s2._domainkey.complices-conecta.vercel.app
Value: s2.domainkey.u1234567.wl123.sendgrid.net
```

### 3. Configurar DNS en Vercel

#### Paso a Paso:
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `complices-conecta`
3. Ve a **Settings** > **Domains**
4. Haz clic en tu dominio principal
5. Ve a **DNS Records**

#### Agregar cada record:
1. Haz clic en **Add Record**
2. Selecciona el tipo (CNAME o TXT)
3. Ingresa el **Host** (sin el dominio base)
4. Ingresa el **Value** exacto
5. Guarda cada record

### 4. Verificación en SendGrid

#### Después de agregar DNS records:
1. Regresa a SendGrid
2. Haz clic en **Verify Domain**
3. Espera 5-10 minutos para propagación DNS
4. Si falla, verifica que los records estén exactos

### 5. Obtener API Key

#### Una vez verificado el dominio:
1. Ve a **Settings** > **API Keys**
2. Haz clic en **Create API Key**
3. Nombre: `ComplicesConecta-Production`
4. Permisos: **Mail Send** (Full Access)
5. Copia la API Key generada (solo se muestra una vez)

### 6. Configurar SMTP en Supabase

#### Con la API Key obtenida:
1. Ve a Supabase Dashboard
2. **Settings** > **Auth** > **SMTP Settings**
3. Habilita **Enable custom SMTP**

#### Configuración SMTP:
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: [Tu SendGrid API Key]
Sender Email: noreply@complices-conecta.vercel.app
Sender Name: ComplicesConecta
```

### 7. Variables de Entorno

#### Agregar a .env.production:
```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@complices-conecta.vercel.app
SENDGRID_FROM_NAME=ComplicesConecta
```

#### Agregar a Vercel Environment Variables:
1. Ve a **Settings** > **Environment Variables**
2. Agrega cada variable para **Production**

### 8. Testing de Configuración

#### Test de registro:
1. Intenta registrar un nuevo usuario
2. Verifica que llegue el email de confirmación
3. Revisa que no vaya a spam

#### Monitoreo:
- SendGrid Dashboard > Activity
- Supabase Dashboard > Auth Logs
- Vercel Dashboard > Functions Logs

### 9. Troubleshooting Común

#### Si los emails no llegan:
- ✅ Verifica DNS records en Vercel
- ✅ Confirma que el dominio esté verificado en SendGrid
- ✅ Revisa API Key en Supabase SMTP settings
- ✅ Verifica logs en SendGrid Activity

#### Si van a spam:
- ✅ Asegúrate que DKIM esté configurado
- ✅ Verifica SPF record automático
- ✅ Usa dominio verificado como sender

### 10. Checklist Final

- [ ] DNS records agregados en Vercel
- [ ] Dominio verificado en SendGrid
- [ ] API Key generada y copiada
- [ ] SMTP configurado en Supabase
- [ ] Variables de entorno actualizadas
- [ ] Test de email completado
- [ ] Monitoreo configurado

## Notas Importantes

⚠️ **Guarda la API Key de SendGrid de forma segura** - Solo se muestra una vez
⚠️ **DNS propagation** puede tomar hasta 24 horas, pero usualmente es 5-10 minutos
⚠️ **Testing** siempre en modo incógnito para evitar cache de email

## Contactos de Soporte

- **SendGrid Support**: [SendGrid Help](https://support.sendgrid.com)
- **Vercel Support**: [Vercel Help](https://vercel.com/help)
- **Supabase Support**: [Supabase Support](https://supabase.com/support)

---

**Fecha de creación**: 2025-01-13
**Estado**: Configuración en progreso
**Próximo paso**: Obtener DNS records de SendGrid
