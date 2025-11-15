// Deploy simple para Amoy sin Hardhat
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuración
const AMOY_RPC_URL = process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("❌ Error: PRIVATE_KEY no encontrada en .env");
  process.exit(1);
}

async function main() {
  console.log("🚀 Iniciando verificación de deploy en Polygon Amoy...");
  
  // Conectar a la red
  const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("📝 Wallet configurada:", wallet.address);
  
  // Verificar balance
  const balance = await wallet.provider.getBalance(wallet.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "MATIC");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  Advertencia: Balance muy bajo. Necesitas MATIC para el deploy.");
    console.log("🔗 Obtén MATIC gratis en: https://faucet.polygon.technology/");
  } else {
    console.log("✅ Balance suficiente para deploy");
  }
  
  console.log("\n=== INFORMACIÓN DEL DEPLOY ===");
  console.log("Red: Polygon Amoy Testnet");
  console.log("Chain ID: 80002");
  console.log("RPC URL:", AMOY_RPC_URL);
  console.log("Deployer:", wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "MATIC");
  
  // Verificar contratos disponibles
  const contractsPath = path.join(__dirname, "..", "contracts");
  const contracts = fs.readdirSync(contractsPath).filter(f => f.endsWith('.sol'));
  
  console.log("\n📄 CONTRATOS DISPONIBLES:");
  contracts.forEach(contract => {
    console.log(`- ${contract}`);
  });
  
  // Guardar información del deploy
  const deployInfo = {
    network: "amoy",
    chainId: 80002,
    rpcUrl: AMOY_RPC_URL,
    deployer: wallet.address,
    balance: ethers.formatEther(balance),
    timestamp: new Date().toISOString(),
    status: balance >= ethers.parseEther("0.01") ? "ready_for_deploy" : "insufficient_balance",
    contracts: contracts,
    nextSteps: [
      "1. Asegurar balance suficiente de MATIC",
      "2. Configurar Hardhat correctamente",
      "3. Ejecutar deploy de contratos",
      "4. Verificar contratos en PolygonScan"
    ]
  };
  
  // Crear directorio si no existe
  const contractsDir = path.join(__dirname, "..", "deployed-contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  // Guardar información
  const infoPath = path.join(contractsDir, "amoy-deploy-info.json");
  fs.writeFileSync(infoPath, JSON.stringify(deployInfo, null, 2));
  
  console.log("\n✅ Información guardada en:", infoPath);
  console.log("\n📋 PRÓXIMOS PASOS:");
  console.log("1. Obtener MATIC del faucet si es necesario");
  console.log("2. Configurar Hardhat para deploy");
  console.log("3. Ejecutar deploy de contratos CMPX, GTK, CoupleNFT, StakingPool");
  
  console.log("\n🔗 ENLACES ÚTILES:");
  console.log("- Faucet Amoy: https://faucet.polygon.technology/");
  console.log("- Explorer: https://amoy.polygonscan.com/");
  console.log("- Documentación: https://docs.polygon.technology/");
}

main()
  .then(() => {
    console.log("\n✅ Verificación completada exitosamente!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
