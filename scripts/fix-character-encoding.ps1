<#
.SYNOPSIS
    Corrige caracteres mal codificados (� → á, � → ñ, etc.) en archivos de código.
.DESCRIPTION
    Reemplaza caracteres corruptos comunes (UTF-8 mal interpretado).
    Soporta archivos abiertos, crea backups, y solo escribe si hay cambios.
.PARAMETER Path
    Ruta base. Por defecto: "src"
.PARAMETER Backup
    Crea backup con timestamp. Por defecto: $true
.EXAMPLE
    .\scripts\fix-character-encoding.ps1 -Path "." -Backup
#>

[CmdletBinding()]
param(
    [string]$Path = "src",
    # PSScriptAnalyzer: Ignore because default is intentional
    [switch]$Backup = $true
)

# === CONFIGURACIÓN ===
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

Write-Host "Script de Corrección de Codificación" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# === MAPA DE REEMPLAZOS (CORRUPTOS → CORRECTOS) ===
$replacements = @{
    # Windows-1252 / ISO-8859-1 mal interpretado como UTF-8
    'Ã¡' = 'á'; 'Ã©' = 'é'; 'Ã­' = 'í'; 'Ã³' = 'ó'; 'Ãº' = 'ú'; 'Ã±' = 'ñ'
    'Ã¡' = 'Á'; 'Ã‰' = 'É'; 'Ã¡' = 'Í'; 'Ã“' = 'Ó'; 'Ãš' = 'Ú'; 'Ã‘' = 'Ñ'
    'Â¿' = '¿'; 'Â¡' = '¡'
    'â€™' = '’'; 'â€œ' = '“'; 'â€�' = '”'
    'Ã¼' = 'ü'; 'Ã¶' = 'ö'; 'Ã¤' = 'ä'; 'Ãœ' = 'Ü'; 'Ã–' = 'Ö'; 'Ã„' = 'Ä'
    'Ã§' = 'ç'; 'Ã‡' = 'Ç'
    'Ã¨' = 'è'; 'Ã¬' = 'ì'; 'Ã²' = 'ò'; 'Ã¹' = 'ù'
    'Ãˆ' = 'È'; 'ÃŒ' = 'Ì'; 'Ã’' = 'Ò'; 'Ã™' = 'Ù'
    'Ã£' = 'ã'; 'Ãµ' = 'õ'; 'Ã¢' = 'â'; 'Ãª' = 'ê'
    'â‚¬' = '€'; 'â„¢' = '™'; 'Â®' = '®'; 'Â©' = '©'
    'Â' = ' '; 'Âª' = 'ª'; 'Âº' = 'º'
    # Caracteres de reemplazo
    '�' = ''; 'ï¿½' = ''; 'â€‹' = ''
    # Unificados: Â y Ã (ambos aparecen como basura)
    'Â' = ''; 'Ã' = ''
}

# === EXTENSIONES A PROCESAR ===
$extensions = @("*.ts", "*.tsx", "*.js", "*.jsx", "*.md", "*.mdx", "*.json", "*.css", "*.html", "*.txt")

# === EXCLUSIONES ===
$excludeDirs = @("node_modules", ".git", "dist", "build", ".next", "coverage", "android", "ios")

# === FUNCIÓN: REPARAR CODIFICACIÓN ===
function Repair-CharacterEncoding {
    [CmdletBinding()]
    param([string]$FilePath)
    
    try {
        $content = Get-Content -Path $FilePath -Encoding UTF8 -Raw -ErrorAction Stop
        $changed = $false

        foreach ($bad in $replacements.Keys) {
            if ($content -match [regex]::Escape($bad)) {
                $content = $content -replace [regex]::Escape($bad), $replacements[$bad]
                $changed = $true
            }
        }

        if ($changed) {
            if ($Backup) {
                $ts = Get-Date -Format "yyyyMMdd-HHmmss"
                $backup = "$FilePath.backup-$ts"
                Copy-Item -Path $FilePath -Destination $backup -Force
                Write-Host "  Backup: $(Split-Path $backup -Leaf)" -ForegroundColor DarkYellow
            }
            Set-Content -Path $FilePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  Corregido: $(Split-Path $FilePath -Leaf)" -ForegroundColor Green
            return $true
        }
        return $false
    }
    catch {
        Write-Host "  Error: $(Split-Path $FilePath -Leaf) → $_" -ForegroundColor Red
        return $false
    }
}

# === BUSCAR ARCHIVOS ===
$files = Get-ChildItem -Path $Path -Include $extensions -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $full = $_.FullName
    -not ($excludeDirs | Where-Object { $full -like "*\$($_)*" })
}

if ($files.Count -eq 0) {
    Write-Host "No se encontraron archivos en '$Path'" -ForegroundColor Yellow
    return
}

Write-Host "Archivos encontrados: $($files.Count)" -ForegroundColor Cyan
Write-Host ""

$corrected = 0
$skipped = 0
$errors = 0

foreach ($file in $files) {
    $name = $file.Name
    Write-Host "Procesando: $name" -ForegroundColor Gray

    try {
        $stream = [System.IO.File]::Open($file.FullName, 'Open', 'ReadWrite', 'None')
        $stream.Close()

        if (Repair-CharacterEncoding -FilePath $file.FullName) {
            $corrected++
        }
    }
    catch {
        if ($_.Exception.Message -match "being used by another process") {
            Write-Host "  Omitido (abierto): $name" -ForegroundColor Yellow
            $skipped++
        }
        else {
            Write-Host "  Error: $name → $_" -ForegroundColor Red
            $errors++
        }
    }
}

# === RESUMEN ===
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "  Corregidos: $corrected" -ForegroundColor Green
Write-Host "  Omitidos (abiertos): $skipped" -ForegroundColor Yellow
Write-Host "  Errores: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host "  Total: $($files.Count)" -ForegroundColor Cyan

if ($corrected -gt 0 -and $Backup) {
    Write-Host ""
    Write-Host "Backups: *.backup-*" -ForegroundColor DarkYellow
}
if ($corrected -gt 0) {
    Write-Host ""
    Write-Host "EJECUTA: git status → revisa cambios" -ForegroundColor Magenta
}