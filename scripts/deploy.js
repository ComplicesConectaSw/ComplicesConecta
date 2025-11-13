// ComplicesConecta v3.7.0 - Script de Deploy para Contratos Blockchain
// Fecha: 13 Nov 2025 | Autor: Ing. Juan Carlos Méndez Nataren
// Descripción: Deploy de contratos CMPX, CoupleNFT y StakingPool en Mumbai/Polygon

const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deploy de contratos ComplicesConecta v3.7.0...\n");

  // Obtener el deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts con la cuenta:", deployer.address);
  console.log("💰 Balance de la cuenta:", ethers.utils.formatEther(await deployer.getBalance()), "MATIC\n");

  // 1. Deploy CMPX Token
  console.log("1️⃣ Deploying CMPX Token...");
  const CMPX = await ethers.getContractFactory("CMPX");
  const cmpx = await CMPX.deploy();
  await cmpx.deployed();
  console.log("✅ CMPX Token deployed to:", cmpx.address);

  // 2. Deploy CoupleNFT
  console.log("\n2️⃣ Deploying CoupleNFT...");
  const CoupleNFT = await ethers.getContractFactory("CoupleNFT");
  const coupleNFT = await CoupleNFT.deploy();
  await coupleNFT.deployed();
  console.log("✅ CoupleNFT deployed to:", coupleNFT.address);

  // 3. Deploy StakingPool
  console.log("\n3️⃣ Deploying StakingPool...");
  const StakingPool = await ethers.getContractFactory("StakingPool");
  const stakingPool = await StakingPool.deploy(
    cmpx.address,        // CMPX token address
    coupleNFT.address    // CoupleNFT address
  );
  await stakingPool.deployed();
  console.log("✅ StakingPool deployed to:", stakingPool.address);

  // 4. Configurar permisos y roles
  console.log("\n4️⃣ Configurando permisos y roles...");
  
  // Dar rol de minter al StakingPool en CMPX
  const MINTER_ROLE = await cmpx.MINTER_ROLE();
  await cmpx.grantRole(MINTER_ROLE, stakingPool.address);
  console.log("✅ StakingPool agregado como minter de CMPX");

  // Dar rol de minter al deployer en CoupleNFT (temporal)
  const NFT_MINTER_ROLE = await coupleNFT.MINTER_ROLE();
  await coupleNFT.grantRole(NFT_MINTER_ROLE, deployer.address);
  console.log("✅ Deployer agregado como minter de CoupleNFT");

  // 5. Configurar modo testnet en CMPX
  console.log("\n5️⃣ Configurando modo testnet...");
  await cmpx.setTestnetMode(true);
  console.log("✅ Modo testnet activado en CMPX");

  // 6. Mint inicial de tokens para testnet (250M CMPX)
  console.log("\n6️⃣ Minting tokens iniciales para testnet...");
  const testnetAmount = ethers.utils.parseEther("250000000"); // 250M CMPX
  await cmpx.mintTestnetTokens(deployer.address, testnetAmount);
  console.log("✅ 250M CMPX minteados para testnet");

  // 7. Verificar configuración
  console.log("\n7️⃣ Verificando configuración...");
  const totalSupply = await cmpx.totalSupply();
  const testnetMode = await cmpx.testnetMode();
  const deployerBalance = await cmpx.balanceOf(deployer.address);
  
  console.log("📊 Total Supply CMPX:", ethers.utils.formatEther(totalSupply));
  console.log("🧪 Modo Testnet:", testnetMode);
  console.log("💰 Balance Deployer:", ethers.utils.formatEther(deployerBalance), "CMPX");

  // 8. Resumen final
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOY COMPLETADO EXITOSAMENTE");
  console.log("=".repeat(60));
  console.log("📋 DIRECCIONES DE CONTRATOS:");
  console.log("   CMPX Token:    ", cmpx.address);
  console.log("   CoupleNFT:     ", coupleNFT.address);
  console.log("   StakingPool:   ", stakingPool.address);
  console.log("\n📋 CONFIGURACIÓN:");
  console.log("   Network:       ", (await ethers.provider.getNetwork()).name);
  console.log("   Chain ID:      ", (await ethers.provider.getNetwork()).chainId);
  console.log("   Deployer:      ", deployer.address);
  console.log("   Testnet Mode:  ", testnetMode);
  console.log("\n💡 PRÓXIMOS PASOS:");
  console.log("   1. Actualizar direcciones en WalletService.ts");
  console.log("   2. Verificar contratos en PolygonScan");
  console.log("   3. Configurar variables de entorno");
  console.log("   4. Probar funcionalidades en testnet");
  console.log("=".repeat(60));

  // 9. Guardar direcciones en archivo JSON
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      CMPX: cmpx.address,
      CoupleNFT: coupleNFT.address,
      StakingPool: stakingPool.address
    },
    configuration: {
      testnetMode: testnetMode,
      totalSupply: ethers.utils.formatEther(totalSupply),
      testnetTokens: ethers.utils.formatEther(testnetAmount)
    }
  };

  const fs = require('fs');
  const path = require('path');
  
  // Crear directorio deployments si no existe
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Guardar información del deployment
  const deploymentFile = path.join(deploymentsDir, `deployment-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Información del deployment guardada en:", deploymentFile);
}

// Ejecutar el script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error durante el deploy:", error);
    process.exit(1);
  });
