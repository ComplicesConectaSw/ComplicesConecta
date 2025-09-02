/**
 * Script para corregir rutas de importación en despliegues automáticos de CI/CD
 * Se ejecuta como parte del workflow fix-vercel-deployment.yml
 * 
 * @file fix-import-routes.js
 * @author Juan Carlos Méndez
 * @date 24-mayo-2025
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 CI/CD: Verificando rutas de importación críticas...');

// Rutas de archivos a verificar (relativas a la raíz del repositorio)
const filesWithRouteIssues = [
  'apps/web/src/app/cards/page.tsx',
  'apps/web/src/app/features/page.tsx'
];

// Mapeo de rutas incorrectas a rutas correctas
const routeCorrections = {
  '@/components/ui/CardGrid': '@/components/ui/cards/CardGrid',
  '@/components/FeatureCards': '@/components/ui/cards/CardGrid'
};

let modifiedCount = 0;

// Procesar cada archivo
filesWithRouteIssues.forEach(filePath => {
  const fullPath = path.resolve(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ CI/CD: No se encontró el archivo ${filePath}`);
    return;
  }
  
  console.log(`🔄 CI/CD: Verificando ${filePath}...`);
  
  // Leer contenido del archivo
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Aplicar correcciones
  Object.entries(routeCorrections).forEach(([wrongRoute, correctRoute]) => {
    const importRegex = new RegExp(`from\\s+['"]${wrongRoute}['"]`, 'g');
    
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `from '${correctRoute}'`);
      modified = true;
      console.log(`  ✅ CI/CD: Corregida ruta ${wrongRoute} → ${correctRoute} en ${filePath}`);
    }
  });
  
  // Guardar cambios si se hicieron modificaciones
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  📝 CI/CD: Guardados cambios en ${filePath}`);
    modifiedCount++;
  } else {
    console.log(`  ✓ CI/CD: No se requieren cambios en ${filePath}`);
  }
});

if (modifiedCount > 0) {
  console.log(`✅ CI/CD: Corrección completada. Se modificaron ${modifiedCount} archivo(s).`);
} else {
  console.log('✅ CI/CD: Verificación completada. No se requirieron cambios.');
}

// Salir con código de éxito
process.exit(0);
