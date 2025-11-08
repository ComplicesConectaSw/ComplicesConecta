<#
.SYNOPSIS
    Corrige caracteres mal codificados del español de México (es-MX) UTF-8.
.DESCRIPTION
    Reemplaza caracteres corruptos comunes del español mexicano (UTF-8 mal interpretado como Windows-1252).
    Solo maneja caracteres del español de México: vocales con acento (á, é, í, ó, ú, Á, É, Í, Ó, Ú),
    ñ/Ñ, signos de interrogación/exclamación (¿, ¡), y comillas/apostrofes básicos.
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
    [switch]$Backup
)

# Si Backup no se especifica, por defecto es $true
if (-not $PSBoundParameters.ContainsKey('Backup')) {
    $Backup = $true
}

# === CONFIGURACIÓN ===
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

Write-Host "Script de Corrección de Codificación" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# === MAPA DE REEMPLAZOS (CORRUPTOS → CORRECTOS) ===
# Solo caracteres del español de México (es-MX) UTF-8
# Crear caracteres corruptos completos desde valores hexadecimales
$corruptA = [char]0xC3 + [char]0x81  # Á corrupto
$corruptE = [char]0xC3 + [char]0x89  # É corrupto
$corruptI = [char]0xC3 + [char]0x8D  # Í corrupto
$corruptO = [char]0xC3 + [char]0x93  # Ó corrupto
$corruptU = [char]0xC3 + [char]0x9A  # Ú corrupto
$corruptN = [char]0xC3 + [char]0x91  # Ñ corrupto

$replacements = @{
    # Windows-1252 / ISO-8859-1 mal interpretado como UTF-8
    # Vocales con acento - Minúsculas
    'Ã¡' = 'á'
    'Ã©' = 'é'
    'Ã­' = 'í'
    'Ã³' = 'ó'
    'Ãº' = 'ú'
    # Vocales con acento - Mayúsculas (usando caracteres completos corruptos)
    $corruptA = 'Á'
    $corruptE = 'É'
    $corruptI = 'Í'
    $corruptO = 'Ó'
    $corruptU = 'Ú'
    # Ñ y ñ
    'Ã±' = 'ñ'
    $corruptN = 'Ñ'
    # Signos de interrogación y exclamación
    'Â¿' = '¿'
    'Â¡' = '¡'
    # Comillas y apostrofes básicos
    'â€™' = "'"
    'â€œ' = '"'
    'â€' = '"'
    # Caracteres de reemplazo comunes (limpieza de basura)
    '' = ''
    'ï¿½' = ''
    'â€‹' = ''
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
                # Backup al directorio bck fuera del proyecto
                $bckDir = Join-Path (Split-Path (Get-Location).Path -Parent) "bck"
                if (-not (Test-Path $bckDir)) {
                    New-Item -ItemType Directory -Path $bckDir -Force | Out-Null
                }
                $ts = Get-Date -Format "yyyyMMdd-HHmmss"
                $relativePath = $FilePath.Replace((Get-Location).Path + "\", "").Replace("\", "_")
                $backupFileName = "$relativePath.backup-$ts"
                $backup = Join-Path $bckDir $backupFileName
                Copy-Item -Path $FilePath -Destination $backup -Force
                Write-Host "  Backup: $backupFileName" -ForegroundColor DarkYellow
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
