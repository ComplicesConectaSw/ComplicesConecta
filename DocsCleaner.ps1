# ==============================
# 📚 DOCS CLEANER – Consolidación de Markdown
# ==============================

param(
    [string]$docsPath = "C:\Users\conej\Documents\conecta-social-comunidad-main\docs"
)

function Get-MarkdownGroups {
    param([string]$path)

    # Buscar todos los .md
    $files = Get-ChildItem -Path $path -Recurse -Filter *.md

    # Agrupar por "tema base" (ignora sufijos tipo _1, _202509, etc.)
    $groups = $files | Group-Object {
        $_.BaseName -replace "(_\d{6,8})", "" -replace "(_v?\d+)", ""
    }

    return $groups
}

function Consolidar-Docs {
    param(
        [string]$tema,
        [array]$files
    )

    Write-Host "📑 Consolidando tema: $tema"
    $targetFile = Join-Path $docsPath "${tema}_consolidated.md"

    # Crear header del consolidado
    "# 📊 Consolidado $tema" | Out-File $targetFile -Encoding UTF8
    "🔄 Generado el: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File $targetFile -Append -Encoding UTF8
    "`n---`n" | Out-File $targetFile -Append -Encoding UTF8

    foreach ($f in $files) {
        Write-Host "   ➕ Añadiendo $($f.Name)..."
        "## Fuente: $($f.Name)" | Out-File $targetFile -Append -Encoding UTF8
        Get-Content $f.FullName | Out-File $targetFile -Append -Encoding UTF8
        "`n---`n" | Out-File $targetFile -Append -Encoding UTF8
    }

    Write-Host "✅ Consolidado creado en: $targetFile"

    # Preguntar si archivar los originales
    $choice = Read-Host "¿Quieres mover los originales a /docs/archive/? (S/N)"
    if ($choice -eq "S") {
        $archivePath = Join-Path $docsPath "archive"
        if (-not (Test-Path $archivePath)) {
            New-Item -ItemType Directory -Path $archivePath | Out-Null
        }
        foreach ($f in $files) {
            Move-Item $f.FullName -Destination $archivePath
        }
        Write-Host "📦 Archivos originales movidos a /docs/archive/"
    } else {
        Write-Host "⏭️ Originales mantenidos en su lugar."
    }
}

# ==============================
# 🚀 MAIN
# ==============================
Write-Host "=============================="
Write-Host "   📚 DOCS CLEANER"
Write-Host "=============================="
Write-Host "📂 Escaneando en: $docsPath"

$groups = Get-MarkdownGroups -path $docsPath

foreach ($g in $groups) {
    if ($g.Count -gt 1) {
        Write-Host "`n⚠️ Se encontraron múltiples archivos para el tema: $($g.Name)"
        $g.Group | ForEach-Object { Write-Host " - $($_.Name)" }

        $choice = Read-Host "¿Quieres consolidar estos archivos en uno solo? (S/N)"
        if ($choice -eq "S") {
            Consolidar-Docs -tema $g.Name -files $g.Group
        } else {
            Write-Host "⏭️ Saltando tema $($g.Name)"
        }
    }
}

Write-Host "`n✅ Escaneo y consolidación completados."
