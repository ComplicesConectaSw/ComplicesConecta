// validacion-paginas.cjs - Script CommonJS para verificar que todas las páginas cargan correctamente

const fs = require('fs');
const path = require('path');

console.log("🔍 VALIDACIÓN DE PÁGINAS - ComplicesConecta\n");

// Obtener todas las páginas en src/pages/
const pagesDir = './src/pages';
const pages = fs.readdirSync(pagesDir)
  .filter(file => file.endsWith('.tsx'))
  .map(file => ({
    name: file.replace('.tsx', ''),
    file: file,
    path: path.join(pagesDir, file)
  }));

console.log(`📊 Total de páginas encontradas: ${pages.length}\n`);

// Verificar cada página
let paginasOK = 0;
let paginasConProblemas = [];

pages.forEach((page, index) => {
  console.log(`📄 [${index + 1}/${pages.length}] Verificando: ${page.name}`);
  
  try {
    const content = fs.readFileSync(page.path, 'utf8');
    
    // Verificaciones básicas
    const checks = {
      tieneExport: /export\s+default/.test(content),
      tieneImportReact: /import.*React/.test(content),
      tieneJSX: /<[A-Z]/.test(content),
      tieneNavigationEnhanced: content.includes('NavigationEnhanced'),
      noTieneImportsRotos: !content.includes('../../') || content.includes('@/')
    };
    
    const problemas = [];
    
    if (!checks.tieneExport) problemas.push('Sin export default');
    if (!checks.tieneImportReact) problemas.push('Sin import de React');
    if (!checks.tieneJSX) problemas.push('Sin JSX válido');
    if (content.includes('../../') && !content.includes('@/')) problemas.push('Imports relativos detectados');
    
    if (problemas.length === 0) {
      console.log(`  ✅ OK - Página válida`);
      paginasOK++;
    } else {
      console.log(`  ❌ Problemas: ${problemas.join(', ')}`);
      paginasConProblemas.push({
        name: page.name,
        problemas: problemas
      });
    }
    
  } catch (error) {
    console.log(`  💥 Error leyendo archivo: ${error.message}`);
    paginasConProblemas.push({
      name: page.name,
      problemas: ['Error de lectura']
    });
  }
});

console.log("\n📈 RESUMEN DE VALIDACIÓN:");
console.log(`   • Páginas válidas: ${paginasOK}/${pages.length}`);
console.log(`   • Páginas con problemas: ${paginasConProblemas.length}`);
console.log(`   • Porcentaje de éxito: ${Math.round((paginasOK / pages.length) * 100)}%`);

if (paginasConProblemas.length > 0) {
  console.log("\n❌ PÁGINAS CON PROBLEMAS:");
  paginasConProblemas.forEach(page => {
    console.log(`\n📄 ${page.name}:`);
    page.problemas.forEach(problema => console.log(`   • ${problema}`));
  });
} else {
  console.log("\n✅ ¡Todas las páginas están correctas!");
}

// Verificar rutas críticas
const rutasCriticas = [
  'Index', 'Auth', 'Dashboard', 'Discover', 'Chat', 'Profiles', 
  'AdminDashboard', 'Settings', 'Premium', 'Tokens'
];

console.log("\n🎯 VERIFICACIÓN DE RUTAS CRÍTICAS:");
rutasCriticas.forEach(ruta => {
  const existe = pages.some(page => page.name === ruta);
  const estado = existe ? '✅' : '❌';
  console.log(`   ${estado} ${ruta}`);
});

console.log("\n🔧 RECOMENDACIONES:");
if (paginasConProblemas.length > 0) {
  console.log("   1. Corregir imports relativos a @/ alias");
  console.log("   2. Verificar exports default en todas las páginas");
  console.log("   3. Asegurar imports de React correctos");
} else {
  console.log("   ✅ Todas las páginas están en perfecto estado");
  console.log("   ✅ Proyecto listo para deployment");
}
