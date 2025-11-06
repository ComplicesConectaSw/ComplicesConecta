# ============================================================================
# Script Maestro: Gestión Unificada de Proyecto
# Versión: 3.5.0
# Descripción: Script consolidado con menú interactivo para todas las operaciones
# ============================================================================

param(
    [string]$Action = ""
)

$ErrorActionPreference = "Stop"

# Colores
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Show-Menu {
    Write-ColorOutput "
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     🎯 SCRIPT MAESTRO - ComplicesConecta v3.5.0                   ║
║     Gestión Unificada del Proyecto                                 ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
" "Cyan"

    Write-ColorOutput "
📋 MENÚ PRINCIPAL
" "Yellow"
    Write-ColorOutput "1️⃣  Validación del Proyecto" "White"
    Write-ColorOutput "   • Linting, Type-check, Seguridad, Null checks, Tablas" "Gray"
    Write-ColorOutput ""
    Write-ColorOutput "2️⃣  Gestión de Base de Datos" "White"
    Write-ColorOutput "   • Sincronizar BD local/remota, Regenerar tipos" "Gray"
    Write-ColorOutput ""
    Write-ColorOutput "3️⃣  Gestión de Ramas Git" "White"
    Write-ColorOutput "   • Comparar ramas, Eliminar ramas innecesarias" "Gray"
    Write-ColorOutput ""
    Write-ColorOutput "4️⃣  Auditoría y Seguridad" "White"
    Write-ColorOutput "   • Auditoría completa, Verificación de seguridad" "Gray"
    Write-ColorOutput ""
    Write-ColorOutput "5️⃣  Testing y Calidad" "White"
    Write-ColorOutput "   • Tests robustos, Lint robusto, Type-check robusto" "Gray"
    Write-ColorOutput ""
    Write-ColorOutput "6️⃣  Utilidades" "White"
    Write-ColorOutput "   • Limpiar docs obsoletos, Verificar tokens" "Gray"
    Write-ColorOutput ""
    Write-ColorOutput "7️⃣  Migraciones" "White"
    Write-ColorOutput "   • Aplicar migraciones remotas, Verificar alineación" "Gray"
    Write-ColorOutput ""
    Write-ColorOutput "8️⃣  Ejecutar Todo en Orden" "Cyan"
    Write-ColorOutput "   • Ejecuta todas las validaciones y verificaciones secuencialmente" "Gray"
    Write-ColorOutput ""
    Write-ColorOutput "0️⃣  Salir" "White"
    Write-ColorOutput ""
}

function Invoke-Validation {
    Write-ColorOutput "🔍 Ejecutando validación completa del proyecto..." "Yellow"
    & "$PSScriptRoot\validate-project-unified.ps1"
}

function Invoke-DatabaseSync {
    Write-ColorOutput "🔄 Gestión de Base de Datos" "Yellow"
    Write-ColorOutput ""
    Write-ColorOutput "1. Sincronizar BD Local y Remota" "White"
    Write-ColorOutput "2. Regenerar Tipos Supabase" "White"
    Write-ColorOutput "3. Verificar Alineación de Tablas" "White"
    Write-ColorOutput "0. Volver" "White"
    Write-ColorOutput ""
    $choice = Read-Host "Selecciona una opción"
    
    switch ($choice) {
        "1" { & "$PSScriptRoot\sync-databases.ps1" }
        "2" { & "$PSScriptRoot\regenerate-supabase-types.ps1" -UpdateMain }
        "3" { & "$PSScriptRoot\verificar-alineacion-tablas.ps1" }
        "0" { return }
        default { Write-ColorOutput "Opción inválida" "Red" }
    }
}

function Invoke-BranchManagement {
    Write-ColorOutput "🌿 Gestión de Ramas Git" "Yellow"
    Write-ColorOutput ""
    Write-ColorOutput "1. Comparar Ramas" "White"
    Write-ColorOutput "2. Eliminar Ramas Innecesarias" "White"
    Write-ColorOutput "0. Volver" "White"
    Write-ColorOutput ""
    $choice = Read-Host "Selecciona una opción"
    
    switch ($choice) {
        "1" { & "$PSScriptRoot\compare-branches.ps1" }
        "2" { & "$PSScriptRoot\delete-unnecessary-branches.ps1" }
        "0" { return }
        default { Write-ColorOutput "Opción inválida" "Red" }
    }
}

function Invoke-AuditSecurity {
    Write-ColorOutput "🔒 Auditoría y Seguridad" "Yellow"
    Write-ColorOutput ""
    Write-ColorOutput "1. Auditoría Completa del Proyecto" "White"
    Write-ColorOutput "2. Verificación de Seguridad" "White"
    Write-ColorOutput "3. Verificar Progreso de Seguridad" "White"
    Write-ColorOutput "4. Verificar Tokens" "White"
    Write-ColorOutput "0. Volver" "White"
    Write-ColorOutput ""
    $choice = Read-Host "Selecciona una opción"
    
    switch ($choice) {
        "1" { npm run audit:repo }
        "2" { npm run security:scan }
        "3" { npm run security:progress }
        "4" { npm run token:verify }
        "0" { return }
        default { Write-ColorOutput "Opción inválida" "Red" }
    }
}

