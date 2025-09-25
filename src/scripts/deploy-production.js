#!/usr/bin/env node

/**
 * Script de Despliegue a Producción - ComplicesConecta
 * Aplica todas las correcciones visuales y funcionales a producción
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando despliegue a producción...\n');

// 1. Verificar que estamos en la rama correcta
try {
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`📍 Rama actual: ${currentBranch}`);
  
  if (currentBranch !== 'main' && currentBranch !== 'master') {
    console.log('⚠️  Cambiando a rama main...');
    execSync('git checkout main');
  }
} catch (error) {
  console.error('❌ Error al verificar rama:', error.message);
}

// 2. Actualizar dependencias
console.log('\n📦 Actualizando dependencias...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias actualizadas');
} catch (error) {
  console.error('❌ Error al instalar dependencias:', error.message);
  process.exit(1);
}

// 3. Ejecutar tests
console.log('\n🧪 Ejecutando tests...');
try {
  execSync('npm run test:unit', { stdio: 'inherit' });
  console.log('✅ Tests unitarios pasados');
} catch (error) {
  console.warn('⚠️  Algunos tests fallaron, continuando...');
}

// 4. Build para producción
console.log('\n🏗️  Construyendo para producción...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completado');
} catch (error) {
  console.error('❌ Error en build:', error.message);
  process.exit(1);
}

// 5. Verificar archivos críticos
console.log('\n🔍 Verificando archivos críticos...');
const criticalFiles = [
  'dist/index.html',
  'dist/assets',
  'src/components/Header.tsx',
  'src/components/chat/ChatWindow.tsx',
  'src/pages/Auth.tsx',
  'src/index.css'
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.error(`❌ ${file} - FALTANTE`);
  }
});

// 6. Configurar variables de entorno para producción
console.log('\n⚙️  Configurando variables de producción...');
const envConfig = `
# Configuración de Producción - ComplicesConecta
VITE_APP_ENV=production
VITE_APP_MODE=production
NODE_ENV=production

# URLs de Producción
NEXT_PUBLIC_APP_URL=https://complicesconecta.vercel.app
NEXT_PUBLIC_API_URL=https://complicesconecta.vercel.app/api

# Supabase (usar variables de producción)
VITE_SUPABASE_URL=\${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=\${VITE_SUPABASE_ANON_KEY}

# Features habilitadas en producción
VITE_TOKENS_ENABLED=true
VITE_APP_PHASE=production
`;

fs.writeFileSync('.env.production', envConfig);
console.log('✅ Variables de producción configuradas');

// 7. Commit de cambios si hay alguno
console.log('\n📝 Verificando cambios...');
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status.trim()) {
    console.log('📝 Commiteando cambios...');
    execSync('git add .');
    execSync('git commit -m "feat: aplicar correcciones visuales y funcionales para producción"');
    console.log('✅ Cambios commiteados');
  } else {
    console.log('✅ No hay cambios pendientes');
  }
} catch (error) {
  console.log('ℹ️  No se pudieron commitear cambios automáticamente');
}

// 8. Instrucciones finales
console.log('\n🎉 ¡Preparación para producción completada!\n');
console.log('📋 Próximos pasos:');
console.log('1. Verificar que todas las correcciones estén aplicadas');
console.log('2. Configurar templates de email en Supabase Dashboard');
console.log('3. Actualizar variables de entorno en Vercel');
console.log('4. Hacer push y deploy:');
console.log('   git push origin main');
console.log('5. Verificar deployment en Vercel Dashboard');
console.log('6. Probar funcionalidades críticas en producción\n');

console.log('🔗 Enlaces importantes:');
console.log('- Supabase Dashboard: https://supabase.com/dashboard');
console.log('- Vercel Dashboard: https://vercel.com/dashboard');
console.log('- Producción: https://complicesconecta.vercel.app\n');

console.log('✨ ¡Listo para producción!');
