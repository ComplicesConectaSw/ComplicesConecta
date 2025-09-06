// =====================================================
// 🤖 EJECUTOR DIRECTO DE CORRECCIÓN SUPABASE
// ComplicesConecta v2.1.2 - Ejecutor Simplificado
// Fecha: 06 de septiembre, 2025 - 05:41 hrs
// =====================================================

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 EJECUTOR DIRECTO DE CORRECCIÓN SUPABASE');
console.log('⏰ Iniciado:', new Date().toLocaleString('es-ES'));
console.log('=' .repeat(60));

// Leer variables de entorno
let supabaseUrl, supabaseKey;

try {
    if (fs.existsSync('.env')) {
        const envContent = fs.readFileSync('.env', 'utf8');
        const envLines = envContent.split('\n');
        
        envLines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                if (key.trim() === 'VITE_SUPABASE_URL') {
                    supabaseUrl = value.trim().replace(/['"]/g, '');
                }
                if (key.trim() === 'SUPABASE_SERVICE_ROLE_KEY') {
                    supabaseKey = value.trim().replace(/['"]/g, '');
                }
            }
        });
    }
} catch (error) {
    console.log('⚠️ No se pudo leer .env, usando variables de entorno del sistema');
}

// Usar variables de entorno del sistema si no se encontraron en .env
supabaseUrl = supabaseUrl || process.env.VITE_SUPABASE_URL;
supabaseKey = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno faltantes:');
    console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Configurada' : '❌ Faltante');
    console.log('');
    console.log('📋 INSTRUCCIONES PARA APLICAR CORRECCIONES MANUALMENTE:');
    console.log('');
    console.log('1️⃣ Ir a Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/[PROJECT-ID]/sql');
    console.log('');
    console.log('2️⃣ Ejecutar scripts en orden:');
    console.log('   📄 scripts/fix_database.sql');
    console.log('   🛡️ scripts/complete_rls_policies.sql');
    console.log('   🗂️ scripts/complete_storage_buckets.sql');
    console.log('   🔧 scripts/create_functions.sql');
    console.log('   🚀 scripts/create_indexes.sql');
    console.log('   🎯 scripts/complete_validation_system.sql');
    console.log('');
    console.log('3️⃣ Validar correcciones:');
    console.log('   SELECT * FROM public.validate_database_complete();');
    console.log('   SELECT public.generate_audit_report();');
    process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para ejecutar auditoría básica
async function runBasicAudit() {
    console.log('🔍 EJECUTANDO AUDITORÍA BÁSICA...');
    
    const results = {
        tables: {},
        buckets: {},
        timestamp: new Date().toISOString()
    };

    // Verificar tablas críticas
    const criticalTables = [
        'profiles', 'user_roles', 'invitations', 'gallery_permissions',
        'images', 'image_permissions', 'gallery_access_requests',
        'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
        'user_likes', 'matches', 'match_interactions'
    ];

    console.log('📊 Verificando tablas críticas...');
    for (const tableName of criticalTables) {
        try {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .limit(1);

            if (error) {
                results.tables[tableName] = { exists: false, error: error.message };
                console.log(`   ❌ ${tableName}: No existe`);
            } else {
                results.tables[tableName] = { exists: true };
                console.log(`   ✅ ${tableName}: Existe`);
            }
        } catch (err) {
            results.tables[tableName] = { exists: false, error: err.message };
            console.log(`   ❌ ${tableName}: Error - ${err.message}`);
        }
    }

    // Verificar buckets de storage
    console.log('🗂️ Verificando storage buckets...');
    const criticalBuckets = ['profile-images', 'gallery-images', 'chat-media'];
    
    for (const bucketName of criticalBuckets) {
        try {
            const { data, error } = await supabase.storage.getBucket(bucketName);
            
            if (error) {
                results.buckets[bucketName] = { exists: false, error: error.message };
                console.log(`   ❌ ${bucketName}: No existe`);
            } else {
                results.buckets[bucketName] = { exists: true };
                console.log(`   ✅ ${bucketName}: Existe`);
            }
        } catch (err) {
            results.buckets[bucketName] = { exists: false, error: err.message };
            console.log(`   ❌ ${bucketName}: Error - ${err.message}`);
        }
    }

    // Calcular estadísticas
    const existingTables = Object.values(results.tables).filter(t => t.exists).length;
    const existingBuckets = Object.values(results.buckets).filter(b => b.exists).length;
    
    console.log('');
    console.log('📊 RESUMEN DE AUDITORÍA:');
    console.log(`   Tablas: ${existingTables}/${criticalTables.length} (${Math.round(existingTables/criticalTables.length*100)}%)`);
    console.log(`   Buckets: ${existingBuckets}/${criticalBuckets.length} (${Math.round(existingBuckets/criticalBuckets.length*100)}%)`);
    
    // Guardar resultados
    try {
        const reportsDir = path.join(process.cwd(), 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        const auditPath = path.join(reportsDir, 'basic_audit_results.json');
        fs.writeFileSync(auditPath, JSON.stringify(results, null, 2));
        console.log(`📄 Resultados guardados: ${auditPath}`);
    } catch (err) {
        console.log('⚠️ No se pudieron guardar los resultados:', err.message);
    }

    return results;
}

// Ejecutar auditoría
async function main() {
    try {
        await runBasicAudit();
        
        console.log('');
        console.log('🎯 PRÓXIMOS PASOS:');
        console.log('');
        console.log('1️⃣ Aplicar correcciones en Supabase SQL Editor:');
        console.log('   https://supabase.com/dashboard/project/[PROJECT-ID]/sql');
        console.log('');
        console.log('2️⃣ Ejecutar scripts en orden:');
        console.log('   📄 scripts/fix_database.sql');
        console.log('   🛡️ scripts/complete_rls_policies.sql');
        console.log('   🗂️ scripts/complete_storage_buckets.sql');
        console.log('   🔧 scripts/create_functions.sql');
        console.log('   🚀 scripts/create_indexes.sql');
        console.log('   🎯 scripts/complete_validation_system.sql');
        console.log('');
        console.log('3️⃣ Validar correcciones:');
        console.log('   SELECT * FROM public.validate_database_complete();');
        console.log('   SELECT public.generate_audit_report();');
        
    } catch (error) {
        console.error('❌ Error durante la auditoría:', error.message);
        process.exit(1);
    }
}

main();
