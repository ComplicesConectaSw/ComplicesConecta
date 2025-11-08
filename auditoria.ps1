# AUDITORIA COMPLETA v3.6.3 - RAPIDA Y SEGURA - 08 Nov 2025
$root = Get-Location
$report = @()
$startTime = Get-Date

Write-Host "INICIANDO AUDITORIA..." -ForegroundColor White -BackgroundColor DarkBlue

# EXCLUIR CARPETAS PESADAS
$exclude = @("node_modules", ".git", "build", "dist", "android", "ios", "public")
$allItems = Get-ChildItem -Path $root -Recurse -Force -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch ($exclude -join "|")
}
$dirs = $allItems | Where-Object { $_.PSIsContainer }
$files = $allItems | Where-Object { -not $_.PSIsContainer }

$report += "# AUDITORIA COMPLETA v3.6.3"
$report += "- Fecha: $(Get-Date -Format 'dd MMM yyyy HH:mm')"
$report += "- Ruta: $root`n"

$report += "## 1. ESTRUCTURA (excluye node_modules, .git, etc.)"
$report += "- Directorios: $($dirs.Count)"
$report += "- Archivos: $($files.Count)`n"

# DIRECTORIOS VACIOS
$emptyDirs = $dirs | Where-Object {
    $c = Get-ChildItem $_.FullName -Force -ErrorAction SilentlyContinue
    $c.Count -eq 0 -or ($c | Where-Object { $_.Name -notmatch '^\.' }).Count -eq 0
}
$report += "## DIRECTORIOS VACIOS ($($emptyDirs.Count))"
foreach ($d in $emptyDirs) { $report += "- $($d.FullName.Replace($root,''))" }

# DUPLICADOS
$dupes = @()
$g = $files | Group-Object Name | Where-Object Count -gt 1
foreach ($group in $g) {
    $s = $group.Group.Length | Sort-Object -Unique
    if ($s.Count -eq 1) { $dupes += $group.Name }
}
$report += "`n## DUPLICADOS ($($dupes.Count))"
foreach ($n in $dupes) {
    $g = $files | Where-Object Name -eq $n
    $report += "- $n ($($g[0].Length) bytes)"
    foreach ($f in $g) { $report += "  -> $($f.FullName.Replace($root,''))" }
}

# IMPORTS ROTOS (solo src/)
$importErrors = @()
$ts = $files | Where-Object { $_.FullName -like "*\src\*" -and $_.Extension -match 'ts|tsx' }
foreach ($f in $ts) {
    $c = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
    if (!$c) { continue }
    $l = $c -split "`n"
    for ($i = 0; $i -lt $l.Count; $i++) {
        $line = $l[$i]
        if ($line -match "from ['""](.+?)['""]") {
            $p = $matches[1]
            if ($p -match '^(\./|\.\./|@/)' -and $p -notmatch 'react|next|supabase') {
                $r = Join-Path $f.DirectoryName $p
                $r = [IO.Path]::GetFullPath($r)
                if (-not (Test-Path ($r + ".*"))) {
                    $importErrors += "- $($f.Name):$($i+1) -> '$p'"
                }
            }
        }
    }
}
$report += "`n## IMPORTS ROTOS (solo src/) ($($importErrors.Count))"
$report += $importErrors

# DEPENDENCIAS
$missing = @()
if (Test-Path "package.json") {
    $json = Get-Content "package.json" | ConvertFrom-Json
    $req = @()
    if ($json.dependencies) { $req += $json.dependencies.PSObject.Properties.Name }
    if ($json.devDependencies) { $req += $json.devDependencies.PSObject.Properties.Name }
    $nm = if (Test-Path "node_modules") { (Get-ChildItem "node_modules" -Directory -ErrorAction SilentlyContinue).Name } else { @() }
    $missing = $req | Where-Object { $nm -notcontains $_ }
}
$report += "`n## DEPENDENCIAS FALTANTES ($($missing.Count))"
$report += $missing

# ANDROID
$androidIssues = @()
if (-not (Test-Path "android")) { $androidIssues += "FALTA android/" }
if (-not (Test-Path "capacitor.config.ts")) { $androidIssues += "FALTA capacitor.config.ts" }
$report += "`n## ANDROID ($($androidIssues.Count))"
$report += $androidIssues

# FINAL
$endTime = Get-Date
$duration = ($endTime - $startTime).ToString("mm\:ss")
$report += "`n## RESUMEN"
$report += "- Duracion: $duration"
$report += "- Vacios: $($emptyDirs.Count)"
$report += "- Duplicados: $($dupes.Count)"
$report += "- Imports rotos: $($importErrors.Count)"
$report += "- Deps faltantes: $($missing.Count)"

# GUARDAR
$ts = Get-Date -Format "yyyyMMdd_HHmm"
$path = "AUDITORIA_v3.6.3_$ts.md"
$report | Out-File -FilePath $path -Encoding UTF8
Write-Host "`nREPORTE GUARDADO: $path" -ForegroundColor Green -BackgroundColor Black
Write-Host "DURACION: $duration" -ForegroundColor White -BackgroundColor DarkGreen