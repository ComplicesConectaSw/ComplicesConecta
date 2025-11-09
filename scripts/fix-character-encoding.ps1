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
    .\scripts\fix-character-encoding.ps1 -Path "src" -Backup
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
$ErrorActionPreference = 'Continue'
$ProgressPreference = 'Continue'

Write-Host "Script de Corrección de Codificación" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# === MAPA DE REEMPLAZOS (CORRUPTOS → CORRECTOS) ===
# Solo caracteres del español de México (es-MX) UTF-8
# Crear caracteres corruptos como strings primero
$corrupt_a = [char]0xC3 + [char]0xA1
$corrupt_e = [char]0xC3 + [char]0xA9
$corrupt_i = [char]0xC3 + [char]0xAD
$corrupt_o = [char]0xC3 + [char]0xB3
$corrupt_u = [char]0xC3 + [char]0xBA
$corrupt_A = [char]0xC3 + [char]0x81
$corrupt_E = [char]0xC3 + [char]0x89
$corrupt_I = [char]0xC3 + [char]0x8D
$corrupt_O = [char]0xC3 + [char]0x93
$corrupt_U = [char]0xC3 + [char]0x9A
$corrupt_n = [char]0xC3 + [char]0xB1
$corrupt_N = [char]0xC3 + [char]0x91
$corrupt_question = [char]0xC2 + [char]0xBF
$corrupt_exclamation = [char]0xC2 + [char]0xA1
$corrupt_apostrophe = [char]0xE2 + [char]0x80 + [char]0x99
$corrupt_quote_open = [char]0xE2 + [char]0x80 + [char]0x9C
$corrupt_quote_close = [char]0xE2 + [char]0x80 + [char]0x9D
$corrupt_replacement = [char]0xEF + [char]0xBF + [char]0xBD
$corrupt_zwsp = [char]0xE2 + [char]0x80 + [char]0x8B

# Crear hash table de reemplazos usando Add() para evitar duplicados
$replacements = @{}
# Vocales con acento - Minúsculas
$replacements[$corrupt_a] = [char]0xE1  # á
$replacements[$corrupt_e] = [char]0xE9  # é
$replacements[$corrupt_i] = [char]0xED  # í
$replacements[$corrupt_o] = [char]0xF3  # ó
$replacements[$corrupt_u] = [char]0xFA  # ú
# Vocales con acento - Mayúsculas
$replacements[$corrupt_A] = [char]0xC1  # Á
$replacements[$corrupt_E] = [char]0xC9  # É
$replacements[$corrupt_I] = [char]0xCD  # Í
$replacements[$corrupt_O] = [char]0xD3  # Ó
$replacements[$corrupt_U] = [char]0xDA  # Ú
# Ñ y ñ
$replacements[$corrupt_n] = [char]0xF1  # ñ
$replacements[$corrupt_N] = [char]0xD1  # Ñ
# Signos de interrogación y exclamación
$replacements[$corrupt_question] = [char]0xBF  # ¿
$replacements[$corrupt_exclamation] = [char]0xA1  # ¡
# Comillas y apostrofes básicos
$replacements[$corrupt_apostrophe] = [char]0x27  # '
$replacements[$corrupt_quote_open] = [char]0x22  # "
$replacements[$corrupt_quote_close] = [char]0x22  # "
# Caracteres de reemplazo comunes (limpieza de basura)
$replacements[$corrupt_replacement] = ''  # carácter de reemplazo
$replacements[$corrupt_zwsp] = ''  # zero-width space

# === EXTENSIONES A PROCESAR ===
$extensions = @("*.ts", "*.tsx", "*.js", "*.jsx", "*.md", "*.mdx", "*.json", "*.css", "*.html", "*.txt", "*.ps1")

# === EXCLUSIONES ===
$excludeDirs = @("node_modules", ".git", "dist", "build", ".next", "coverage", "android", "ios", ".vscode", ".idea")

