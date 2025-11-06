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
            default { 
                Write-ColorOutput "Acción desconocida: $Action" "Red"
                Write-ColorOutput "Acciones disponibles: validate, db, branches, audit, test, utils, migrations" "Yellow"
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
                "0" { 
                    Write-ColorOutput "👋 ¡Hasta luego!" "Cyan"
                    break 
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

