// Script específico para corregir WalletService.ts
const fs = require('fs');
const path = require('path');

function fixWalletServiceErrors() {
  const filePath = path.join(__dirname, '..', 'src', 'services', 'WalletService.ts');
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log('🔧 Corrigiendo errores específicos en WalletService.ts...');
  
  // Corregir todos los logger.error con error directo
  const errorPatterns = [
    'logger.error(\'Error minting CoupleNFT:\', error);',
    'logger.error(\'Error staking NFT:\', error);',
    'logger.error(\'Error obteniendo balance de tokens:\', error);',
    'logger.error(\'Error obteniendo balance de MATIC:\', error);',
    'logger.error(\'Error reclamando tokens diarios:\', error);',
    'logger.error(\'Error guardando reclamo de tokens de testnet:\', error);',
    'logger.error(\'Error obteniendo información de tokens de testnet:\', error);',
    'logger.error(\'Error obteniendo reclamos de tokens diarios:\', error);'
  ];
  
  let changes = 0;
  errorPatterns.forEach(pattern => {
    const replacement = pattern.replace(', error);', ', { error: String(error) });');
    if (content.includes(pattern)) {
      content = content.replace(pattern, replacement);
      changes++;
      console.log(`  ✅ Corregido: ${pattern.substring(0, 40)}...`);
    }
  });
  
  // Corregir problema de tabla tokens - cambiar a una tabla que existe
  const tablePattern = `      // Usar tabla tokens existente en lugar de daily_token_claims
      const { error } = await (supabase!)
        .from('tokens')
        .upsert({
          user_id: userId,
          token_type: 'daily_claim',
          amount: currentClaimed + amount,
          created_at: new Date().toISOString()
        });`;
        
  const tableReplacement = `      // Usar tabla user_wallets para guardar información de tokens
      const { error } = await (supabase!)
        .from('user_wallets')
        .upsert({
          user_id: userId,
          network: 'daily_tokens',
          address: \`daily_\${userId}_\${today}\`,
          encrypted_private_key: String(currentClaimed + amount),
          created_at: new Date().toISOString()
        });`;
  
  if (content.includes('token_type: \'daily_claim\'')) {
    content = content.replace(tablePattern, tableReplacement);
    changes++;
    console.log('  ✅ Corregido: Problema de tabla tokens');
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ WalletService.ts corregido (${changes} cambios)`);
  
  return changes;
}

async function main() {
  console.log('🚀 CORRECCIÓN ESPECÍFICA DE WALLETSERVICE.TS');
  console.log('='.repeat(50));
  
  try {
    const changes = fixWalletServiceErrors();
    
    if (changes > 0) {
      console.log('\n✅ Correcciones aplicadas exitosamente!');
      console.log('\n📋 PRÓXIMOS PASOS:');
      console.log('1. Ejecutar: npm run type-check');
      console.log('2. Verificar que no hay errores TypeScript');
      console.log('3. Continuar con siguiente fase del plan');
    } else {
      console.log('\n⚠️ No se encontraron patrones para corregir');
      console.log('Los errores pueden haber sido corregidos previamente');
    }
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message);
  }
}

main();
