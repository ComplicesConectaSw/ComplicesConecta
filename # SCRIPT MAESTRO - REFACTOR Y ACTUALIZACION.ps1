# SCRIPT MAESTRO - REFACTOR Y ACTUALIZACIÓN COMPLETA
# ComplicesConecta v3.6.3
# Consolida todos los scripts de refactorización y actualización

param(
    [switch]$All,
    [switch]$Move,
    [switch]$UpdateImports,
    [switch]$Audit,
    [switch]$FixCSS,
    [switch]$CreateMaster
)

$ErrorActionPreference = "Continue"

function Show-Menu {
    Write-Host "`n=== SCRIPT MAESTRO - REFACTOR Y ACTUALIZACION ===" -ForegroundColor Cyan
    Write-Host "1. Mover archivos a estructura nueva" -ForegroundColor Yellow
    Write-Host "2. Actualizar todos los imports" -ForegroundColor Yellow
    Write-Host "3. Auditoría completa del proyecto" -ForegroundColor Yellow
    Write-Host "4. Analizar y corregir CSS" -ForegroundColor Yellow
    Write-Host "5. Crear archivo maestro de imports" -ForegroundColor Yellow
    Write-Host "6. Ejecutar todo (1-5)" -ForegroundColor Green
    Write-Host "0. Salir" -ForegroundColor Red
    Write-Host ""
}

