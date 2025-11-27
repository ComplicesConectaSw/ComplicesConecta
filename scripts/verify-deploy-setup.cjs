// Verificar configuración para deploy en Amoy
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔍 Verificando configuración para deploy en Polygon Amoy...\n");
  
  // Verificar variables de entorno
  console.log("=== VARIABLES DE ENTORNO ===");
  const requiredVars = ['PRIVATE_KEY', 'AMOY_RPC_URL', 'PINATA_API_KEY', 'PINATA_SECRET_API_KEY'];
  let allVarsPresent = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${varName === 'PRIVATE_KEY' ? '[CONFIGURADA]' : value}`);
    } else {
      console.log(`❌ ${varName}: NO CONFIGURADA`);
      allVarsPresent = false;
    }
  });
  
  // Verificar contratos
  console.log("\n=== CONTRATOS DISPONIBLES ===");
  const contractsPath = path.join(__dirname, "..", "contracts");
  
  if (fs.existsSync(contractsPath)) {
    const contracts = fs.readdirSync(contractsPath).filter(f => f.endsWith('.sol'));
    
    if (contracts.length > 0) {
      console.log("✅ Contratos encontrados:");
      contracts.forEach(contract => {
        const filePath = path.join(contractsPath, contract);
        const stats = fs.statSync(filePath);
        console.log(`   - ${contract} (${Math.round(stats.size / 1024)}KB)`);
      });
    } else {
      console.log("❌ No se encontraron contratos .sol");
    }
  } else {
    console.log("❌ Directorio /contracts no existe");
  }
  
  // Verificar configuración de Hardhat
  console.log("\n=== CONFIGURACIÓN HARDHAT ===");
  const hardhatConfigs = ['hardhat.config.js', 'hardhat.config.cjs', 'hardhat.config.ts'];
  let configFound = false;
  
  hardhatConfigs.forEach(configFile => {
    const configPath = path.join(__dirname, "..", configFile);
    if (fs.existsSync(configPath)) {
      console.log(`✅ ${configFile} encontrado`);
      configFound = true;
    }
  });
  
  if (!configFound) {
    console.log("❌ No se encontró configuración de Hardhat");
  }
  
  // Verificar package.json
  console.log("\n=== DEPENDENCIAS ===");
  const packagePath = path.join(__dirname, "..", "package.json");
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = ['hardhat', 'ethers', '@openzeppelin/contracts', 'dotenv'];
    requiredDeps.forEach(dep => {
      if (deps[dep]) {
        console.log(`✅ ${dep}: ${deps[dep]}`);
      } else {
        console.log(`❌ ${dep}: NO INSTALADO`);
      }
    });
  }
  
  // Crear resumen
  const deployInfo = {
    timestamp: new Date().toISOString(),
    environmentVariables: {
      configured: allVarsPresent,
      missing: requiredVars.filter(v => !process.env[v])
    },
    contracts: {
      available: fs.existsSync(contractsPath) ? 
        fs.readdirSync(contractsPath).filter(f => f.endsWith('.sol')) : []
    },
    hardhatConfig: configFound,
    readyForDeploy: allVarsPresent && configFound,
    nextSteps: []
  };
  
  // Generar próximos pasos
  if (!allVarsPresent) {
    deployInfo.nextSteps.push("Configurar variables de entorno faltantes en .env");
  }
  
  if (!configFound) {
    deployInfo.nextSteps.push("Crear configuración de Hardhat");
  }
  
  if (deployInfo.contracts.available.length === 0) {
    deployInfo.nextSteps.push("Verificar contratos en /contracts");
  }
  
  if (deployInfo.readyForDeploy) {
    deployInfo.nextSteps.push("Ejecutar: npx hardhat run scripts/deploy-amoy.js --network amoy");
  }
  
  // Guardar información
  const outputDir = path.join(__dirname, "..", "deployed-contracts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, "deploy-verification.json");
  fs.writeFileSync(outputPath, JSON.stringify(deployInfo, null, 2));
  
  console.log("\n=== RESUMEN ===");
  console.log(`Estado: ${deployInfo.readyForDeploy ? '✅ LISTO PARA DEPLOY' : '⚠️ CONFIGURACIÓN INCOMPLETA'}`);
  console.log(`Información guardada en: ${outputPath}`);
  
  if (deployInfo.nextSteps.length > 0) {
    console.log("\n📋 PRÓXIMOS PASOS:");
    deployInfo.nextSteps.forEach((step, i) => {
      console.log(`${i + 1}. ${step}`);
    });
  }
  
  console.log("\n🔗 RECURSOS:");
  console.log("- Faucet Amoy: https://faucet.polygon.technology/");
  console.log("- Explorer: https://amoy.polygonscan.com/");
  console.log("- Docs Hardhat: https://hardhat.org/docs");
}

main()
  .then(() => {
    console.log("\n✅ Verificación completada!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
