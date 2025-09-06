const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = 'https://axtvqnozatbmllvwzuim.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZxbm96YXRibWxsdnd6dWltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjA4NDkwNiwiZXhwIjoyMDYxNjYwOTA2fQ.KvAcO_zk5zriEzRzq6AS2sTtqeWB5K_RN3Xr0ZYsGMw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLFile(filePath, description) {
  console.log(`📄 Ejecutando ${description}...`);
  
  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Ejecutar el SQL completo usando rpc
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: sqlContent 
    });
    
    if (error) {
      console.error(`❌ Error en ${description}:`, error.message);
      return false;
    }
    
    console.log(`✅ ${description} ejecutado exitosamente`);
    return true;
  } catch (err) {
    console.error(`💥 Error leyendo ${filePath}:`, err.message);
    return false;
  }
}

async function runMigrations() {
  console.log('🚀 Iniciando migraciones ComplicesConecta v1.9.0...');
  console.log('📅 Fecha:', new Date().toLocaleString('es-MX'));
  
  // Ejecutar migraciones
  const migrationsPath = path.join(__dirname, '..', 'dev-scripts', 'migrations.sql');
  const migrationsSuccess = await executeSQLFile(migrationsPath, 'migrations.sql');
  
  if (!migrationsSuccess) {
    console.error('💥 Falló la ejecución de migraciones');
    process.exit(1);
  }
  
  // Ejecutar políticas RLS
  const rlsPath = path.join(__dirname, '..', 'dev-scripts', 'rls.sql');
  const rlsSuccess = await executeSQLFile(rlsPath, 'rls.sql (políticas de seguridad)');
  
  if (!rlsSuccess) {
    console.error('💥 Falló la aplicación de políticas RLS');
    process.exit(1);
  }
  
  // Verificar tablas creadas
  console.log('🔍 Verificando tablas creadas...');
  
  const tablesToCheck = ['profiles', 'images', 'chat_rooms', 'messages', 'chat_members', 'invitations'];
  
  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = tabla vacía, está bien
        console.log(`⚠️  Tabla ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ Tabla ${tableName}: OK`);
      }
    } catch (err) {
      console.log(`❌ Tabla ${tableName}: Error - ${err.message}`);
    }
  }
  
  console.log('🎉 Migraciones completadas exitosamente!');
  console.log('📋 Próximo paso: Crear buckets de Storage en Supabase Dashboard');
}

// Ejecutar migraciones
runMigrations().catch(console.error);