function Move-FilesToStructure {
    Write-Host "`n=== MOVIENDO ARCHIVOS A ESTRUCTURA NUEVA ===" -ForegroundColor Cyan
    
    # 1. Mover archivos Admin
    Write-Host "`n1. Moviendo archivos Admin..." -ForegroundColor Yellow
    $adminFiles = @(
        "src/pages/Admin.tsx", "src/pages/AdminProduction.tsx", "src/pages/AdminPartners.tsx",
        "src/pages/AdminModerators.tsx", "src/pages/AdminDashboard.tsx",
        "src/pages/AdminCareerApplications.tsx", "src/pages/AdminAnalytics.tsx"
    )
    foreach ($file in $adminFiles) {
        if (Test-Path $file) {
            $dest = "src/app/(admin)/$(Split-Path $file -Leaf)"
            Move-Item $file $dest -Force -ErrorAction SilentlyContinue
            Write-Host "  Movido: $(Split-Path $file -Leaf) -> app/(admin)/" -ForegroundColor Green
        }
    }
    
    # 2. Mover archivos Clubs
    Write-Host "`n2. Moviendo archivos Clubs..." -ForegroundColor Yellow
    if (Test-Path "src/pages/Clubs.tsx") {
        Move-Item "src/pages/Clubs.tsx" "src/app/(clubs)/Clubs.tsx" -Force -ErrorAction SilentlyContinue
        Write-Host "  Movido: Clubs.tsx -> app/(clubs)/" -ForegroundColor Green
    }
    
    # 3. Mover archivos Discover
    Write-Host "`n3. Moviendo archivos Discover..." -ForegroundColor Yellow
    if (Test-Path "src/pages/Discover.tsx") {
        Move-Item "src/pages/Discover.tsx" "src/app/(discover)/Discover.tsx" -Force -ErrorAction SilentlyContinue
        Write-Host "  Movido: Discover.tsx -> app/(discover)/" -ForegroundColor Green
    }
    
    # 4. Mover archivos Auth
    Write-Host "`n4. Moviendo archivos Auth..." -ForegroundColor Yellow
    if (Test-Path "src/pages/Auth.tsx") {
        Move-Item "src/pages/Auth.tsx" "src/app/(auth)/Auth.tsx" -Force -ErrorAction SilentlyContinue
        Write-Host "  Movido: Auth.tsx -> app/(auth)/" -ForegroundColor Green
    }
    
    # 5. Mover archivos a Features
    Write-Host "`n5. Moviendo archivos a Features..." -ForegroundColor Yellow
    $authFiles = @(
        @{ Source = 'src/hooks/useAuth.ts'; Dest = 'src/features/auth/useAuth.ts' },
        @{ Source = 'src/hooks/useBiometricAuth.ts'; Dest = 'src/features/auth/useBiometricAuth.ts' }
    )
    foreach ($file in $authFiles) {
        if (Test-Path $file.Source) {
            $destDir = Split-Path $file.Dest -Parent
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
            Move-Item $file.Source $file.Dest -Force -ErrorAction SilentlyContinue
            Write-Host "  Movido: $(Split-Path $file.Source -Leaf) -> features/auth/" -ForegroundColor Green
        }
    }
    
    $profileFiles = @(
        @{ Source = 'src/hooks/useProfileQuery.ts'; Dest = 'src/features/profile/useProfileQuery.ts' },
        @{ Source = 'src/hooks/useProfileCache.ts'; Dest = 'src/features/profile/useProfileCache.ts' },
        @{ Source = 'src/hooks/useCoupleProfile.ts'; Dest = 'src/features/profile/useCoupleProfile.ts' },
        @{ Source = 'src/hooks/useProfileTheme.ts'; Dest = 'src/features/profile/useProfileTheme.ts' },
        @{ Source = 'src/services/CoupleProfilesService.ts'; Dest = 'src/features/profile/CoupleProfilesService.ts' },
        @{ Source = 'src/services/ProfileReportService.ts'; Dest = 'src/features/profile/ProfileReportService.ts' },
        @{ Source = 'src/lib/coupleProfiles.ts'; Dest = 'src/features/profile/coupleProfiles.ts' },
        @{ Source = 'src/lib/coupleProfilesCompatibility.ts'; Dest = 'src/features/profile/coupleProfilesCompatibility.ts' }
    )
    foreach ($file in $profileFiles) {
        if (Test-Path $file.Source) {
            $destDir = Split-Path $file.Dest -Parent
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
            Move-Item $file.Source $file.Dest -Force -ErrorAction SilentlyContinue
            Write-Host "  Movido: $(Split-Path $file.Source -Leaf) -> features/profile/" -ForegroundColor Magenta
        }
    }
    
    if (Test-Path "src/services/clubFlyerImageProcessing.ts") {
        New-Item -ItemType Directory -Force -Path "src/features/clubs" | Out-Null
        Move-Item "src/services/clubFlyerImageProcessing.ts" "src/features/clubs/clubFlyerImageProcessing.ts" -Force -ErrorAction SilentlyContinue
        Write-Host "  Movido: clubFlyerImageProcessing.ts -> features/clubs/" -ForegroundColor Cyan
    }
    
    $chatFiles = @(
        @{ Source = 'src/hooks/useRealtimeChat.ts'; Dest = 'src/features/chat/useRealtimeChat.ts' },
        @{ Source = 'src/hooks/useVideoChat.ts'; Dest = 'src/features/chat/useVideoChat.ts' },
        @{ Source = 'src/hooks/ai/useChatSummary.ts'; Dest = 'src/features/chat/useChatSummary.ts' },
        @{ Source = 'src/services/ChatPrivacyService.ts'; Dest = 'src/features/chat/ChatPrivacyService.ts' },
        @{ Source = 'src/services/ai/ChatSummaryService.ts'; Dest = 'src/features/chat/ChatSummaryService.ts' }
    )
    New-Item -ItemType Directory -Force -Path "src/features/chat" | Out-Null
    foreach ($file in $chatFiles) {
        if (Test-Path $file.Source) {
            Move-Item $file.Source $file.Dest -Force -ErrorAction SilentlyContinue
            Write-Host "  Movido: $(Split-Path $file.Source -Leaf) -> features/chat/" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nOK: Archivos movidos correctamente" -ForegroundColor Green
}

function Update-AllImports {
    Write-Host "`n=== ACTUALIZANDO TODOS LOS IMPORTS ===" -ForegroundColor Cyan
    
    $archivos = Get-ChildItem "src" -Recurse -File | Where-Object { $_.Extension -match '\.(tsx|ts)$' -and $_.FullName -notmatch 'node_modules|dist|build' }
    
    $reemplazos = @(
        # App imports
        @{ Viejo = '@/pages/Admin'; Nuevo = '@/app/(admin)/Admin' },
        @{ Viejo = '@/pages/AdminProduction'; Nuevo = '@/app/(admin)/AdminProduction' },
        @{ Viejo = '@/pages/AdminPartners'; Nuevo = '@/app/(admin)/AdminPartners' },
        @{ Viejo = '@/pages/AdminModerators'; Nuevo = '@/app/(admin)/AdminModerators' },
        @{ Viejo = '@/pages/AdminDashboard'; Nuevo = '@/app/(admin)/AdminDashboard' },
        @{ Viejo = '@/pages/AdminCareerApplications'; Nuevo = '@/app/(admin)/AdminCareerApplications' },
        @{ Viejo = '@/pages/AdminAnalytics'; Nuevo = '@/app/(admin)/AdminAnalytics' },
        @{ Viejo = '@/pages/Clubs'; Nuevo = '@/app/(clubs)/Clubs' },
        @{ Viejo = '@/pages/Discover'; Nuevo = '@/app/(discover)/Discover' },
        @{ Viejo = '@/pages/Auth'; Nuevo = '@/app/(auth)/Auth' },
        
        # Features imports
        @{ Viejo = '@/hooks/useAuth'; Nuevo = '@/features/auth/useAuth' },
        @{ Viejo = '@/hooks/useBiometricAuth'; Nuevo = '@/features/auth/useBiometricAuth' },
        @{ Viejo = '@/hooks/useProfileQuery'; Nuevo = '@/features/profile/useProfileQuery' },
        @{ Viejo = '@/hooks/useProfileCache'; Nuevo = '@/features/profile/useProfileCache' },
        @{ Viejo = '@/hooks/useCoupleProfile'; Nuevo = '@/features/profile/useCoupleProfile' },
        @{ Viejo = '@/hooks/useProfileTheme'; Nuevo = '@/features/profile/useProfileTheme' },
        @{ Viejo = '@/hooks/useRealtimeChat'; Nuevo = '@/features/chat/useRealtimeChat' },
        @{ Viejo = '@/hooks/useVideoChat'; Nuevo = '@/features/chat/useVideoChat' },
        @{ Viejo = '@/hooks/ai/useChatSummary'; Nuevo = '@/features/chat/useChatSummary' },
        @{ Viejo = '@/services/CoupleProfilesService'; Nuevo = '@/features/profile/CoupleProfilesService' },
        @{ Viejo = '@/services/ProfileReportService'; Nuevo = '@/features/profile/ProfileReportService' },
        @{ Viejo = '@/services/ChatPrivacyService'; Nuevo = '@/features/chat/ChatPrivacyService' },
        @{ Viejo = '@/services/clubFlyerImageProcessing'; Nuevo = '@/features/clubs/clubFlyerImageProcessing' },
        @{ Viejo = '@/services/ai/ChatSummaryService'; Nuevo = '@/features/chat/ChatSummaryService' },
        @{ Viejo = '@/lib/coupleProfiles'; Nuevo = '@/features/profile/coupleProfiles' },
        @{ Viejo = '@/lib/coupleProfilesCompatibility'; Nuevo = '@/features/profile/coupleProfilesCompatibility' },
        
        # Profiles imports
        @{ Viejo = '@/pages/ProfileSingle'; Nuevo = '@/profiles/single/ProfileSingle' },
        @{ Viejo = '@/pages/EditProfileSingle'; Nuevo = '@/profiles/single/EditProfileSingle' },
        @{ Viejo = '@/pages/ProfileCouple'; Nuevo = '@/profiles/couple/ProfileCouple' },
        @{ Viejo = '@/pages/EditProfileCouple'; Nuevo = '@/profiles/couple/EditProfileCouple' },
        @{ Viejo = '@/pages/Profiles'; Nuevo = '@/profiles/shared/Profiles' },
        @{ Viejo = '@/pages/ProfileDetail'; Nuevo = '@/profiles/shared/ProfileDetail' },
        
        # Shared/UI imports
        @{ Viejo = '@/components/ui/button'; Nuevo = '@/shared/ui/Button' },
        @{ Viejo = '@/components/ui/card'; Nuevo = '@/shared/ui/Card' },
        @{ Viejo = '@/components/ui/input'; Nuevo = '@/shared/ui/Input' },
        @{ Viejo = '@/components/ui/dialog'; Nuevo = '@/shared/ui/Modal' },
        @{ Viejo = '@/lib/utils'; Nuevo = '@/shared/lib/cn' },
        
        # Hooks unificados
        @{ Viejo = '@/shared/hooks/useGeolocation'; Nuevo = '@/hooks/useGeolocation' },
        @{ Viejo = '@/shared/hooks/usePersistedState'; Nuevo = '@/hooks/usePersistedState' },
        @{ Viejo = '@/shared/hooks/useIsomorphicLayoutEffect'; Nuevo = '@/hooks/useIsomorphicLayoutEffect' },
        @{ Viejo = '@/shared/hooks/useToast'; Nuevo = '@/hooks/useToast' },
        @{ Viejo = '@/hooks/use-toast'; Nuevo = '@/hooks/useToast' },
        
        # Entities
        @{ Viejo = '@/types/user'; Nuevo = '@/entities/user' },
        @{ Viejo = '@/types/profile'; Nuevo = '@/entities/profile' },
        @{ Viejo = '@/types/club'; Nuevo = '@/entities/club' }
    )
    
    $actualizados = 0
    foreach ($archivo in $archivos) {
        $contenido = Get-Content $archivo.FullName -Raw -ErrorAction SilentlyContinue
        if ($null -eq $contenido) { continue }
        
        $modificado = $false
        $nuevoContenido = $contenido
        
        foreach ($reemplazo in $reemplazos) {
            if ($nuevoContenido -match [regex]::Escape($reemplazo.Viejo)) {
                $nuevoContenido = $nuevoContenido -replace [regex]::Escape($reemplazo.Viejo), $reemplazo.Nuevo
                $modificado = $true
            }
        }
        
        if ($modificado) {
            Set-Content $archivo.FullName -Value $nuevoContenido -NoNewline -Encoding UTF8
            $actualizados++
        }
    }
    
    Write-Host "`nOK: Archivos actualizados: $actualizados" -ForegroundColor Green
}

function Start-Audit {
    Write-Host "`n=== AUDITORIA COMPLETA DEL PROYECTO ===" -ForegroundColor Cyan
    
    $report = @{
        Duplicados = @()
        ImportsIncorrectos = @()
        ArchivosFaltantes = @()
        DirectoriosVacios = @()
    }
    
    # Buscar duplicados
    Write-Host "`n1. Buscando archivos duplicados..." -ForegroundColor Yellow
    $allFiles = Get-ChildItem "src" -Recurse -File | Where-Object { 
        $_.Extension -match '\.(ts|tsx|css)$' -and $_.FullName -notmatch 'node_modules|dist|build' 
    }
    $filesByName = $allFiles | Group-Object Name
    $duplicados = $filesByName | Where-Object { $_.Count -gt 1 }
    
    if ($duplicados.Count -gt 0) {
        Write-Host "  Duplicados encontrados: $($duplicados.Count)" -ForegroundColor Red
        foreach ($dup in $duplicados) {
            $mensaje = '    ' + $dup.Name + ' (' + $dup.Count + ' copias)'
            Write-Host $mensaje -ForegroundColor Yellow
            $report.Duplicados += $dup.Name
        }
    } else {
        Write-Host '  No se encontraron duplicados' -ForegroundColor Green
    }
    
    # Buscar directorios vacíos
    Write-Host "`n2. Buscando directorios vacios..." -ForegroundColor Yellow
    $allDirs = Get-ChildItem "src" -Recurse -Directory | Where-Object { 
        $_.FullName -notmatch 'node_modules|dist|build|\.git' 
    }
    foreach ($dir in $allDirs) {
        $files = Get-ChildItem $dir.FullName -Recurse -File | Where-Object { 
            $_.Extension -match '\.(ts|tsx|css)$' 
        }
        if ($files.Count -eq 0) {
            $relPath = $dir.FullName.Replace($PWD.Path + '\', '')
            Write-Host "  Vacio: $relPath" -ForegroundColor Yellow
            $report.DirectoriosVacios += $relPath
        }
    }
    
    # Verificar imports incorrectos
    Write-Host "`n3. Verificando imports incorrectos..." -ForegroundColor Yellow
    $importPatterns = @(
        @{ Pattern = '@/pages/(Admin|Clubs|Discover|Auth)'; Correcto = '@/app/' },
        @{ Pattern = '@/hooks/useAuth'; Correcto = '@/features/auth/useAuth' },
        @{ Pattern = '@/components/ui/button'; Correcto = '@/shared/ui/Button' },
        @{ Pattern = '@/lib/utils'; Correcto = '@/shared/lib/cn' }
    )
    
    $tsFiles = $allFiles | Where-Object { $_.Extension -match '\.(ts|tsx)$' }
    foreach ($file in $tsFiles) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            foreach ($pattern in $importPatterns) {
                if ($content -match $pattern.Pattern) {
                    $relPath = $file.FullName.Replace($PWD.Path + '\', '')
                    $report.ImportsIncorrectos += @{
                        Archivo = $relPath
                        ImportIncorrecto = $pattern.Pattern
                        ImportCorrecto = $pattern.Correcto
                    }
                }
            }
        }
    }
    
    if ($report.ImportsIncorrectos.Count -gt 0) {
        Write-Host "  Imports incorrectos encontrados: $($report.ImportsIncorrectos.Count)" -ForegroundColor Red
    } else {
        Write-Host "  No se encontraron imports incorrectos" -ForegroundColor Green
    }
    
    # Guardar reporte
    $reportPath = "docs/AUDITORIA_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    New-Item -ItemType Directory -Force -Path "docs" | Out-Null
    $report | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding UTF8
    Write-Host "`nReporte guardado en: $reportPath" -ForegroundColor Green
}

function Repair-CSS {
    Write-Host "`n=== ANALIZANDO Y CORRIGIENDO CSS ===" -ForegroundColor Cyan
    
    if (Test-Path "src/styles/ui-fixes-consolidated.css") {
        $uiFixes = Get-Content "src/styles/ui-fixes-consolidated.css" -Raw
        
        # Buscar -webkit-line-clamp sin line-clamp estándar
        $lineClampMatches = [regex]::Matches($uiFixes, '-webkit-line-clamp:\s*\d+', [System.Text.RegularExpressions.RegexOptions]::Multiline)
        if ($lineClampMatches.Count -gt 0) {
            Write-Host "  Verificando $($lineClampMatches.Count) ocurrencias de -webkit-line-clamp..." -ForegroundColor Gray
            $corregidos = 0
            foreach ($match in $lineClampMatches) {
                $startIndex = [Math]::Max(0, $match.Index - 50)
                $length = [Math]::Min(200, $uiFixes.Length - $startIndex)
                if ($length -gt 0) {
                    $contexto = $uiFixes.Substring($startIndex, $length)
                    if ($contexto -notmatch 'line-clamp:\s*\d+') {
                        $valor = $match.Value -replace '-webkit-line-clamp:\s*(\d+)', '$1'
                        $nuevo = $match.Value + "`n    line-clamp: $valor;"
                        $uiFixes = $uiFixes.Substring(0, $match.Index) + $nuevo + $uiFixes.Substring($match.Index + $match.Length)
                        $corregidos++
                    }
                }
            }
            if ($corregidos -gt 0) {
                $cssPath = "src/styles/ui-fixes-consolidated.css"
                Set-Content -Path $cssPath -Value $uiFixes -NoNewline -Encoding UTF8
                Write-Host "  Corregidos: $corregidos" -ForegroundColor Green
            }
        }
    }
    
    Write-Host "`nOK: CSS verificado y corregido" -ForegroundColor Green
}

function New-MasterImports {
    Write-Host "`n=== CREANDO ARCHIVO MAESTRO DE IMPORTS ===" -ForegroundColor Cyan
    
    $masterContent = @'
// src/lib/index.ts - ARCHIVO MAESTRO DE IMPORTS
// USO: import { Button, Card, useAuth } from '@/lib'

// UI
export * from '@/shared/ui/Button';
export * from '@/shared/ui/Card';
export * from '@/shared/ui/Input';
export * from '@/shared/ui/Modal';

// Hooks compartidos
export * from '@/hooks/useGeolocation';
export * from '@/hooks/usePersistedState';
export * from '@/hooks/useIsomorphicLayoutEffect';
export * from '@/hooks/useToast';

// Utils
export * from '@/shared/lib/cn';
export * from '@/shared/lib/format';
export * from '@/shared/lib/validation';

// Entities
export * from '@/entities/user';
export * from '@/entities/profile';
export * from '@/entities/club';
'@
    
    New-Item -ItemType Directory -Force -Path "src/lib" | Out-Null
    Set-Content -Path "src/lib/index.ts" -Value $masterContent -NoNewline -Encoding UTF8
    Write-Host "`nOK: Archivo maestro creado en src/lib/index.ts" -ForegroundColor Green
}

# Ejecución principal
if ($All) {
    Move-FilesToStructure
    Update-AllImports
    Run-Audit
    Fix-CSS
    Create-MasterImports
    Write-Host "`n=== PROCESO COMPLETO ===" -ForegroundColor Cyan
} elseif ($Move) {
    Move-FilesToStructure
} elseif ($UpdateImports) {
    Update-AllImports
} elseif ($Audit) {
    Run-Audit
} elseif ($FixCSS) {
    Fix-CSS
} elseif ($CreateMaster) {
    Create-MasterImports
} else {
    # Modo interactivo
    do {
        Show-Menu
        $opcion = Read-Host "Selecciona una opción"
        
        switch ($opcion) {
            "1" { Move-FilesToStructure; Read-Host "Presiona Enter para continuar" }
            "2" { Update-AllImports; Read-Host "Presiona Enter para continuar" }
            "3" { Run-Audit; Read-Host "Presiona Enter para continuar" }
            "4" { Fix-CSS; Read-Host "Presiona Enter para continuar" }
            "5" { Create-MasterImports; Read-Host "Presiona Enter para continuar" }
            "6" { 
                Move-FilesToStructure
                Update-AllImports
                Run-Audit
                Fix-CSS
                Create-MasterImports
                Write-Host "`n=== PROCESO COMPLETO ===" -ForegroundColor Cyan
                Read-Host "Presiona Enter para continuar"
            }
            "0" { exit 0 }
            default { Write-Host "Opcion invalida" -ForegroundColor Red }
        }
    } while ($true)
}

