#!/usr/bin/env node
/**
 * Auditoría Integral Autocorrectiva
 * Guarda reportes en /dev-scripts/reports/ con fecha automática
 */

const fs = require("fs");
const { execSync } = require("child_process");

// Crear carpeta de reportes si no existe
const reportsDir = "./dev-scripts/reports";
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Nombre de reporte con fecha
const date = new Date().toISOString().split("T")[0];
const reportFile = `${reportsDir}/AUDIT_REPORT_${date}.md`;

// 🛡️ Superprompt de Auditoría
const superprompt = `
Quiero que realices una **auditoría integral autocorrectiva** de mi proyecto con estas condiciones:

### Alcance
1. Revisar todos los directorios y subdirectorios.
2. Excluir: node_modules/, android/, .vscode/, dev-scripts/reports/
3. Verificar que los reportes anteriores (ANALYSIS_REPORT.md, COMPREHENSIVE_AUDIT_REPORT.md) ya se hayan corregido.
4. Aplicar automáticamente las correcciones pendientes sin romper el código.

### Acciones
- ✅ Eliminar archivos duplicados o huérfanos.
- ✅ Corregir imports rotos y rutas incorrectas.
- ✅ Unificar variables de entorno (formato VITE_*).
- ✅ Verificar dependencias: si hay duplicadas/conflictivas → eliminarlas y reinstalar desde cero.
- ✅ Revisar Android: UI debe ser responsiva, sin errores de visualización ni lógica.
- ✅ Verificar compatibilidad con Supabase, Capacitor, CI/CD.

### Generación de Reporte
- Crear un archivo Markdown en /dev-scripts/reports/ con nombre:
  AUDIT_REPORT_YYYY-MM-DD.md

### Reglas
- NO romper el código
- Mantener estilos (Tailwind, React, TS)
- Usar imports con alias "@/”
- No subir la carpeta /dev-scripts ni sus reportes a GitHub
`;

try {
  console.log("🚀 Ejecutando auditoría...");
  const result = execSync(
    `openai api chat.completions.create -m gpt-5 -g user -c "${superprompt}"`,
    { encoding: "utf-8" }
  );

  fs.writeFileSync(reportFile, result);
  console.log(`✅ Reporte generado: ${reportFile}`);
} catch (err) {
  console.error("❌ Error ejecutando auditoría:", err.message);
}
