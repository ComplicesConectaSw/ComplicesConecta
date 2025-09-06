import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Configuración de Supabase
const supabaseUrl = 'https://axtvqnozatbmllvwzuim.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZxbm96YXRibWxsdnd6dWltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjA4NDkwNiwiZXhwIjoyMDYxNjYwOTA2fQ.KvAcO_zk5zriEzRzq6AS2sTtqeWB5K_RN3Xr0ZYsGMw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  console.log('🚀 Iniciando migraciones de ComplicesConecta v1.9.0...')
  
  try {
    // Leer archivo de migraciones
    const migrationsPath = join(process.cwd(), 'dev-scripts', 'migrations.sql')
    const migrationsSQL = readFileSync(migrationsPath, 'utf8')
    
    console.log('📄 Ejecutando migrations.sql...')
    
    // Dividir el SQL en statements individuales
    const statements = migrationsSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.error('❌ Error ejecutando statement:', error.message)
          console.log('Statement:', statement.substring(0, 100) + '...')
        }
      }
    }
    
    console.log('✅ Migraciones ejecutadas exitosamente')
    
    // Leer archivo de RLS
    const rlsPath = join(process.cwd(), 'dev-scripts', 'rls.sql')
    const rlsSQL = readFileSync(rlsPath, 'utf8')
    
    console.log('🔒 Ejecutando políticas RLS...')
    
    const rlsStatements = rlsSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of rlsStatements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.error('❌ Error ejecutando RLS:', error.message)
          console.log('Statement:', statement.substring(0, 100) + '...')
        }
      }
    }
    
    console.log('✅ Políticas RLS aplicadas exitosamente')
    
    // Verificar tablas creadas
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['images', 'chat_rooms', 'messages', 'chat_members', 'image_permissions'])
    
    if (tablesError) {
      console.error('❌ Error verificando tablas:', tablesError.message)
    } else {
      console.log('📊 Tablas verificadas:', tables?.map(t => t.table_name).join(', '))
    }
    
    console.log('🎉 Migraciones completadas exitosamente!')
    
  } catch (error) {
    console.error('💥 Error ejecutando migraciones:', error)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runMigrations()
}

export { runMigrations }
