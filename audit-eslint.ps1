<#
.SYNOPSIS
    Ejecuta ESLint, captura los errores y genera un reporte detallado en Markdown.
.DESCRIPTION
    Este script ejecuta 'npx eslint' en formato JSON, parsea los resultados
    y construye una tabla legible en un archivo .md incluyendo ruta, línea, regla y mensaje.
#>

$ReportFile = "ESLINT_REPORTE.md"
$TargetDir = "src" # Ajusta esto si quieres escanear otra carpeta (ej. ".")

Write-Host "🔍 Iniciando análisis de ESLint en '$TargetDir'..." -ForegroundColor Cyan

# 1. Ejecutar ESLint solicitando formato JSON
# Nota: Usamos cmd /c para asegurar compatibilidad con npx en algunas terminales de Windows
# El '2>&1' asegura que si npx falla, capturemos el error, aunque eslint suele escribir el json en stdout.
$eslintOutput = npx eslint "$TargetDir/**/*.{js,ts,jsx,tsx}" --format json

# Verificamos si la salida está vacía
if (-not $eslintOutput) {
    Write-Host "✅ No se encontraron errores o ESLint no devolvió nada." -ForegroundColor Green
    exit
}

try {
    # 2. Convertir el JSON de texto a Objetos de PowerShell
    # Unimos el array de strings en un solo string por si viene fragmentado
    $jsonString = $eslintOutput -join ""
    $results = $jsonString | ConvertFrom-Json
}
catch {
    Write-Host "⚠️ Error al parsear la salida de ESLint. Es posible que haya un error de configuración en ESLint que no es de linting." -ForegroundColor Red
    Write-Host "Salida cruda:"
    Write-Host $eslintOutput
    exit
}

# 3. Preparar el contenido del reporte Markdown
$mdContent = @()
$mdContent += "# 🛡️ Reporte de Auditoría Técnica - ESLint"
$mdContent += "**Proyecto:** Complices Conecta"
$mdContent += "**Fecha:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$mdContent += ""
$mdContent += "## 📊 Resumen Ejecutivo"

# Calcular contadores
$totalErrors = ($results | Measure-Object -Property errorCount -Sum).Sum
$totalWarnings = ($results | Measure-Object -Property warningCount -Sum).Sum
$totalFiles = $results.Count

$mdContent += "- **Archivos analizados con problemas:** $totalFiles"
$mdContent += "- **🔴 Errores Totales:** $totalErrors"
$mdContent += "- **🟡 Advertencias Totales:** $totalWarnings"
$mdContent += ""
$mdContent += "---"
$mdContent += ""
$mdContent += "## 📝 Detalle de Hallazgos"
$mdContent += ""

# Iniciar Tabla
$mdContent += "| Archivo | Ubicación | Tipo | Regla | Mensaje |"
$mdContent += "|---|---|---|---|---|"

# 4. Iterar sobre los resultados y llenar la tabla
foreach ($file in $results) {
    # Si el archivo no tiene mensajes, lo saltamos
    if ($file.messages.Count -eq 0) { continue }

    # Hacemos la ruta relativa para que no sea kilométrica en la tabla
    $relativePath = $file.filePath.Replace($PWD.Path, "").TrimStart("\").TrimStart("/")

    foreach ($msg in $file.messages) {
        # Determinar icono de severidad (1 = Warning, 2 = Error)
        $icon = if ($msg.severity -eq 2) { "🔴" } else { "🟡" }
        
        # Limpiar mensajes para que no rompan la tabla Markdown (escapar pipes |)
        $cleanMsg = $msg.message -replace "\|", "-"
        
        # Fila de la tabla
        $row = "| **$relativePath** | Línea $($msg.line):$($msg.column) | $icon | `$($msg.ruleId)` | $cleanMsg |"
        $mdContent += $row
    }
}

# 5. Guardar el archivo
$mdContent | Out-File -FilePath $ReportFile -Encoding utf8

Write-Host "✅ Reporte generado exitosamente: $ReportFile" -ForegroundColor Green

# Opcional: Abrir el reporte automáticamente si estás en entorno visual
# Invoke-Item $ReportFile