const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FlarePayProof Contracts to Coston2 Testnet...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "C2FLR\n");

  if (balance === 0n) {
    console.error("❌ Error: Account has no C2FLR for gas fees!");
    console.log("Get testnet tokens from: https://faucet.flare.network");
    process.exit(1);
  }

  // FDC Hub address on Coston2
  const FDC_HUB_ADDRESS = "0x1c78A073E3BD2aCa4cc327d55FB0cD4f0549B55b";

  // ========== Deploy FlarePayProof ==========
  console.log("📋 Deploying FlarePayProof (ISO 20022 Proof Contract)...");
  
  const FlarePayProof = await hre.ethers.getContractFactory("FlarePayProof");
  const flarePayProof = await FlarePayProof.deploy(FDC_HUB_ADDRESS);
  await flarePayProof.waitForDeployment();
  const flarePayProofAddress = await flarePayProof.getAddress();
  
  console.log("✅ FlarePayProof deployed:", flarePayProofAddress);

  // ========== Deploy PaymentProcessor ==========
  console.log("\n📋 Deploying PaymentProcessor...");
  
  const PaymentProcessor = await hre.ethers.getContractFactory("PaymentProcessor");
  const paymentProcessor = await PaymentProcessor.deploy(flarePayProofAddress);
  await paymentProcessor.waitForDeployment();
  const paymentProcessorAddress = await paymentProcessor.getAddress();
  
  console.log("✅ PaymentProcessor deployed:", paymentProcessorAddress);

  // ========== Deploy SimpleTestToken (if not exists) ==========
  console.log("\n📋 Deploying SimpleTestToken (TUSDT)...");
  
  const initialSupply = 1000000; // 1 million tokens
  const SimpleTestToken = await hre.ethers.getContractFactory("SimpleTestToken");
  const testToken = await SimpleTestToken.deploy(initialSupply);
  await testToken.waitForDeployment();
  const testTokenAddress = await testToken.getAddress();
  
  console.log("✅ SimpleTestToken deployed:", testTokenAddress);

  // ========== Configure PaymentProcessor ==========
  console.log("\n⚙️  Configuring PaymentProcessor...");
  
  // Add TUSDT as supported token
  const addTokenTx = await paymentProcessor.addToken(
    testTokenAddress,
    "TUSDT",
    6
  );
  await addTokenTx.wait();
  console.log("✅ TUSDT added as supported token");

  // ========== Summary ==========
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📍 Contract Addresses:");
  console.log("   FlarePayProof:     ", flarePayProofAddress);
  console.log("   PaymentProcessor:  ", paymentProcessorAddress);
  console.log("   TestToken (TUSDT): ", testTokenAddress);
  
  console.log("\n🔗 Explorer Links:");
  console.log("   FlarePayProof:     ", `https://coston2-explorer.flare.network/address/${flarePayProofAddress}`);
  console.log("   PaymentProcessor:  ", `https://coston2-explorer.flare.network/address/${paymentProcessorAddress}`);
  console.log("   TestToken:         ", `https://coston2-explorer.flare.network/address/${testTokenAddress}`);

  console.log("\n⚙️  Update src/config/flareConfig.js with these addresses:");
  console.log(`
// Contract Addresses (Coston2 Testnet)
export const CONTRACT_ADDRESSES = {
  flarePayProof: '${flarePayProofAddress}',
  paymentProcessor: '${paymentProcessorAddress}',
  testToken: '${testTokenAddress}'
};
`);

  // Return addresses for verification
  return {
    flarePayProof: flarePayProofAddress,
    paymentProcessor: paymentProcessorAddress,
    testToken: testTokenAddress
  };
}

main()
  .then((addresses) => {
    console.log("\n✅ All contracts deployed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
