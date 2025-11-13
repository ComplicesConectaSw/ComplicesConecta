// ComplicesConecta v3.7.0 - Script de Deploy para Contratos Blockchain
// Fecha: 13 Nov 2025 | Autor: Ing. Juan Carlos Méndez Nataren
// Descripción: Deploy de contratos CMPX, CoupleNFT y StakingPool en Mumbai/Polygon
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deploy de contratos ComplicesConecta v3.7.0...\n");

  // Obtener el deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts con la cuenta:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("💰 Balance de la cuenta:", ethers.utils.formatEther(balance), "MATIC\n");

  try {
    // 1. Deploy CMPX Token
    console.log("1️⃣ Deploying CMPX Token...");
    const CMPX = await ethers.getContractFactory("CMPX");
    const cmpx = await CMPX.deploy();
    await cmpx.deployed();
    
    console.log("✅ CMPX Token deployed to:", cmpx.address);
    
    // Inicializar CMPX
    console.log("🔧 Inicializando CMPX Token...");
    await cmpx.initialize(deployer.address, true); // true = testnet mode
    console.log("✅ CMPX Token inicializado\n");

    // 2. Deploy CoupleNFT
    console.log("2️⃣ Deploying CoupleNFT...");
    const CoupleNFT = await ethers.getContractFactory("CoupleNFT");
    const coupleNFT = await CoupleNFT.deploy(cmpx.address);
    await coupleNFT.deployed();
    
    console.log("✅ CoupleNFT deployed to:", coupleNFT.address);

    // 3. Deploy StakingPool
    console.log("3️⃣ Deploying StakingPool...");
    const StakingPool = await ethers.getContractFactory("StakingPool");
    const stakingPool = await StakingPool.deploy(
      coupleNFT.address,
      cmpx.address, // GTK token (usando CMPX por ahora)
      cmpx.address  // CMPX token
    );
    await stakingPool.deployed();
    
    console.log("✅ StakingPool deployed to:", stakingPool.address);

    // Resumen final
    console.log("\n🎉 ¡Deploy completado exitosamente!");
    console.log("📋 Direcciones de contratos:");
    console.log("   CMPX Token:", cmpx.address);
    console.log("   CoupleNFT:", coupleNFT.address);
    console.log("   StakingPool:", stakingPool.address);
    
    console.log("\n🔗 Verificar en PolygonScan Mumbai:");
    console.log("   CMPX:", `https://mumbai.polygonscan.com/address/${cmpx.address}`);
    console.log("   CoupleNFT:", `https://mumbai.polygonscan.com/address/${coupleNFT.address}`);
    console.log("   StakingPool:", `https://mumbai.polygonscan.com/address/${stakingPool.address}`);

  } catch (error) {
    console.error("❌ Error durante el deploy:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  });
