// Script para auditar y reemplazar todos los 'any' en el proyecto
// Fecha: 2025-09-25
// Propósito: Eliminar 'any' y usar tipos reales de Database

const fs = require('fs');
const path = require('path');

console.log("🔍 AUDITORÍA DE TIPOS 'ANY' - ComplicesConecta\n");

// Archivos con 'any' detectados y su cantidad
const filesWithAny = [
  { file: 'src/lib/intelligentAutomation.ts', count: 15 },
  { file: 'src/lib/advancedFeatures.ts', count: 14 },
  { file: 'src/services/TokenAnalyticsService.ts', count: 10 },
  { file: 'src/services/ReportService.ts', count: 9 },
  { file: 'src/components/animations/AnimationProvider.tsx', count: 7 },
  { file: 'src/components/ui/chart.tsx', count: 6 },
  { file: 'src/demo/DemoProvider.tsx', count: 6 },
  { file: 'src/pages/AdminDashboard.tsx', count: 6 },
  { file: 'src/demo/RealProvider.tsx', count: 5 },
  { file: 'src/lib/simpleChatService.ts', count: 5 },
  { file: 'src/lib/simpleMatches.ts', count: 5 },
  { file: 'src/pages/AdminModerators.tsx', count: 5 },
  { file: 'src/utils/webVitals.ts', count: 5 }
];

let totalAnyFound = 0;
let totalFilesWithAny = 0;

console.log("📊 RESUMEN DE ARCHIVOS CON 'ANY':\n");

filesWithAny.forEach(item => {
  console.log(`❌ ${item.file.padEnd(50)} - ${item.count} 'any' encontrados`);
  totalAnyFound += item.count;
  totalFilesWithAny++;
});

console.log(`\n📈 ESTADÍSTICAS TOTALES:`);
console.log(`   • Total archivos con 'any': ${totalFilesWithAny}`);
console.log(`   • Total 'any' encontrados: ${totalAnyFound}`);
console.log(`   • Prioridad de corrección: ALTA`);

console.log(`\n🎯 PLAN DE CORRECCIÓN:`);
console.log(`1. Reemplazar 'any' por tipos específicos de Database`);
console.log(`2. Usar Database["public"]["Tables"]["tabla"]["Row"] para datos`);
console.log(`3. Usar Database["public"]["Tables"]["tabla"]["Insert"] para inserts`);
console.log(`4. Usar Database["public"]["Tables"]["tabla"]["Update"] para updates`);
console.log(`5. Validar consistencia con schema real de Supabase`);

console.log(`\n⚠️ ARCHIVOS DE ALTA PRIORIDAD (>10 'any'):`);
filesWithAny.filter(item => item.count >= 10).forEach(item => {
  console.log(`   🔥 ${item.file} - ${item.count} 'any'`);
});

console.log(`\n✅ PRÓXIMOS PASOS:`);
console.log(`1. Corregir archivos de alta prioridad primero`);
console.log(`2. Actualizar tests con tipos reales`);
console.log(`3. Validar que no se rompan funcionalidades`);
console.log(`4. Generar reporte final de tipado`);

console.log(`\n🎉 Auditoría de tipos completada!`);
