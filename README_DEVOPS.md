# 📘 README_DEVOPS v3.6.6

## 🚀 DevOps Manager Ultra (Enterprise Edition) + 100% Type-Safe Infrastructure + Legal Compliance Layer
Script unificado para manejar:

- Supabase (backups, migraciones, alineación de 113 tablas)
- Git (commits seguros, ramas de respaldo, push seguro)
- Multi-sesiones (varios proyectos en paralelo)
- **v3.4.0**: Gestión de funcionalidades avanzadas (seguridad, moderación, parejas)
- **v3.4.1**: Monitoreo completo con Datadog Agent + New Relic APM
- **v3.5.0**: AI/ML integration + S2 Geosharding + Neo4j Graph Database ✅
- **v3.6.0**: Refactorización completa de estructura (profiles/, features/, shared/, entities/, app/) ✅
- **v3.6.1**: Consolidación de estilos CSS + Script maestro consolidando 14 scripts ✅
- **v3.6.2**: Unificación de hooks + Correcciones de imports y paths ✅
- **v3.6.3**: **100% TYPE-SAFE** + Todos los errores TypeScript eliminados + Supabase Local/Remoto alineado + Docker Desktop integrado + Build warnings eliminados + Documentación actualizada ✅
- **v3.6.6**: **LEY OLIMPIA COMPLIANT** + ContentProtectionService + UserIdentificationService + ReportManagementService + 10 Features Implementadas (Chat, Dashboard, Gamificación, Búsqueda, Onboarding, UI/UX) + ~6,520 líneas código + Demo Investor Ready ✅

### 📅 Bitácora 26 Nov 2025
- FloatingNav actualizada con glassmorphism oscuro, dropdown "Más" y botón de login único; ajustes móviles (`w-[90%]`, dropdown centrado) + `pb-24` global para no tapar el footer.
- ChatInfo y StoriesInfo migraron al tema dark/glass con CTA directo a `/auth`, alineando todas las páginas públicas con el funnel de conversión.
- Nueva migración `20251126_create_global_search.sql` (pg_trgm + RPC `search_unified`) disponible vía `supabase db push / db reset`; el script `aplicar-migraciones-remoto.ps1` solo genera el SQL cuando el Dashboard no permite usar la CLI.

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

> **📚 Para documentación completa del sistema, consulta [docs/README.md](./docs/README.md)**  
> **📚 Para diagramas de flujos, consulta [DIAGRAMAS_FLUJOS_v3.5.0.md](./DIAGRAMAS_FLUJOS_v3.5.0.md)**  
> **📚 Para documentación técnica (uso interno), consulta [docs-unified/DOCUMENTACION_MAESTRA_UNIFICADA_v3.6.3.md](./docs-unified/DOCUMENTACION_MAESTRA_UNIFICADA_v3.6.3.md)** (no se sube a Git)

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

---

## 🔧 Scripts de Utilidad v3.6.3

### Script Maestro de Gestión de BD (NUEVO)
- **Archivo:** `scripts/database-manager.ps1`
- **Propósito:** Gestión completa de base de datos (unifica 5 scripts)
- **Uso:** `.\scripts\database-manager.ps1 -Action sync|verify|generate-remote|regenerate-types|analyze|all`
- **Funcionalidades:**
  - Sincronización de BD local y remota
  - Verificación de alineación de tablas
  - Generación de scripts para migraciones remotas
  - Regeneración de tipos TypeScript
  - Análisis de migraciones y backups
- **Scripts Unificados:**
  - `alinear-supabase.ps1` → `-Action sync`
  - `analizar-y-alinear-bd.ps1` → `-Action analyze`
  - `aplicar-migraciones-remoto.ps1` → `-Action generate-remote`
  - `sync-databases.ps1` → `-Action sync`
  - `verificar-alineacion-tablas.ps1` → `-Action verify`

### Script de Alineación y Verificación de Tablas (NUEVO)
- **Archivo:** `scripts/alinear-y-verificar-todo.ps1`
- **Propósito:** Alinear y verificar todas las tablas en LOCAL y REMOTO, verificar uso en código
- **Uso:** 
  - `.\scripts\alinear-y-verificar-todo.ps1` - Verificar local y remoto
  - `.\scripts\alinear-y-verificar-todo.ps1 -LocalOnly` - Solo local
  - `.\scripts\alinear-y-verificar-todo.ps1 -RemoteOnly` - Solo remoto
- **Funcionalidades:**
  - Aplica migraciones corregidas en local
  - Verifica tablas en LOCAL y REMOTO
  - Analiza uso de tablas en código
  - Compara y reporta tablas faltantes o no usadas
  - Regenera tipos TypeScript desde local
- **Mejoras v3.6.3:**
  - Verificación de todas las migraciones corregidas
  - Mejor manejo de errores en `db reset` y regeneración de tipos
  - Mejor detección de conexión remota con mensajes informativos

### Script Temporal de RLS (Solo Desarrollo)

- **Archivo:** `fix-rls-temp.sql`
- **Propósito:** Deshabilitar temporalmente las políticas RLS problemáticas en la tabla `profiles` durante sesiones de depuración.
- **Uso recomendado:**
  - Solo en ENTORNO DE DESARROLLO cuando RLS bloquea el acceso a perfiles y se requiere aislar el problema.
  - Nunca ejecutar en producción; la configuración RLS definitiva está en las migraciones oficiales de `supabase/migrations/`.

### Script de Corrección de Caracteres
- **Archivo:** `scripts/fix-character-encoding.ps1`
- **Propósito:** Corregir caracteres mal codificados (?, etc.) en archivos cuando están cerrados
- **Uso:** `.\scripts\fix-character-encoding.ps1 [-Path <ruta>] [-Backup]`
- **Características:**
  - Busca archivos TypeScript, JavaScript, TSX, JSX, Markdown
  - Corrige caracteres comunes mal codificados (á, é, í, ó, ú, ñ, ¿, ¡, etc.)
  - Crea backups automáticos en directorio `bck` fuera del proyecto
  - Detecta archivos abiertos en otros procesos y los omite
- **Nota:** Se recomienda cerrar los archivos antes de ejecutar el script para obtener mejores resultados
- **Ubicación de Backups:** `C:\Users\conej\Documents\bck` (fuera del proyecto, excluido de `.gitignore` y `.dockerignore`)

### Script de Build y Deploy para Vercel (NUEVO v3.6.3)
- **Archivo:** `build-and-deploy.ps1`
- **Propósito:** Build optimizado y deploy a Vercel con verificación completa
- **Uso:** `.\build-and-deploy.ps1`
- **Funcionalidades:**
  - Carga automática de variables desde `.env`/`.env.local`
  - Verificación de variables críticas (advertencia, no error fatal)
  - Limpieza de build anterior
  - Instalación de dependencias
  - Type check
  - Build optimizado con análisis de tamaño
  - Verificación de `vercel.json` (conflictos routes, headers)
  - Deploy opcional a Vercel
- **Mejoras v3.6.3:**
  - Función `Import-EnvFile` para cargar variables desde archivos .env
  - Verificación opcional (advertencia, no bloquea build)
  - Detección de conflictos en `vercel.json`
  - Análisis de tamaño de build (<60MB recomendado)
- **Correcciones v3.6.3:**
  - Funciones globales `showEnvInfo()` y `showErrorReport()` disponibles en producción
  - Wallet conflicts completamente silenciados
  - CircleCI configurado con Node.js 20.19+ (requerido por Vite 7.2.2)
