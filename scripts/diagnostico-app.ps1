# Script de diagnóstico completo para ComplicesConecta
# Versión: 3.5.1

Write-Host "`n🔍 DIAGNÓSTICO COMPLETO DE COMPLICESCONECTA`n" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar variables de entorno
Write-Host "1️⃣ VERIFICANDO VARIABLES DE ENTORNO..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    
    # Verificar Supabase
    if ($envContent -match "VITE_SUPABASE_URL=https://axtvqnozatbmllvwzuim\.supabase\.co") {
        Write-Host "   ✅ VITE_SUPABASE_URL configurada" -ForegroundColor Green
    } else {
        Write-Host "   ❌ VITE_SUPABASE_URL no configurada correctamente" -ForegroundColor Red
        Write-Host "      Esperado: https://axtvqnozatbmllvwzuim.supabase.co" -ForegroundColor Gray
    }
    
    if ($envContent -match "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9") {
        Write-Host "   ✅ VITE_SUPABASE_ANON_KEY configurada" -ForegroundColor Green
    } else {
        Write-Host "   ❌ VITE_SUPABASE_ANON_KEY no configurada correctamente" -ForegroundColor Red
    }
    
    # Verificar hCaptcha
    if ($envContent -match "VITE_HCAPTCHA_SITE_KEY=ES_7a3e04d5078346a79d1a105ea17cd320") {
        Write-Host "   ✅ VITE_HCAPTCHA_SITE_KEY configurada" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  VITE_HCAPTCHA_SITE_KEY no encontrada" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "   ❌ Archivo .env no encontrado" -ForegroundColor Red
    Write-Host "      Crea un archivo .env con las variables necesarias" -ForegroundColor Gray
}

Write-Host ""

# 2. Verificar servidor de desarrollo
Write-Host "2️⃣ VERIFICANDO SERVIDOR DE DESARROLLO..." -ForegroundColor Cyan
Write-Host ""

$port8080 = netstat -ano | findstr ":8080" | findstr "LISTENING"
if ($port8080) {
    Write-Host "   ✅ Puerto 8080 está en uso (servidor corriendo)" -ForegroundColor Green
    Write-Host "   $port8080" -ForegroundColor Gray
    
    # Intentar conectar al servidor
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Servidor responde correctamente (HTTP 200)" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⚠️  Servidor no responde correctamente" -ForegroundColor Yellow
        Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Puerto 8080 no está en uso - servidor no está corriendo" -ForegroundColor Red
    Write-Host "   💡 Ejecuta: npm run dev" -ForegroundColor Yellow
    Write-Host "   💡 O usa: .\scripts\start-dev-tunnel.ps1" -ForegroundColor Yellow
}

Write-Host ""

# 3. Verificar archivos críticos
Write-Host "3️⃣ VERIFICANDO ARCHIVOS CRÍTICOS..." -ForegroundColor Cyan
Write-Host ""

$files = @(
    @{Path="package.json"; Required=$true},
    @{Path="vite.config.ts"; Required=$true},
    @{Path="src/main.tsx"; Required=$true},
    @{Path="index.html"; Required=$true},
    @{Path="src/integrations/supabase/client.ts"; Required=$true},
    @{Path="src/App.tsx"; Required=$true}
)

foreach ($file in $files) {
    if (Test-Path $file.Path) {
        Write-Host "   ✅ $($file.Path) encontrado" -ForegroundColor Green
    } else {
        if ($file.Required) {
            Write-Host "   ❌ $($file.Path) NO encontrado (CRÍTICO)" -ForegroundColor Red
        } else {
            Write-Host "   ⚠️  $($file.Path) no encontrado" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# 4. Verificar dependencias
Write-Host "4️⃣ VERIFICANDO DEPENDENCIAS..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules existe" -ForegroundColor Green
    
    $criticalDeps = @("react", "react-dom", "@vitejs/plugin-react", "vite", "@supabase/supabase-js")
    foreach ($dep in $criticalDeps) {
        if (Test-Path "node_modules\$dep") {
            Write-Host "   ✅ $dep instalado" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $dep NO instalado" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ❌ node_modules no existe - dependencias no instaladas" -ForegroundColor Red
    Write-Host "   💡 Ejecuta: npm install" -ForegroundColor Yellow
}

Write-Host ""

# 5. Verificar configuración de Vite
Write-Host "5️⃣ VERIFICANDO CONFIGURACIÓN DE VITE..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path "vite.config.ts") {
    $viteConfig = Get-Content "vite.config.ts" -Raw
    
    if ($viteConfig -match "port:\s*8080") {
        Write-Host "   ✅ Puerto configurado: 8080" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Puerto no configurado como 8080" -ForegroundColor Yellow
    }
    
    if ($viteConfig -match "host:\s*true") {
        Write-Host "   ✅ Host configurado: true (permite conexiones externas)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Host no configurado como true" -ForegroundColor Yellow
    }
}

Write-Host ""

# 6. Resumen y recomendaciones
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📊 RESUMEN Y RECOMENDACIONES" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 COMANDOS PARA INICIAR:" -ForegroundColor Cyan
Write-Host "   1. npm run dev" -ForegroundColor White
Write-Host "      (Inicia servidor en http://localhost:8080)" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. .\scripts\start-dev-tunnel.ps1" -ForegroundColor White
Write-Host "      (Inicia servidor + tunnel público)" -ForegroundColor Gray
Write-Host ""

Write-Host "🌐 ACCESO:" -ForegroundColor Cyan
Write-Host "   - Local: http://localhost:8080" -ForegroundColor White
Write-Host "   - Red local: http://[TU_IP]:8080" -ForegroundColor White
Write-Host "   - Tunnel: (URL se mostrará en la terminal del tunnel)" -ForegroundColor White
Write-Host ""

Write-Host "🔍 VERIFICAR EN NAVEGADOR:" -ForegroundColor Cyan
Write-Host "   1. Abre http://localhost:8080" -ForegroundColor White
Write-Host "   2. Presiona F12 para abrir DevTools" -ForegroundColor White
Write-Host "   3. Revisa la pestaña Console para errores" -ForegroundColor White
Write-Host "   4. Revisa la pestaña Network para ver recursos cargados" -ForegroundColor White
Write-Host ""

Write-Host "✅ DIAGNÓSTICO COMPLETADO`n" -ForegroundColor Green

