// Script para verificar alineación de base de datos
// Ejecuta consultas para validar que todas las tablas existen

const { createClient } = require('@supabase/supabase-js');

// Configurar cliente Supabase (usar variables de entorno)
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabaseAlignment() {
    console.log('🔍 Verificando alineación de base de datos...\n');
    
    const expectedTables = [
        'profiles',
        'user_tokens', 
        'automation_rules',
        'roles',
        'profile_cache',
        'sessions',
        'content_moderation',
        'security',
        'transactions',
        'user_staking',
        'pending_rewards',
        'posts',
        'matches',
        'messages'
    ];
    
    const results = {
        existing: [],
        missing: [],
        total: expectedTables.length
    };
    
    for (const table of expectedTables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);
                
            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
                results.missing.push(table);
            } else {
                console.log(`✅ ${table}: OK`);
                results.existing.push(table);
            }
        } catch (err) {
            console.log(`❌ ${table}: ${err.message}`);
            results.missing.push(table);
        }
    }
    
    console.log('\n📊 Resumen de Alineación:');
    console.log(`Total de tablas: ${results.total}`);
    console.log(`Existentes: ${results.existing.length}`);
    console.log(`Faltantes: ${results.missing.length}`);
    console.log(`Cobertura: ${Math.round((results.existing.length / results.total) * 100)}%`);
    
    if (results.missing.length > 0) {
        console.log('\n❌ Tablas faltantes:');
        results.missing.forEach(table => console.log(`  - ${table}`));
    } else {
        console.log('\n🎉 ¡Base de datos completamente alineada!');
    }
    
    // Verificar usuarios demo
    console.log('\n👥 Verificando usuarios demo...');
    try {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('name, account_type, role')
            .in('name', ['Usuario Demo Single', 'Usuario Demo Pareja', 'Administrador Demo', 'Moderador Demo']);
            
        console.log('Usuarios demo encontrados:');
        profiles?.forEach(profile => {
            console.log(`  - ${profile.name} (${profile.account_type}) [${profile.role || 'user'}]`);
        });
    } catch (err) {
        console.log(`❌ Error verificando usuarios demo: ${err.message}`);
    }
    
    return results;
}

// Ejecutar si se llama directamente
if (require.main === module) {
    verifyDatabaseAlignment()
        .then(results => {
            process.exit(results.missing.length === 0 ? 0 : 1);
        })
        .catch(err => {
            console.error('Error:', err);
            process.exit(1);
        });
}

module.exports = { verifyDatabaseAlignment };
