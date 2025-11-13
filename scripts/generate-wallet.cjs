// Script para generar una wallet de testing
const { ethers } = require("ethers");

async function generateWallet() {
  console.log("🔑 Generando wallet para testing...\n");
  
  // Crear wallet aleatoria
  const wallet = ethers.Wallet.createRandom();
  
  console.log("✅ Wallet generada:");
  console.log("📍 Address:", wallet.address);
  console.log("🔐 Private Key:", wallet.privateKey);
  console.log("🎯 Mnemonic:", wallet.mnemonic.phrase);
  
  console.log("\n📋 PASOS PARA USAR:");
  console.log("1. Copia la Private Key");
  console.log("2. Agrégala a tu archivo .env como:");
  console.log(`   PRIVATE_KEY="${wallet.privateKey}"`);
  console.log("3. Obtén MATIC gratis del faucet:");
  console.log("   https://faucet.polygon.technology/");
  console.log("4. Pega tu address:", wallet.address);
  console.log("5. Ejecuta el deploy:");
  console.log("   npx hardhat run scripts/deploy-simple.cjs --network mumbai");
  
  console.log("\n⚠️  IMPORTANTE:");
  console.log("- Esta wallet es SOLO para testing");
  console.log("- NUNCA uses esta private key en mainnet");
  console.log("- NO commitees la private key a Git");
}

generateWallet();