# === FUNCIÓN: REPARAR CODIFICACIÓN ===
function Repair-CharacterEncoding {
    [CmdletBinding()]
    param([string]$FilePath)
    
    try {
        # Leer archivo como bytes para detectar codificación
        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        $content = [System.Text.Encoding]::UTF8.GetString($bytes)
        $changed = $false

        # Procesar cada reemplazo
        foreach ($bad in $replacements.Keys) {
            if ($content.Contains($bad)) {
                $content = $content.Replace($bad, $replacements[$bad])
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
            
            # Escribir con UTF-8 sin BOM
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($FilePath, $content, $utf8NoBom)
            Write-Host "  Corregido: $(Split-Path $FilePath -Leaf)" -ForegroundColor Green
            return $true
        }
        return $false
    }
    catch {
        Write-Host "  Error: $(Split-Path $FilePath -Leaf) - $_" -ForegroundColor Red
        return $false
    }
}

# === BUSCAR ARCHIVOS (DIRECTORIO POR DIRECTORIO) ===
Write-Host "Buscando archivos en: $Path" -ForegroundColor Cyan
Write-Host ""

# Verificar que el directorio existe
if (-not (Test-Path $Path)) {
    Write-Host "Error: El directorio '$Path' no existe" -ForegroundColor Red
    return
}

# Obtener todos los archivos directamente con recursión
$allFiles = Get-ChildItem -Path $Path -Include $extensions -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $full = $_.FullName
    $shouldExclude = $false
    foreach ($excludeDir in $excludeDirs) {
        if ($full -like "*\$excludeDir\*" -or $full -like "*\$excludeDir") {
            $shouldExclude = $true
            break
        }
    }
    -not $shouldExclude
}

# Agrupar archivos por directorio para procesar directorio por directorio
$filesByDir = @{}
foreach ($file in $allFiles) {
    $dir = $file.DirectoryName
    if (-not $filesByDir.ContainsKey($dir)) {
        $filesByDir[$dir] = @()
    }
    $filesByDir[$dir] += $file
}

$allDirs = $filesByDir.Keys | Sort-Object

if ($allFiles.Count -eq 0) {
    Write-Host "No se encontraron archivos en '$Path'" -ForegroundColor Yellow
    return
}

Write-Host "Archivos encontrados: $($allFiles.Count)" -ForegroundColor Cyan
Write-Host "Directorios a procesar: $($allDirs.Count)" -ForegroundColor Cyan
Write-Host ""

$corrected = 0
$skipped = 0
$errors = 0
$processed = 0

# Procesar directorio por directorio
foreach ($dir in $allDirs) {
    $filesInDir = $filesByDir[$dir]
    
    if ($filesInDir.Count -gt 0) {
        $relativeDir = $dir.Replace((Get-Location).Path + "\", "").Replace((Get-Location).Path, "")
        Write-Host "Directorio: $relativeDir" -ForegroundColor Yellow
        Write-Host "   Archivos: $($filesInDir.Count)" -ForegroundColor Gray
        Write-Host ""
        
        # Procesar archivo por archivo
        foreach ($file in $filesInDir) {
            $processed++
            $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace((Get-Location).Path, "")
            Write-Host "  [$processed/$($allFiles.Count)] Procesando: $relativePath" -ForegroundColor Gray

            try {
                # Verificar que el archivo no esté bloqueado
                $stream = [System.IO.File]::Open($file.FullName, 'Open', 'ReadWrite', 'None')
                $stream.Close()

                if (Repair-CharacterEncoding -FilePath $file.FullName) {
                    $corrected++
                }
            }
            catch {
                if ($_.Exception.Message -match "being used by another process") {
                    Write-Host "    Omitido (abierto): $($file.Name)" -ForegroundColor Yellow
                    $skipped++
                }
                else {
                    Write-Host "    Error: $($file.Name) - $_" -ForegroundColor Red
                    $errors++
                }
            }
        }
        Write-Host ""
    }
}

# === RESUMEN ===
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "  Corregidos: $corrected" -ForegroundColor Green
Write-Host "  Omitidos (abiertos): $skipped" -ForegroundColor Yellow
Write-Host "  Errores: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host "  Total: $($allFiles.Count)" -ForegroundColor Cyan

if ($corrected -gt 0 -and $Backup) {
    Write-Host ""
    Write-Host "Backups: *.backup-*" -ForegroundColor DarkYellow
}
if ($corrected -gt 0) {
    Write-Host ""
    Write-Host "EJECUTA: git status para revisar cambios" -ForegroundColor Magenta
}
