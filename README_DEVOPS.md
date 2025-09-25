# 📘 README_DEVOPS

## 🚀 DevOps Manager Ultra (Safe Edition)
Script unificado para manejar:

- Supabase (backups, migraciones, alineación)
- Git (commits seguros, ramas de respaldo, push seguro)
- Multi-sesiones (varios proyectos en paralelo)

## 📋 Requisitos
- PowerShell 7+
- Supabase CLI instalado (`npm install -g supabase`)
- Node.js + npm
- Git instalado y configurado

## ▶️ Uso
```powershell
pwsh
cd C:\Users\conej\Documents\conecta-social-comunidad-main
.\DevOpsManagerUltra.ps1
```

## 🛡️ Seguridad
- Antes de cada operación destructiva → crea backup automático
- Confirmación obligatoria antes de push a `main` o `master`
- `.gitignore` actualizado automáticamente para excluir backups y SQL
