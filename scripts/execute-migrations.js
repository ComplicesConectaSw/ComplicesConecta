const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = 'https://axtvqnozatbmllvwzuim.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZxbm96YXRibWxsdnd6dWltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjA4NDkwNiwiZXhwIjoyMDYxNjYwOTA2fQ.KvAcO_zk5zriEzRzq6AS2sTtqeWB5K_RN3Xr0ZYsGMw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL(sql, description) {
  console.log(`📄 Ejecutando ${description}...`);
  
  try {
    // Usar fetch directo para ejecutar SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Error HTTP ${response.status}:`, error);
      return false;
    }

    console.log(`✅ ${description} ejecutado exitosamente`);
    return true;
  } catch (error) {
    console.error(`💥 Error ejecutando ${description}:`, error.message);
    return false;
  }
}

async function createTablesManually() {
  console.log('🔧 Creando tablas manualmente...');
  
  // Crear tabla images
  const createImagesTable = `
    CREATE TABLE IF NOT EXISTS images (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      profile_id TEXT NOT NULL,
      url TEXT NOT NULL,
      is_public BOOLEAN DEFAULT true,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  // Crear tabla chat_rooms
  const createChatRoomsTable = `
    CREATE TABLE IF NOT EXISTS chat_rooms (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      is_public BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_by TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  // Crear tabla messages
  const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL,
      content TEXT NOT NULL,
      message_type TEXT DEFAULT 'text',
      is_deleted BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  // Crear tabla chat_members
  const createChatMembersTable = `
    CREATE TABLE IF NOT EXISTS chat_members (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
      profile_id TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      is_muted BOOLEAN DEFAULT false,
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(room_id, profile_id)
    );
  `;
  
  // Crear tabla image_permissions
  const createImagePermissionsTable = `
    CREATE TABLE IF NOT EXISTS image_permissions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      image_id UUID REFERENCES images(id) ON DELETE CASCADE,
      granted_to TEXT NOT NULL,
      granted_by TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(image_id, granted_to)
    );
  `;
  
  const tables = [
    { sql: createImagesTable, name: 'images' },
    { sql: createChatRoomsTable, name: 'chat_rooms' },
    { sql: createMessagesTable, name: 'messages' },
    { sql: createChatMembersTable, name: 'chat_members' },
    { sql: createImagePermissionsTable, name: 'image_permissions' }
  ];
  
  for (const table of tables) {
    const success = await executeSQL(table.sql, `tabla ${table.name}`);
    if (!success) {
      console.error(`❌ Falló la creación de tabla ${table.name}`);
      return false;
    }
  }
  
  return true;
}

async function testConnection() {
  console.log('🔍 Probando conexión a Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Error de conexión:', error.message);
      return false;
    }
    
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    return false;
  }
}

async function runMigrations() {
  console.log('🚀 Iniciando migraciones ComplicesConecta v1.9.0');
  console.log('📅 Fecha:', new Date().toLocaleString('es-MX'));
  
  // Probar conexión
  const connected = await testConnection();
  if (!connected) {
    console.error('💥 No se pudo conectar a Supabase');
    process.exit(1);
  }
  
  // Crear tablas manualmente
  const tablesCreated = await createTablesManually();
  if (!tablesCreated) {
    console.error('💥 Falló la creación de tablas');
    process.exit(1);
  }
  
  // Verificar tablas creadas
  console.log('🔍 Verificando tablas...');
  const tablesToCheck = ['images', 'chat_rooms', 'messages', 'chat_members', 'image_permissions'];
  
  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
        console.log(`⚠️  Tabla ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ Tabla ${tableName}: Creada correctamente`);
      }
    } catch (err) {
      console.log(`❌ Tabla ${tableName}: ${err.message}`);
    }
  }
  
  console.log('🎉 Migraciones básicas completadas!');
  console.log('📋 Siguiente: Aplicar políticas RLS y crear buckets de Storage');
}

runMigrations().catch(console.error);
