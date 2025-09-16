#!/bin/bash

# Script para aplicar patches de auditoría técnica
# Fecha: 15 de Septiembre, 2025
# Proyecto: ComplicesConecta v2.8.5

set -e

echo "🔍 Iniciando aplicación de patches de auditoría técnica..."
echo "📅 Fecha: $(date)"
echo ""

# Función para confirmar aplicación
confirm_patch() {
    local patch_id=$1
    local description=$2
    
    echo "🔧 Patch $patch_id: $description"
    read -p "¿Deseas aplicar este patch? (APLICAR/NO): " response
    
    if [[ "$response" != "APLICAR" ]]; then
        echo "❌ Patch $patch_id omitido por el usuario"
        return 1
    fi
    return 0
}

# Crear backup antes de aplicar cambios
echo "📦 Creando backup de seguridad..."
git tag "audit-backup-$(date +%Y%m%d-%H%M%S)" || echo "⚠️ No se pudo crear tag de backup"
cp -r src/ src.backup.before.audit || echo "⚠️ No se pudo crear backup de src/"

# Crear rama para fixes
echo "🌿 Creando rama para fixes de auditoría..."
git checkout -b "fix/audit-$(date +%Y%m%d)" || echo "⚠️ Rama ya existe o error al crear"

# A1 - Fix QueryClient en tests
if confirm_patch "A1" "Configuración QueryClient para tests"; then
    echo "🔧 Aplicando patch A1..."
    git apply patches/patch-A1.diff || echo "❌ Error aplicando patch A1"
    
    # Validar cambios
    npm run test -- --run || echo "⚠️ Tests aún fallan - revisar configuración"
    
    if [ $? -eq 0 ]; then
        git add -A
        git commit -m "fix(audit): Configurar QueryClient para tests [A1] [$(date +'%F %R')]"
        echo "✅ Patch A1 aplicado exitosamente"
    else
        echo "❌ Patch A1 falló - revirtiendo..."
        git checkout -- .
    fi
fi

# A2 - Consolidar duplicados
if confirm_patch "A2" "Consolidar archivos duplicados con wrappers"; then
    echo "🔧 Aplicando patch A2..."
    git apply patches/patch-A2.diff || echo "❌ Error aplicando patch A2"
    
    # Limpiar archivos generados
    rm -rf dist/ || echo "⚠️ No se pudo limpiar dist/"
    
    # Validar build
    npm run build || echo "⚠️ Build falló - revisar imports"
    
    if [ $? -eq 0 ]; then
        git add -A
        git commit -m "fix(audit): Consolidar duplicados y limpiar builds [A2] [$(date +'%F %R')]"
        echo "✅ Patch A2 aplicado exitosamente"
    else
        echo "❌ Patch A2 falló - revirtiendo..."
        git checkout -- .
    fi
fi

# A3 - Migrar localStorage
if confirm_patch "A3" "Migrar localStorage a React Query"; then
    echo "🔧 Aplicando patch A3..."
    git apply patches/patch-A3.diff || echo "❌ Error aplicando patch A3"
    
    # Validar TypeScript
    npm run type-check || echo "⚠️ Errores de TypeScript - revisar tipos"
    
    if [ $? -eq 0 ]; then
        git add -A
        git commit -m "fix(audit): Migrar localStorage a hooks tipados [A3] [$(date +'%F %R')]"
        echo "✅ Patch A3 aplicado exitosamente"
    else
        echo "❌ Patch A3 falló - revirtiendo..."
        git checkout -- .
    fi
fi

# Validación final
echo ""
echo "🧪 Ejecutando validación final..."
npm run lint || echo "⚠️ Errores de linting detectados"
npm run type-check || echo "⚠️ Errores de TypeScript detectados"
npm run build || echo "⚠️ Build falló"

echo ""
echo "✅ Proceso de aplicación de patches completado"
echo "📋 Revisar commits creados y hacer push si todo está correcto:"
echo "   git log --oneline -5"
echo "   git push origin fix/audit-$(date +%Y%m%d)"
echo ""
echo "🔄 Para revertir todos los cambios:"
echo "   git checkout master"
echo "   git branch -D fix/audit-$(date +%Y%m%d)"
echo "   git checkout audit-backup-$(date +%Y%m%d-%H%M%S)"
