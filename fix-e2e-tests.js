import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simular __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para corregir el flujo de login en archivos E2E
function fixE2ELoginFlow(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Patrón para encontrar el flujo de login incorrecto
  const oldLoginPattern = /await page\.click\('button\[data-testid="toggle-auth-mode"\]'\);\s*await page\.fill\('input\[type="email"\]', '[^']*'\);\s*await page\.fill\('input\[type="password"\]', '[^']*'\);\s*await page\.click\('button\[type="submit"\]'\);/g;

  // Reemplazar con el flujo correcto
  content = content.replace(oldLoginPattern, (match) => {
    const emailMatch = match.match(/await page\.fill\('input\[type="email"\]', '([^']*)'\);/);
    const passwordMatch = match.match(/await page\.fill\('input\[type="password"\]', '([^']*)'\);/);

    const email = emailMatch ? emailMatch[1] : 'single@demo.com';
    const password = passwordMatch ? passwordMatch[1] : 'demo123';

    return `await page.waitForLoadState('networkidle');
    
    // Verificar que la página de auth cargó correctamente
    await expect(page.locator('h3:has-text("ComplicesConecta")')).toBeVisible();
    
    // Asegurar que estamos en la tab "Iniciar Sesión"
    const loginTab = page.locator('[role="tab"]:has-text("Iniciar Sesión")');
    await expect(loginTab).toBeVisible();
    
    // Llenar formulario de login
    await page.fill('input[type="email"]', '${email}');
    await page.fill('input[type="password"]', '${password}');
    await page.click('button:has-text("Iniciar Sesión")');`;
  });

  // Corregir waitForURL
  content = content.replace(
    /await page\.waitForURL\(\/\\\/dashboard\/[^)]*\);/g,
    "await page.waitForURL(/\\/(profile-single|profile-couple|discover|admin)/, { timeout: 30000 });"
  );

  // Corregir expectativas de URL
  content = content.replace(
    /await expect\(page\)\.toHaveURL\(\/\\\/dashboard\/\);/g,
    "await expect(page).toHaveURL(/\\/(profile-single|profile-couple|discover|admin)/);"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Corregido: ${path.basename(filePath)}`);
}

// Archivos E2E a corregir
const e2eFiles = [
  'tests/e2e/admin-login.spec.ts',
  'tests/e2e/registration.spec.ts',
  'tests/e2e/auth-flow.spec.ts',
  'tests/e2e/auth.e2e.test.ts',
  'tests/e2e/navigation.spec.ts',
  'tests/e2e/profile-management.spec.ts',
  'tests/e2e/realtime-chat.spec.ts'
];

console.log('🔧 Iniciando corrección masiva de tests E2E...\n');

e2eFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    try {
      fixE2ELoginFlow(fullPath);
    } catch (error) {
      console.log(`❌ Error en ${file}: ${error.message}`);
    }
  } else {
    console.log(`⚠️  Archivo no encontrado: ${file}`);
  }
});

console.log('\n✅ Corrección masiva completada');
