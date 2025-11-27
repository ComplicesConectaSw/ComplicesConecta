// Script para corregir errores TypeScript automáticamente
const fs = require('fs');
const path = require('path');

function fixWalletServiceErrors() {
  const filePath = path.join(__dirname, '..', 'src', 'services', 'WalletService.ts');
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log('🔧 Corrigiendo errores en WalletService.ts...');
  
  // Corregir todos los logger.error con tipos unknown
  const loggerErrorPatterns = [
    { from: "logger.error('Error creando wallet:', error);", to: "logger.error('Error creando wallet:', { error: String(error) });" },
    { from: "logger.error('Error creando signer:', error);", to: "logger.error('Error creando signer:', { error: String(error) });" },
    { from: "logger.error('Error enviando CMPX:', error);", to: "logger.error('Error enviando CMPX:', { error: String(error) });" },
    { from: "logger.error('Error minting CoupleNFT:', error);", to: "logger.error('Error minting CoupleNFT:', { error: String(error) });" },
    { from: "logger.error('Error staking NFT:', error);", to: "logger.error('Error staking NFT:', { error: String(error) });" },
    { from: "logger.error('Error obteniendo balance:', error);", to: "logger.error('Error obteniendo balance:', { error: String(error) });" },
    { from: "logger.error('Error obteniendo balance de tokens:', error);", to: "logger.error('Error obteniendo balance de tokens:', { error: String(error) });" },
    { from: "logger.error('Error reclamando tokens de testnet:', error);", to: "logger.error('Error reclamando tokens de testnet:', { error: String(error) });" },
    { from: "logger.error('Error reclamando tokens diarios:', error);", to: "logger.error('Error reclamando tokens diarios:', { error: String(error) });" },
    { from: "logger.error('Error obteniendo información de tokens diarios:', error);", to: "logger.error('Error obteniendo información de tokens diarios:', { error: String(error) });" },
    { from: "logger.error('Error obteniendo información de tokens de testnet:', error);", to: "logger.error('Error obteniendo información de tokens de testnet:', { error: String(error) });" }
  ];
  
  let changes = 0;
  loggerErrorPatterns.forEach(pattern => {
    if (content.includes(pattern.from)) {
      content = content.replace(pattern.from, pattern.to);
      changes++;
      console.log(`  ✅ Corregido: ${pattern.from.substring(0, 50)}...`);
    }
  });
  
  // Corregir problema del provider null
  content = content.replace(
    'const signer = new ethers.Wallet(privateKey, this.provider);',
    'const signer = new ethers.Wallet(privateKey, this.provider!);'
  );
  
  // Corregir problema de supabase null
  content = content.replace(
    'const { error } = await (supabase as any)',
    'const { error } = await (supabase!)'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ WalletService.ts corregido (${changes} cambios)`);
}

function fixWalletProtectionErrors() {
  const filePath = path.join(__dirname, '..', 'src', 'utils', 'walletProtection.ts');
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log('🔧 Corrigiendo errores en walletProtection.ts...');
  
  // Agregar declaración de tipos para window
  const windowDeclaration = `
declare global {
  interface Window {
    hasWalletProtection?: boolean;
    [key: string]: any;
  }
}
`;
  
  if (!content.includes('declare global')) {
    content = windowDeclaration + content;
  }
  
  // Corregir parámetros implícitos any
  content = content.replace(
    'const originalError = console.error;\n  console.error = function(error) {',
    'const originalError = console.error;\n  console.error = function(error: any) {'
  );
  
  content = content.replace(
    'const originalWarn = console.warn;\n  console.warn = function(event) {',
    'const originalWarn = console.warn;\n  console.warn = function(event: any) {'
  );
  
  // Corregir acceso a propiedades del window
  content = content.replace(
    'if (window[prop]) {',
    'if ((window as any)[prop]) {'
  );
  
  fs.writeFileSync(filePath, content);
  console.log('✅ walletProtection.ts corregido');
}

function fixCaptureConsoleErrors() {
  const filePath = path.join(__dirname, '..', 'src', 'utils', 'captureConsoleErrors.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ captureConsoleErrors.ts no encontrado');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log('🔧 Corrigiendo errores en captureConsoleErrors.ts...');
  
  // Buscar y corregir problemas de textContent
  content = content.replace(
    /element\.textContent/g,
    'element.textContent || ""'
  );
  
  fs.writeFileSync(filePath, content);
  console.log('✅ captureConsoleErrors.ts corregido');
}

function scanForAsNullOrAsAny() {
  const srcPath = path.join(__dirname, '..', 'src');
  
  console.log('\n🔍 Escaneando archivos con "as null" o "as any"...');
  
  function scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    const results = [];
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        results.push(...scanDirectory(fullPath));
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        const asNullMatches = (content.match(/as null/g) || []).length;
        const asAnyMatches = (content.match(/as any/g) || []).length;
        
        if (asNullMatches > 0 || asAnyMatches > 0) {
          results.push({
            file: path.relative(srcPath, fullPath),
            asNull: asNullMatches,
            asAny: asAnyMatches
          });
        }
      }
    });
    
    return results;
  }
  
  const results = scanDirectory(srcPath);
  
  if (results.length > 0) {
    console.log('\n📋 ARCHIVOS CON TIPOS PROBLEMÁTICOS:');
    results.forEach(result => {
      console.log(`  - ${result.file}`);
      if (result.asNull > 0) console.log(`    └── "as null": ${result.asNull} veces`);
      if (result.asAny > 0) console.log(`    └── "as any": ${result.asAny} veces`);
    });
    
    console.log(`\n📊 Total: ${results.length} archivos con tipos problemáticos`);
  } else {
    console.log('✅ No se encontraron archivos con "as null" o "as any"');
  }
  
  return results;
}

async function main() {
  console.log('🚀 CORRECCIÓN AUTOMÁTICA DE ERRORES TYPESCRIPT');
  console.log('='.repeat(50));
  
  try {
    // Corregir errores específicos
    fixWalletServiceErrors();
    fixWalletProtectionErrors();
    fixCaptureConsoleErrors();
    
    // Escanear archivos problemáticos
    const problematicFiles = scanForAsNullOrAsAny();
    
    console.log('\n✅ Corrección completada!');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Ejecutar: npm run type-check');
    console.log('2. Revisar archivos con "as any" si los hay');
    console.log('3. Verificar que las tablas de Supabase existan');
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message);
  }
}

main();
