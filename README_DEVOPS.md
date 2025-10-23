# 📘 README_DEVOPS v3.4.0

## 🚀 DevOps Manager Ultra (Advanced Edition)
Script unificado para manejar:

- Supabase (backups, migraciones, alineación)
- Git (commits seguros, ramas de respaldo, push seguro)
- Multi-sesiones (varios proyectos en paralelo)
- **NUEVO v3.4.0**: Gestión de funcionalidades avanzadas (seguridad, moderación, parejas)

## 📋 Requisitos
- PowerShell 7+
- Supabase CLI instalado (`npm install -g supabase`)
- Node.js + npm
- Git instalado y configurado
- **NUEVO v3.4.0**: Service Workers habilitados para notificaciones push

## ▶️ Uso
```powershell
pwsh
cd C:\Users\conej\Documents\conecta-social-comunidad-main
.\DevOpsManagerUltra.ps1
```

## 🛡️ Seguridad Avanzada v3.4.0
- Antes de cada operación destructiva → crea backup automático
- Confirmación obligatoria antes de push a `main` o `master`
- `.gitignore` actualizado automáticamente para excluir backups y SQL
- **NUEVO**: Monitoreo continuo de amenazas con SecurityAuditService
- **NUEVO**: Detección automática de patrones sospechosos
- **NUEVO**: Sistema de alertas de seguridad en tiempo real