function Invoke-Testing {
    Write-ColorOutput "🧪 Testing y Calidad" "Yellow"
    Write-ColorOutput ""
    Write-ColorOutput "1. Test Lint Robusto" "White"
    Write-ColorOutput "2. Test Type-Check Robusto" "White"
    Write-ColorOutput "3. Tests Completos (Vitest)" "White"
    Write-ColorOutput "4. Tests E2E (Playwright)" "White"
    Write-ColorOutput "5. Debug Tests (con debugger)" "White"
    Write-ColorOutput "6. Comprehensive Test Suite" "White"
    Write-ColorOutput "0. Volver" "White"
    Write-ColorOutput ""
    $choice = Read-Host "Selecciona una opción"
    
    switch ($choice) {
        "1" { npm run test:lint-robust }
        "2" { npm run test:type-robust }
        "3" { npm run test:run }
        "4" { npm run test:e2e }
        "5" { node scripts/debug-tests.js }
        "6" { node scripts/comprehensive-test.mjs }
        "0" { return }
        default { Write-ColorOutput "Opción inválida" "Red" }
    }
}

function Invoke-Utilities {
    Write-ColorOutput "🛠️  Utilidades" "Yellow"
    Write-ColorOutput ""
    Write-ColorOutput "1. Limpiar Documentación Obsoleta" "White"
    Write-ColorOutput "2. Verificar Tipos Supabase" "White"
    Write-ColorOutput "3. Verificar Imports" "White"
    Write-ColorOutput "4. Reemplazar console.log con logger" "White"
    Write-ColorOutput "0. Volver" "White"
    Write-ColorOutput ""
    $choice = Read-Host "Selecciona una opción"
    
    switch ($choice) {
        "1" { & "$PSScriptRoot\cleanup-obsolete-docs.ps1" }
        "2" { npm run validate:types }
        "3" { & "$PSScriptRoot\check-imports.ps1" }
        "4" { node scripts/replace-console-logs.js }
        "0" { return }
        default { Write-ColorOutput "Opción inválida" "Red" }
    }
}

function Invoke-RunAll {
    Write-ColorOutput "
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     🚀 EJECUTANDO TODAS LAS VALIDACIONES EN ORDEN                 ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
" "Cyan"
    
    $startTime = Get-Date
    $results = @{
        Validation = $false
        DatabaseSync = $false
        Types = $false
        Security = $false
        Testing = $false
    }
    
    try {
        # 1. Validación del Proyecto
        Write-ColorOutput "`n📋 PASO 1/5: Validación del Proyecto" "Yellow"
        Write-ColorOutput "════════════════════════════════════════" "Gray"
        try {
            & "$PSScriptRoot\validate-project-unified.ps1"
            $results.Validation = $true
            Write-ColorOutput "✅ Validación completada" "Green"
        } catch {
            Write-ColorOutput "❌ Error en validación: $_" "Red"
        }
        Write-ColorOutput ""
        
        # 2. Verificar Tipos Supabase
        Write-ColorOutput "📋 PASO 2/5: Verificar Tipos Supabase" "Yellow"
        Write-ColorOutput "════════════════════════════════════════" "Gray"
        try {
            npm run validate:types 2>&1 | Out-Null
            $results.Types = $true
            Write-ColorOutput "✅ Tipos verificados" "Green"
        } catch {
            Write-ColorOutput "❌ Error verificando tipos: $_" "Red"
        }
        Write-ColorOutput ""
        
        # 3. Auditoría de Seguridad
        Write-ColorOutput "📋 PASO 3/5: Auditoría de Seguridad" "Yellow"
        Write-ColorOutput "════════════════════════════════════════" "Gray"
        try {
            npm run security:scan 2>&1 | Out-Null
            $results.Security = $true
            Write-ColorOutput "✅ Auditoría de seguridad completada" "Green"
        } catch {
            Write-ColorOutput "⚠️  Advertencias en seguridad (revisar manualmente)" "Yellow"
        }
        Write-ColorOutput ""
        
        # 4. Testing
        Write-ColorOutput "📋 PASO 4/5: Testing y Calidad" "Yellow"
        Write-ColorOutput "════════════════════════════════════════" "Gray"
        try {
            npm run test:lint-robust 2>&1 | Out-Null
            npm run test:type-robust 2>&1 | Out-Null
            $results.Testing = $true
            Write-ColorOutput "✅ Tests completados" "Green"
        } catch {
            Write-ColorOutput "⚠️  Algunos tests fallaron (revisar manualmente)" "Yellow"
        }
        Write-ColorOutput ""
        
        # 5. Verificar Alineación de Tablas
        Write-ColorOutput "📋 PASO 5/5: Verificar Alineación de Tablas" "Yellow"
        Write-ColorOutput "════════════════════════════════════════" "Gray"
        try {
            & "$PSScriptRoot\verificar-alineacion-tablas.ps1" 2>&1 | Out-Null
            $results.DatabaseSync = $true
            Write-ColorOutput "✅ Alineación de tablas verificada" "Green"
        } catch {
            Write-ColorOutput "⚠️  Error verificando alineación: $_" "Yellow"
        }
        Write-ColorOutput ""
        
        # Resumen Final
        $endTime = Get-Date
        $duration = $endTime - $startTime
        
        Write-ColorOutput "
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     📊 RESUMEN FINAL                                               ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
" "Cyan"
        
        Write-ColorOutput "Resultados:" "Yellow"
        Write-ColorOutput "  Validación del Proyecto: $(if ($results.Validation) { '✅' } else { '❌' })" $(if ($results.Validation) { "Green" } else { "Red" })
        Write-ColorOutput "  Tipos Supabase: $(if ($results.Types) { '✅' } else { '❌' })" $(if ($results.Types) { "Green" } else { "Red" })
        Write-ColorOutput "  Auditoría de Seguridad: $(if ($results.Security) { '✅' } else { '⚠️' })" $(if ($results.Security) { "Green" } else { "Yellow" })
        Write-ColorOutput "  Testing y Calidad: $(if ($results.Testing) { '✅' } else { '⚠️' })" $(if ($results.Testing) { "Green" } else { "Yellow" })
        Write-ColorOutput "  Alineación de Tablas: $(if ($results.DatabaseSync) { '✅' } else { '⚠️' })" $(if ($results.DatabaseSync) { "Green" } else { "Yellow" })
        Write-ColorOutput ""
        Write-ColorOutput "⏱️  Tiempo total: $($duration.TotalSeconds.ToString('F2')) segundos" "Cyan"
        Write-ColorOutput ""
        
        $allPassed = $results.Validation -and $results.Types -and $results.Security -and $results.Testing -and $results.DatabaseSync
        
        if ($allPassed) {
            Write-ColorOutput "🎉 ¡Todas las validaciones pasaron exitosamente!" "Green"
        } else {
            Write-ColorOutput "⚠️  Algunas validaciones requieren atención" "Yellow"
        }
        
    } catch {
        Write-ColorOutput "❌ Error ejecutando validaciones: $_" "Red"
    }
    
    Write-ColorOutput ""
    Read-Host "Presiona Enter para continuar"
}

