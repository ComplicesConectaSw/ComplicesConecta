<#
.SYNOPSIS
    Corrige caracteres mal codificados del español de México (es-MX) UTF-8.
.DESCRIPTION
    Reemplaza caracteres corruptos comunes del español mexicano (UTF-8 mal interpretado como Windows-1252).
    Maneja caracteres del español de México: vocales con acento (á, é, í, ó, ú, Á, É, Í, Ó, Ú),
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
# Caracteres del español de México (es-MX) UTF-8
# Múltiples formas de caracteres corruptos que pueden aparecer

# Crear hash table de reemplazos
$replacements = @{}

# 1. Caracteres corruptos como strings (cuando UTF-8 se lee como Windows-1252)
# Estos aparecen cuando UTF-8 se lee como Windows-1252
$replacements['Ã¡'] = 'á'
$replacements['Ã©'] = 'é'
$replacements['Ã­'] = 'í'
$replacements['Ã³'] = 'ó'
$replacements['Ãº'] = 'ú'
$replacements['Ã'] = 'Á'
$replacements['Ã‰'] = 'É'
$replacements['Ã'] = 'Í'
$replacements['Ã"'] = 'Ó'
$replacements['Ãš'] = 'Ú'
$replacements['Ã±'] = 'ñ'
$replacements['Ã'] = 'Ñ'
$replacements['Â¿'] = '¿'
$replacements['Â¡'] = '¡'

# 2. Caracteres de reemplazo Unicode (U+FFFD =)
# Nota: Los caracteres de reemplazo se eliminan usando Remove() en lugar de Replace()
$replacementChars = @([char]0xFFFD)  # Caracteres a eliminar

# 3. Secuencias de bytes UTF-8 mal interpretadas (como strings concatenados)
# Cuando UTF-8 se lee como Windows-1252, aparecen como secuencias de 2 caracteres
# á: UTF-8 bytes C3 A1 → Windows-1252: Ã + ¡
$replacements[([char]0xC3).ToString() + ([char]0xA1).ToString()] = 'á'
# é: UTF-8 bytes C3 A9 → Windows-1252: Ã + ©
$replacements[([char]0xC3).ToString() + ([char]0xA9).ToString()] = 'é'
# í: UTF-8 bytes C3 AD → Windows-1252: Ã + 
$replacements[([char]0xC3).ToString() + ([char]0xAD).ToString()] = 'í'
# ó: UTF-8 bytes C3 B3 → Windows-1252: Ã + ³
$replacements[([char]0xC3).ToString() + ([char]0xB3).ToString()] = 'ó'
# ú: UTF-8 bytes C3 BA → Windows-1252: Ã + º
$replacements[([char]0xC3).ToString() + ([char]0xBA).ToString()] = 'ú'
# Á: UTF-8 bytes C3 81 → Windows-1252: Ã + 
$replacements[([char]0xC3).ToString() + ([char]0x81).ToString()] = 'Á'
# É: UTF-8 bytes C3 89 → Windows-1252: Ã + ‰
$replacements[([char]0xC3).ToString() + ([char]0x89).ToString()] = 'É'
# Í: UTF-8 bytes C3 8D → Windows-1252: Ã + 
$replacements[([char]0xC3).ToString() + ([char]0x8D).ToString()] = 'Í'
# Ó: UTF-8 bytes C3 93 → Windows-1252: Ã + "
$replacements[([char]0xC3).ToString() + ([char]0x93).ToString()] = 'Ó'
# Ú: UTF-8 bytes C3 9A → Windows-1252: Ã + š
$replacements[([char]0xC3).ToString() + ([char]0x9A).ToString()] = 'Ú'
# ñ: UTF-8 bytes C3 B1 → Windows-1252: Ã + ±
$replacements[([char]0xC3).ToString() + ([char]0xB1).ToString()] = 'ñ'
# Ñ: UTF-8 bytes C3 91 → Windows-1252: Ã + '
$replacements[([char]0xC3).ToString() + ([char]0x91).ToString()] = 'Ñ'
# ¿: UTF-8 bytes C2 BF → Windows-1252: Â + ¿
$replacements[([char]0xC2).ToString() + ([char]0xBF).ToString()] = '¿'
# ¡: UTF-8 bytes C2 A1 → Windows-1252: Â + ¡
$replacements[([char]0xC2).ToString() + ([char]0xA1).ToString()] = '¡'

# 4. Caracteres especiales adicionales (comillas tipográficas, apostrofes, etc.)
$replacements['â€™'] = "'"  # Apostrophe tipográfico
$replacements['â€œ'] = '"'  # Comilla izquierda
$replacements['â€'] = '"'  # Comilla derecha
$replacements['â€"'] = '—'  # Em dash
$replacements['â€"'] = '–'  # En dash
$replacements['â€¦'] = '...'  # Ellipsis

# 5. Caracteres corruptos adicionales comunes
$replacements['Ã'] = 'ó'  # ó mal codificado
$replacements['Ã'] = 'í'  # í mal codificado
$replacements['Ã'] = 'á'  # á mal codificado
$replacements['Ã'] = 'é'  # é mal codificado
$replacements['Ã'] = 'ú'  # ú mal codificado

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
        
        # Intentar detectar la codificación
        $content = $null
        $encoding = [System.Text.Encoding]::UTF8
        
        # Intentar leer como UTF-8 primero
        try {
            $content = [System.Text.Encoding]::UTF8.GetString($bytes)
        }
        catch {
            # Si falla, intentar como Windows-1252 (común en Windows)
            try {
                $encoding = [System.Text.Encoding]::GetEncoding('Windows-1252')
                $content = $encoding.GetString($bytes)
            }
            catch {
                # Si falla, usar UTF-8 con reemplazo de caracteres
                $utf8WithReplacement = New-Object System.Text.UTF8Encoding $false
                $content = $utf8WithReplacement.GetString($bytes)
            }
        }
        
        $originalContent = $content
        $changed = $false

        # Procesar cada reemplazo (ordenar por longitud descendente para evitar reemplazos parciales)
        # Primero procesar strings más largos, luego caracteres individuales
        $stringKeys = $replacements.Keys | Where-Object { $_ -is [string] } | Sort-Object Length -Descending
        $charKeys = $replacements.Keys | Where-Object { $_ -isnot [string] }
        $sortedKeys = $stringKeys + $charKeys
        
        foreach ($bad in $sortedKeys) {
            if ($null -ne $bad -and $content.Contains($bad)) {
                $replacement = $replacements[$bad]
                if ($null -ne $replacement) {
                    # Si el reemplazo es un string vacío, eliminar el carácter
                    if ($replacement -eq '') {
                        $newContent = $content.Replace($bad, '')
                    } else {
                        $newContent = $content.Replace($bad, $replacement)
                    }
                    if ($newContent -ne $content) {
                        $content = $newContent
                        $changed = $true
                    }
                }
            }
        }
        
        # Eliminar caracteres de reemplazo Unicode (U+FFFD)
        foreach ($char in $replacementChars) {
            if ($content.Contains($char)) {
                $newContent = $content.Replace($char, '')
                if ($newContent -ne $content) {
                    $content = $newContent
                    $changed = $true
                }
            }
        }
        
        # Verificar si realmente cambió algo
        if ($content -ne $originalContent) {
            $changed = $true
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
