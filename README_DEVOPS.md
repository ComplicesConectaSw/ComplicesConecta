# 📘 README_DEVOPS v3.5.0

## 🚀 DevOps Manager Ultra (Enterprise Edition)
Script unificado para manejar:

- Supabase (backups, migraciones, alineación de 52 tablas)
- Git (commits seguros, ramas de respaldo, push seguro)
- Multi-sesiones (varios proyectos en paralelo)
- **v3.4.0**: Gestión de funcionalidades avanzadas (seguridad, moderación, parejas)
- **v3.4.1**: Monitoreo completo con Datadog Agent + New Relic APM
- **v3.5.0**: AI/ML integration + S2 Geosharding + Neo4j Graph Database ✅
- **v3.5.0**: Refactorización masiva + CSS optimizado + PostCSS corregido ✅
- **v3.5.0**: Correcciones React en producción + Linting + Documentación consolidada ✅
- **v3.5.0**: Sistema de Chat con Privacidad + Mejoras Visuales CSS ✅
- **v3.5.0**: Silenciamiento ultra agresivo de errores wallet + Correcciones UI ✅
- **v3.5.0**: Navegación condicional + Documentación interna de tokens solo para autenticados ✅
- **v3.5.0**: Neo4j Graph Database implementado + Docker Compose configurado + Scripts corregidos y operativos ✅
- **v3.5.0**: Integración NFT completa en componentes de tokens e imágenes ✅
- **v3.5.0**: Análisis de Estilos Completo - Auditoría de 19 archivos CSS + Tailwind config (06 Nov 2025) ✅

## 📋 Requisitos
- PowerShell 7+
- Supabase CLI instalado (`npm install -g supabase`)
- Node.js 20+ + npm
- Git instalado y configurado
- Docker Desktop (para Datadog Agent, New Relic y Neo4j)
- **v3.4.0**: Service Workers habilitados para notificaciones push
- **NUEVO v3.4.1**: Datadog API Key para monitoreo
- **NUEVO v3.4.1**: New Relic License Key para APM
- **v3.5.0**: .gitignore actualizado para archivos .env copy*
- **v3.5.0**: Historial Git limpiado (sin secretos)

## ▶️ Uso

> **📚 Para una guía completa de instalación y configuración inicial, consulta [INSTALACION_SETUP_v3.5.0.md](./INSTALACION_SETUP_v3.5.0.md)**  
> **📚 Para documentación maestra completa, consulta [DOCUMENTACION_MAESTRA_UNIFICADA_v3.5.0.md](./DOCUMENTACION_MAESTRA_UNIFICADA_v3.5.0.md)**  
> **📚 Para memorias de sesiones, consulta [MEMORIAS_SESIONES_UNIFICADAS_v3.5.0.md](./MEMORIAS_SESIONES_UNIFICADAS_v3.5.0.md)**

```powershell
pwsh
cd C:\Users\conej\Documents\conecta-social-comunidad-main
.\DevOpsManagerUltra.ps1
```

### Primera Instalación

Antes de usar DevOpsManagerUltra, asegúrate de haber completado la instalación inicial:

1. **Instalar dependencias**: Ver [INSTALACION_SETUP_v3.5.0.md](./INSTALACION_SETUP_v3.5.0.md#instalación-de-dependencias)
2. **Configurar variables de entorno**: Ver [INSTALACION_SETUP_v3.5.0.md](./INSTALACION_SETUP_v3.5.0.md#configuración-de-variables-de-entorno)
3. **Configurar base de datos**: Ver [INSTALACION_SETUP_v3.5.0.md](./INSTALACION_SETUP_v3.5.0.md#configuración-de-base-de-datos)
4. **Configurar Docker**: Ver [INSTALACION_SETUP_v3.5.0.md](./INSTALACION_SETUP_v3.5.0.md#configuración-de-docker)

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
