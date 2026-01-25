# Flare Testnet (Coston2) Setup Guide

## 🧪 Testnet Configuration

This application is configured to run on **Flare Coston2 Testnet** for safe testing without real funds.

### Network Details

- **Network Name**: Flare Testnet Coston2
- **Chain ID**: 114
- **RPC URL**: https://coston2-api.flare.network/ext/C/rpc
- **Explorer**: https://coston2-explorer.flare.network
- **Currency Symbol**: C2FLR
- **Decimals**: 18

## 🪙 Getting Test Tokens

### 1. Get C2FLR (Gas Token)

Visit the Flare Faucet:
```
https://faucet.flare.network
```

Steps:
1. Connect your MetaMask wallet
2. Select "Coston2" network
3. Click "Request C2FLR"
4. Wait for tokens to arrive (~30 seconds)

### 2. Deploy Test USDT Token

#### Option A: Use Remix IDE (Recommended)

1. Go to https://remix.ethereum.org
2. Create new file: `SimpleTestToken.sol`
3. Copy the contract from `/contracts/SimpleTestToken.sol`
4. Compile with Solidity 0.8.0+
5. Deploy to Coston2:
   - Environment: "Injected Provider - MetaMask"
   - Connect to Coston2 network
   - Constructor parameter: `1000000` (1 million tokens)
   - Click "Deploy"
6. Copy the deployed contract address
7. Update `src/config/flareConfig.js` with the address

#### Option B: Use Hardhat/Foundry

```bash
# Install Hardhat
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers

# Deploy script
npx hardhat run scripts/deploy.js --network coston2
```

### 3. Update Configuration

Edit `src/config/flareConfig.js`:

```javascript
export const USDT0_CONFIG = {
  address: 'YOUR_DEPLOYED_TOKEN_ADDRESS', // Replace with your token address
  decimals: 6,
  symbol: 'TUSDT',
  name: 'Test USDT (Coston2 Testnet)'
};
```

### 4. Add Token to MetaMask

1. Open MetaMask
2. Switch to Coston2 network
3. Click "Import tokens"
4. Enter:
   - Token Contract Address: Your deployed token address
   - Token Symbol: TUSDT
   - Token Decimals: 6
5. Click "Add Custom Token"

### 5. Mint Test Tokens

If you deployed the SimpleTestToken contract, you can mint tokens:

```javascript
// In your browser console or use Remix
await contract.faucet(1000); // Mints 1000 TUSDT
```

Or use the Remix IDE:
1. Go to "Deployed Contracts" section
2. Find your contract
3. Call `faucet` function with amount (e.g., 1000)
4. Confirm transaction in MetaMask

## 🔧 MetaMask Network Setup

### Add Coston2 Network Manually

If MetaMask doesn't auto-add the network:

1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Click "Add a network manually"
5. Enter:
   - **Network Name**: Flare Testnet Coston2
   - **RPC URL**: https://coston2-api.flare.network/ext/C/rpc
   - **Chain ID**: 114
   - **Currency Symbol**: C2FLR
   - **Block Explorer**: https://coston2-explorer.flare.network
6. Click "Save"

### Auto-Add Network

The app will automatically prompt to add the network when you connect your wallet.

## 🧪 Testing Workflow

### 1. Get Testnet Tokens
- ✅ Get C2FLR from faucet
- ✅ Deploy test token contract
- ✅ Mint test USDT tokens

### 2. Update Config
- ✅ Add token address to config
- ✅ Rebuild app: `npm run build`

### 3. Test Application
- ✅ Connect wallet to Coston2
- ✅ Check TUSDT balance displays
- ✅ Create payment request
- ✅ Execute test payment
- ✅ Verify on explorer

## 📝 Example Token Addresses

You'll need to deploy your own, but here's what the contract will look like:

```
Token Name: Test USDT
Symbol: TUSDT
Decimals: 6
Type: ERC20
Network: Flare Coston2 (Chain ID: 114)
```

## 🔗 Useful Links

- **Faucet**: https://faucet.flare.network
- **Explorer**: https://coston2-explorer.flare.network
- **Remix IDE**: https://remix.ethereum.org
- **Flare Docs**: https://docs.flare.network/dev/tutorials/network-access/

## ⚠️ Important Notes

- **Testnet Only**: No real value, safe for testing
- **Free Tokens**: C2FLR is free from faucet
- **Reset Anytime**: Can request more tokens anytime
- **Public Network**: Transactions are public but worthless
- **Rate Limits**: Faucet has rate limits (usually 24h)

## 🐛 Troubleshooting

### Can't Get Faucet Tokens
- Wait 24 hours between requests
- Try different wallet address
- Check faucet status page

### Token Not Showing in MetaMask
- Verify contract address is correct
- Check you're on Coston2 network
- Try importing token manually

### Transaction Failing
- Ensure you have C2FLR for gas
- Check token balance is sufficient
- Verify contract address is correct
- Check network is Coston2 (114)

### App Not Connecting
- Clear MetaMask cache
- Switch networks back and forth
- Refresh page
- Check browser console for errors

## 🚀 Ready to Test!

Once you have:
- ✅ C2FLR in your wallet
- ✅ Test token deployed
- ✅ Token address in config
- ✅ Test tokens minted

You're ready to run:
```bash
npm start
```

And start testing payments on the Flare testnet! 🎉

---

**Remember**: This is a testnet. All tokens have NO real value. Perfect for testing!