function Invoke-Migrations {
    Write-ColorOutput "📦 Migraciones" "Yellow"
    Write-ColorOutput ""
    Write-ColorOutput "1. Aplicar Migraciones Remotas" "White"
    Write-ColorOutput "2. Verificar Alineación de Tablas" "White"
    Write-ColorOutput "3. Crear Backup de Migraciones" "White"
    Write-ColorOutput "0. Volver" "White"
    Write-ColorOutput ""
    $choice = Read-Host "Selecciona una opción"
    
    switch ($choice) {
        "1" { & "$PSScriptRoot\aplicar-migraciones-remoto.ps1" }
        "2" { & "$PSScriptRoot\verificar-alineacion-tablas.ps1" }
        "3" { & "$PSScriptRoot\crear-backup-migraciones.ps1" }
        "0" { return }
        default { Write-ColorOutput "Opción inválida" "Red" }
    }
}

# Función principal
function Main {
    if ($Action) {
        # Modo no interactivo con acción específica
        switch ($Action.ToLower()) {
            "validate" { Invoke-Validation }
            "db" { Invoke-DatabaseSync }
            "branches" { Invoke-BranchManagement }
            "audit" { Invoke-AuditSecurity }
            "test" { Invoke-Testing }
            "utils" { Invoke-Utilities }
            "migrations" { Invoke-Migrations }
            "all" { Invoke-RunAll }
            default { 
                Write-ColorOutput "Acción desconocida: $Action" "Red"
                Write-ColorOutput "Acciones disponibles: validate, db, branches, audit, test, utils, migrations, all" "Yellow"
            }
        }
    } else {
        # Modo interactivo con menú
        do {
            Clear-Host
            Show-Menu
            $selection = Read-Host "Selecciona una opción"
            
            switch ($selection) {
                "1" { Invoke-Validation; Read-Host "Presiona Enter para continuar" }
                "2" { Invoke-DatabaseSync }
                "3" { Invoke-BranchManagement }
                "4" { Invoke-AuditSecurity }
                "5" { Invoke-Testing }
                "6" { Invoke-Utilities }
                "7" { Invoke-Migrations }
                "8" { Invoke-RunAll }
                "0" { 
                    Write-ColorOutput ""
                    Write-ColorOutput "👋 ¡Hasta luego!" "Cyan"
                    Write-ColorOutput ""
                    exit 0
                }
                default { 
                    Write-ColorOutput "Opción inválida. Presiona Enter para continuar." "Red"
                    Read-Host
                }
            }
        } while ($selection -ne "0")
    }
}

# Ejecutar función principal
Main

