import hre from "hardhat";

async function main() {
  // Replace with your deployed token address
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || "YOUR_TOKEN_ADDRESS_HERE";
  
  if (TOKEN_ADDRESS === "YOUR_TOKEN_ADDRESS_HERE") {
    console.error("❌ Please set TOKEN_ADDRESS environment variable");
    console.log("Usage: TOKEN_ADDRESS=0x... npx hardhat run scripts/mint-tokens.js --network coston2");
    process.exit(1);
  }

  const [signer] = await hre.ethers.getSigners();
  console.log("🪙 Minting tokens from:", signer.address);

  const token = await hre.ethers.getContractAt("SimpleTestToken", TOKEN_ADDRESS);
  
  const amount = 10000; // Mint 10,000 tokens
  console.log(`📝 Minting ${amount} TUSDT tokens...\n`);

  const tx = await token.faucet(amount);
  console.log("⏳ Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ Tokens minted successfully!");

  const balance = await token.balanceOf(signer.address);
  const decimals = await token.decimals();
  console.log("💰 Your balance:", hre.ethers.formatUnits(balance, decimals), "TUSDT");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
