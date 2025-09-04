# ❌ Error: No puedes ejecutar comandos curl en SQL Editor

## 🚨 Problema
Estás intentando ejecutar comandos `curl` (bash/terminal) en el **SQL Editor** de Supabase. Esto no funciona porque:

- **SQL Editor** = Solo para consultas SQL
- **curl** = Comando de terminal/PowerShell

## ✅ Solución: Usar Terminal/PowerShell

### 1. Primero, deployar la función Edge
```bash
# En tu terminal/PowerShell (NO en SQL Editor)
supabase functions deploy worldid-verify
```

### 2. Obtener tu ANON KEY
1. Ve a: https://supabase.com/dashboard/project/axtvqnozatbmllvwzuim/settings/api
2. Copia el valor de **anon public**

### 3. Probar la función (En PowerShell)
```powershell
# Comando PowerShell (reemplaza TU_ANON_KEY)
Invoke-RestMethod -Uri "https://axtvqnozatbmllvwzuim.supabase.co/functions/v1/worldid-verify" `
  -Method POST `
  -Headers @{"Authorization"="Bearer TU_ANON_KEY"; "Content-Type"="application/json"} `
  -Body '{"test": true}'
```

### 4. Alternativa con curl (si tienes Git Bash)
```bash
# En Git Bash o WSL
curl -X POST 'https://axtvqnozatbmllvwzuim.supabase.co/functions/v1/worldid-verify' \
  -H 'Authorization: Bearer TU_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"test": true}'
```

## 📋 Pasos Correctos:

1. **SQL Editor** → Solo para verificar esquema de base de datos
2. **Terminal/PowerShell** → Para comandos curl y deployment
3. **Dashboard** → Para configurar variables de entorno

## ⚠️ Recuerda:
- SQL Editor = SQL queries únicamente
- Terminal = comandos curl, supabase CLI
- Nunca mezcles los dos
