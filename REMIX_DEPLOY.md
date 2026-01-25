# 🚀 Deploy Test Token - Remix IDE Method (Easiest!)

Since Hardhat has ESM/Node version requirements, use **Remix IDE** for quick deployment.

## ✅ Step-by-Step Deployment with Remix

### 1. Get Testnet Tokens

Visit: https://faucet.flare.network
- Connect your wallet
- Select "Coston2"
- Request C2FLR tokens

### 2. Open Remix IDE

Go to: https://remix.ethereum.org

### 3. Create Contract File

1. In File Explorer, click "Create New File"
2. Name it: `SimpleTestToken.sol`
3. Copy and paste this contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleTestToken {
    string public name = "Test USDT";
    string public symbol = "TUSDT";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * 10**decimals;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
    
    // Faucet function for easy testing - anyone can mint tokens
    function faucet(uint256 amount) public {
        uint256 mintAmount = amount * 10**decimals;
        totalSupply += mintAmount;
        balanceOf[msg.sender] += mintAmount;
        emit Transfer(address(0), msg.sender, mintAmount);
    }
}
```

### 4. Compile Contract

1. Click "Solidity Compiler" tab (left sidebar)
2. Select compiler version: `0.8.20` or `0.8.x`
3. Click "Compile SimpleTestToken.sol"
4. Wait for green checkmark ✅

### 5. Deploy to Coston2

1. Click "Deploy & Run Transactions" tab
2. **IMPORTANT**: Change Environment to "Injected Provider - MetaMask"
3. MetaMask will popup - click "Connect"
4. **Verify network** in MetaMask shows "Flare Testnet Coston2"
   - If not, switch to Coston2 in MetaMask
5. Under "Deploy" section:
   - Contract: `SimpleTestToken`
   - Constructor parameter: `1000000` (1 million tokens)
6. Click **"Deploy"** (orange button)
7. Confirm transaction in MetaMask popup
8. Wait for deployment (~10-30 seconds)

### 6. Get Contract Address

After deployment:
1. Look in Remix terminal (bottom) for: "Contract deployed at: 0x..."
2. **Copy this address!** You'll need it.
3. Or expand "Deployed Contracts" section and copy address

### 7. Verify on Explorer

Visit: https://coston2-explorer.flare.network
- Paste your contract address in search
- You should see:
  - Contract creation transaction
  - Your 1,000,000 TUSDT balance

### 8. Update App Config

Edit `src/config/flareConfig.js`:

```javascript
export const USDT0_CONFIG = {
  address: '0xYOUR_CONTRACT_ADDRESS_HERE', // <-- Paste here!
  decimals: 6,
  symbol: 'TUSDT',
  name: 'Test USDT (Coston2 Testnet)'
};
```

### 9. Add Token to MetaMask

1. MetaMask > "Import tokens"
2. Paste your contract address
3. Symbol should auto-fill as "TUSDT"
4. Decimals: 6
5. Click "Add Custom Token"

You should see: **1,000,000.000000 TUSDT** 🎉

### 10. Rebuild & Deploy App

```bash
npm run build
npm start  # Test locally first
vercel --prod  # Deploy to production
```

## 🪙 Mint More Tokens (Optional)

In Remix "Deployed Contracts":
1. Expand your contract
2. Find `faucet` function
3. Enter amount (e.g., `10000`)
4. Click "transact"
5. Confirm in MetaMask

## ✅ Success Checklist

- [ ] Got C2FLR from faucet
- [ ] Compiled contract in Remix
- [ ] Deployed to Coston2
- [ ] Copied contract address
- [ ] Verified on explorer
- [ ] Updated `src/config/flareConfig.js`
- [ ] Added token to MetaMask
- [ ] Can see 1M TUSDT balance
- [ ] Rebuilt app
- [ ] Tested locally

## 🎯 Quick Reference

**Network**: Coston2
**Chain ID**: 114
**RPC**: https://coston2-api.flare.network/ext/C/rpc
**Faucet**: https://faucet.flare.network
**Explorer**: https://coston2-explorer.flare.network
**Remix**: https://remix.ethereum.org

## 📝 Example Contract Address

After deployment, you'll get something like:
```
0x1234567890AbCdEf1234567890AbCdEf12345678
```

This goes in your config file!

## 🐛 Troubleshooting

**MetaMask not connecting?**
- Refresh Remix page
- Disconnect and reconnect in MetaMask
- Check MetaMask is unlocked

**Wrong network?**
- MetaMask > Network dropdown
- Select "Flare Testnet Coston2"
- Or add manually (see TESTNET_SETUP.md)

**Out of gas?**
- Visit faucet again
- Wait 24h for rate limit reset
- Use different wallet address

**Deployment fails?**
- Check you have C2FLR
- Verify constructor parameter is number only
- Try smaller gas limit
- Wait a minute and retry

---

## 🎉 Done!

Your test token is deployed! Now update your app config and deploy.

**Next**: See [TESTNET_SETUP.md](TESTNET_SETUP.md) for complete testing guide.
