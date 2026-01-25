const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SimpleTestToken to Flare Coston2 Testnet...\n");

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

  // Deploy contract
  const initialSupply = 1000000; // 1 million tokens
  console.log("📋 Contract parameters:");
  console.log("   - Initial Supply:", initialSupply, "tokens");
  console.log("   - Token Name: Test USDT");
  console.log("   - Symbol: TUSDT");
  console.log("   - Decimals: 6\n");

  const SimpleTestToken = await hre.ethers.getContractFactory("SimpleTestToken");
  const token = await SimpleTestToken.deploy(initialSupply);

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("✅ SimpleTestToken deployed successfully!");
  console.log("📍 Contract Address:", tokenAddress);
  console.log("🔗 Explorer:", `https://coston2-explorer.flare.network/address/${tokenAddress}`);
  console.log("\n⚙️  Update src/config/flareConfig.js with this address:");
  console.log(`   address: '${tokenAddress}',\n`);

  // Verify deployment
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const totalSupply = await token.totalSupply();

  console.log("📊 Token Details:");
  console.log("   - Name:", name);
  console.log("   - Symbol:", symbol);
  console.log("   - Decimals:", decimals.toString());
  console.log("   - Total Supply:", hre.ethers.formatUnits(totalSupply, decimals), symbol);
  console.log("   - Deployer Balance:", hre.ethers.formatUnits(await token.balanceOf(deployer.address), decimals), symbol);

  console.log("\n🎉 Deployment complete!");
  console.log("\n📝 Next steps:");
  console.log("1. Update src/config/flareConfig.js with the contract address");
  console.log("2. Run: npm run build");
  console.log("3. Test locally: npm start");
  console.log("4. Deploy app: vercel --prod");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
