# Smart Contract Deployment Guide

## 🚀 Deploy Test Token to Flare Coston2

This guide will help you deploy the SimpleTestToken contract to Flare Coston2 testnet.

## Prerequisites

- ✅ MetaMask or another Web3 wallet
- ✅ Testnet C2FLR tokens from [Flare Faucet](https://faucet.flare.network)
- ✅ Node.js 16+ installed

## Step-by-Step Deployment

### 1. Get Testnet Tokens

```bash
# Visit the Flare Faucet
https://faucet.flare.network

# Steps:
1. Connect your MetaMask wallet
2. Select "Coston2" network
3. Click "Request C2FLR"
4. Wait ~30 seconds for tokens
```

### 2. Set Up Private Key

**⚠️ IMPORTANT: Use a testnet-only wallet!**

1. Create a new MetaMask account for testnet
2. Export the private key:
   - MetaMask > Account Details > Export Private Key
   - Enter password and copy the key

3. Create `.env` file in project root:

```bash
cp .env.example .env
```

4. Edit `.env` and add your private key:

```env
PRIVATE_KEY=your_private_key_here_without_0x_prefix
```

**🔒 Security Note**: 
- Never use your mainnet wallet private key
- Never commit `.env` to git (already in .gitignore)
- This key is only for testnet deployment

### 3. Deploy the Contract

```bash
# Deploy to Coston2 testnet
npx hardhat run scripts/deploy.js --network coston2
```

Expected output:
```
🚀 Deploying SimpleTestToken to Flare Coston2 Testnet...

📝 Deploying with account: 0x1234...5678
💰 Account balance: 100.0 C2FLR

📋 Contract parameters:
   - Initial Supply: 1000000 tokens
   - Token Name: Test USDT
   - Symbol: TUSDT
   - Decimals: 6

✅ SimpleTestToken deployed successfully!
📍 Contract Address: 0xAbC...DeF
🔗 Explorer: https://coston2-explorer.flare.network/address/0xAbC...DeF

⚙️  Update src/config/flareConfig.js with this address:
   address: '0xAbC...DeF',

📊 Token Details:
   - Name: Test USDT
   - Symbol: TUSDT
   - Decimals: 6
   - Total Supply: 1000000.0 TUSDT
   - Deployer Balance: 1000000.0 TUSDT

🎉 Deployment complete!
```

### 4. Update App Configuration

Copy the deployed contract address and update `src/config/flareConfig.js`:

```javascript
export const USDT0_CONFIG = {
  address: '0xYOUR_DEPLOYED_ADDRESS', // Paste the address here
  decimals: 6,
  symbol: 'TUSDT',
  name: 'Test USDT (Coston2 Testnet)'
};
```

### 5. Verify on Explorer

Visit the explorer link to see your deployed contract:
```
https://coston2-explorer.flare.network/address/YOUR_ADDRESS
```

You should see:
- Contract creation transaction
- Token info (name, symbol, decimals)
- Your balance

### 6. Add Token to MetaMask

1. Open MetaMask
2. Switch to Coston2 network
3. Click "Import tokens"
4. Enter:
   - **Token Contract Address**: Your deployed address
   - **Token Symbol**: TUSDT
   - **Token Decimals**: 6
5. Click "Add Custom Token"

You should now see your 1,000,000 TUSDT balance!

## Alternative: Quick Deploy Script

Run everything in one command:

```bash
# Make sure you have C2FLR in your wallet first!
npm run deploy:testnet
```

## Mint Additional Tokens (Optional)

The contract includes a `faucet()` function to mint more tokens:

```bash
# Set your token address
export TOKEN_ADDRESS=0xYourDeployedAddress

# Mint 10,000 tokens
npx hardhat run scripts/mint-tokens.js --network coston2
```

Or use Remix IDE:
1. Go to https://remix.ethereum.org
2. Load your deployed contract
3. Call `faucet(10000)` function
4. Confirm transaction

## Troubleshooting

### "Insufficient funds for gas"
- Get more C2FLR from faucet
- Wait 24 hours if you hit rate limit
- Try a different wallet address

### "Private key error"
- Ensure PRIVATE_KEY is set in `.env`
- Remove `0x` prefix from private key
- Check for extra spaces

### "Network error"
- Check internet connection
- Verify RPC URL: https://coston2-api.flare.network/ext/C/rpc
- Try again in a few minutes

### "Contract deployment failed"
- Check you have enough C2FLR (need ~0.01 for gas)
- Verify Solidity version compatibility
- Check Hardhat config network settings

## Verify Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Got contract address
- [ ] Can see contract on explorer
- [ ] Updated `src/config/flareConfig.js`
- [ ] Added token to MetaMask
- [ ] Can see token balance
- [ ] Rebuilt app: `npm run build`
- [ ] Tested locally: `npm start`

## Next Steps After Deployment

1. **Update config file**:
   ```bash
   # Edit src/config/flareConfig.js with contract address
   nano src/config/flareConfig.js
   ```

2. **Rebuild app**:
   ```bash
   npm run build
   ```

3. **Test locally**:
   ```bash
   npm start
   # Visit http://localhost:3000
   ```

4. **Deploy to Vercel/Netlify**:
   ```bash
   vercel --prod
   # OR
   netlify deploy --prod --dir=build
   ```

5. **Share with testers**:
   - Give them the deployed app URL
   - Share token contract address
   - Point them to faucet for C2FLR

## Contract Functions

Your deployed token has these functions:

```solidity
// View functions (read-only)
name() → string                    // "Test USDT"
symbol() → string                  // "TUSDT"
decimals() → uint8                 // 6
totalSupply() → uint256           // Total token supply
balanceOf(address) → uint256      // Check balance

// State-changing functions
transfer(to, amount) → bool       // Send tokens
approve(spender, amount) → bool   // Approve spending
transferFrom(from, to, amount)    // Transfer from approved
faucet(amount)                    // Mint tokens (anyone can call!)
```

## Security Notes

✅ **Safe Practices**:
- Use testnet-only wallet
- Test with small amounts first
- Verify contract on explorer
- Keep private key secure

❌ **Avoid**:
- Using mainnet private key
- Committing `.env` to git
- Sharing private key
- Deploying to mainnet without audit

## Example: Full Deployment Workflow

```bash
# 1. Get testnet tokens
# Visit https://faucet.flare.network

# 2. Set up environment
cp .env.example .env
nano .env  # Add your private key

# 3. Deploy contract
npx hardhat run scripts/deploy.js --network coston2

# 4. Copy the contract address (e.g., 0xAbC...DeF)

# 5. Update config
nano src/config/flareConfig.js
# Paste: address: '0xAbC...DeF',

# 6. Rebuild and test
npm run build
npm start

# 7. Deploy to production
vercel --prod
```

## 🎉 Success!

You now have:
- ✅ Test token deployed on Coston2
- ✅ Contract address in config
- ✅ Tokens in your wallet
- ✅ App configured for testnet
- ✅ Ready to deploy and test!

---

**Need help?** Check the [TESTNET_SETUP.md](TESTNET_SETUP.md) or open an issue!
