# 📘 README_DEVOPS v3.4.1

## 🚀 DevOps Manager Ultra (Enterprise Edition)
Script unificado para manejar:

- Supabase (backups, migraciones, alineación de 47 tablas)
- Git (commits seguros, ramas de respaldo, push seguro)
- Multi-sesiones (varios proyectos en paralelo)
- **v3.4.0**: Gestión de funcionalidades avanzadas (seguridad, moderación, parejas)
- **NUEVO v3.4.1**: Monitoreo completo con Datadog Agent + New Relic APM

## 📋 Requisitos
- PowerShell 7+
- Supabase CLI instalado (`npm install -g supabase`)
- Node.js 20+ + npm
- Git instalado y configurado
- Docker Desktop (para Datadog Agent y New Relic)
- **v3.4.0**: Service Workers habilitados para notificaciones push
- **NUEVO v3.4.1**: Datadog API Key para monitoreo
- **NUEVO v3.4.1**: New Relic License Key para APM

## ▶️ Uso
```powershell
pwsh
cd C:\Users\conej\Documents\conecta-social-comunidad-main
.\DevOpsManagerUltra.ps1
```

## 🛡️ Seguridad Avanzada v3.4.1
- Antes de cada operación destructiva → crea backup automático
- Confirmación obligatoria antes de push a `main` o `master`
- `.gitignore` actualizado automáticamente para excluir backups, SQL, docs
- **v3.4.0**: Monitoreo continuo de amenazas con SecurityAuditService
- **v3.4.0**: Detección automática de patrones sospechosos
- **v3.4.0**: Sistema de alertas de seguridad en tiempo real
- **NUEVO v3.4.1**: Credenciales migradas a variables de entorno (.env)
- **NUEVO v3.4.1**: Wallet errors completamente silenciados
- **NUEVO v3.4.1**: Integración Sentry con filtros de privacidad
- **NUEVO v3.4.1**: Datadog RUM para Real User Monitoring

## 🐳 Docker Deployment v3.4.1

### Build y Deploy con New Relic
```powershell
# Build de imagen
docker build -t complicesconecta:latest .

# Run con New Relic APM
docker run -d --name complicesconecta \
  -p 3000:3000 \
  -e NEW_RELIC_LICENSE_KEY=your_key \
  -e NEW_RELIC_APP_NAME="ComplicesConecta" \
  complicesconecta:latest

# Ver logs
docker logs -f complicesconecta
```

### Datadog Agent Deployment
```bash
# Ejecutar script automatizado
chmod +x kubernetes/datadog-docker-run.sh
./kubernetes/datadog-docker-run.sh

# O usar comando manual
docker run -d --name dd-agent \
  --restart unless-stopped \
  -e DD_API_KEY="your_api_key" \
  -e DD_SITE="us5.datadoghq.com" \
  -e DD_ENV="production" \
  -e DD_SERVICE="complicesconecta" \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -p 8126:8126/tcp \
  -p 8125:8125/udp \
  gcr.io/datadoghq/agent:7
```

## 📊 Monitoring Stack v3.4.1

### Componentes Activos
1. **Datadog Agent** (Container): Infrastructure + APM + Security + Logs
2. **New Relic APM** (Integrado): Application monitoring
3. **Sentry** (Cloud): Error tracking + Performance
4. **Custom Analytics** (In-App): Dashboard con 4 pestañas

### Dashboards Disponibles
- **Datadog**: https://us5.datadoghq.com (us5)
- **New Relic**: https://one.newrelic.com (Account ID: 7299297)
- **Sentry**: https://sentry.io (configurar DSN)
- **In-App**: `/admin/analytics` (4 pestañas funcionales)
