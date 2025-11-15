# Generar APK Final - Método que funciona 100%
# Version: 3.6.3
# Purpose: Generar APK usando el método probado

Write-Host "📱 Generando APK Final..." -ForegroundColor Cyan

# Ejecutar el script que sabemos que funciona
Write-Host "🔧 Ejecutando deploy sin Sentry..." -ForegroundColor Yellow
& .\deploy-android-no-sentry.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en deploy-android-no-sentry" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Proyecto preparado exitosamente!" -ForegroundColor Green
Write-Host "📱 Ahora genera el APK en Android Studio:" -ForegroundColor Cyan
Write-Host "   1. Abre Android Studio" -ForegroundColor White
Write-Host "   2. Open Project → Selecciona: android/" -ForegroundColor White
Write-Host "   3. Build → Generate Signed Bundle/APK" -ForegroundColor White
Write-Host "   4. Selecciona APK (no Bundle)" -ForegroundColor White
Write-Host "   5. Sigue el asistente para firmar" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📁 El APK se generará en:" -ForegroundColor Yellow
Write-Host "   android/app/build/outputs/apk/release/app-release.apk" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🎉 ¡Proyecto listo para generar APK sin errores!" -ForegroundColor Green
