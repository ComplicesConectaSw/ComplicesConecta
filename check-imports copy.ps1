param(
    [string]$Path = ".",
    [string]$ReportJson = "imports-report.json",
    [string]$ReportCsv = "imports-report.csv"
)

Write-Host "🔍 Escaneando imports globales en: $Path" -ForegroundColor Cyan

$excludeDirs = @("node_modules", "android", "dist", "build", "coverage", "test-results")

$files = Get-ChildItem -Path $Path -Recurse -Include *.js,*.jsx,*.ts,*.tsx | Where-Object {
    $excludeDirs -notcontains $_.Directory.Name
}

$results = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $imports = Select-String -InputObject $content -Pattern "import\s+.*\s+from\s+[`"'](.+)[`"']" -AllMatches | ForEach-Object {
        $_.Matches.Value
    }

    foreach ($imp in $imports) {
        $vars = ($imp -replace "import|from.+", "") -replace '[\{\}]', '' -split ',' | ForEach-Object { $_.Trim() }

        foreach ($v in $vars) {
            if ($v) {
                $inUse = Select-String -Path $files.FullName -Pattern "\b$([regex]::Escape($v))\b" -SimpleMatch -Quiet
                $results += [PSCustomObject]@{
                    File   = $file.Name
                    Import = $v
                    Used   = if ($inUse) { $true } else { $false }
                }
            }
        }
    }
}

$results | ConvertTo-Json -Depth 3 | Out-File $ReportJson -Encoding UTF8
$results | Export-Csv -Path $ReportCsv -NoTypeInformation -Encoding UTF8

Write-Host "📊 Reporte generado en $ReportJson y $ReportCsv" -ForegroundColor Green
