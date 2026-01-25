# FlarePayProof - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites

Make sure you have:
- ✅ Node.js 16+ installed
- ✅ npm or yarn package manager
- ✅ MetaMask browser extension
- ✅ Some FLR tokens on Flare mainnet (for gas)
- ✅ USDT0 tokens on Flare mainnet (for testing)

### 2. Installation

```bash
# Navigate to project directory
cd flarepayproof

# Install dependencies
npm install --legacy-peer-deps
```

### 3. Configuration (Optional for Testing)

The app works without API keys for basic testing, but for full functionality:

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your keys:
# - REACT_APP_PROOFRAILS_API_KEY (for ISO 20022 proofs)
# - REACT_APP_WALLETCONNECT_PROJECT_ID (for WalletConnect)
```

### 4. Run Development Server

```bash
npm start
```

The app will open at **http://localhost:3000**

### 5. Connect Your Wallet

1. Click "Connect Wallet" in the header
2. Approve MetaMask connection
3. If prompted, switch to Flare mainnet (Chain ID: 14)
4. Your USDT0 balance will display automatically

### 6. Create Your First Payment Request

1. Go to "Create Payment" tab
2. Enter:
   - **Amount**: e.g., `0.01` USDT0
   - **Recipient**: Your wallet address or another address
   - **Memo**: "Test payment" (optional)
3. Click "Create Payment Request"
4. Copy the payment link or scan QR code

### 7. Execute a Payment

1. Open the payment link in a new tab (or different browser)
2. Connect your wallet
3. Review payment details
4. Click "Pay" and confirm in MetaMask
5. Wait for transaction confirmation
6. View on Flare Explorer

### 8. Generate Proof (After Confirmation)

1. Go to "Transaction History" tab
2. Find your confirmed transaction
3. Click "Generate Proof"
4. Download as JSON or PDF

## 📱 Test on Mobile

1. Make sure your computer and phone are on the same network
2. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. On your phone, navigate to: `http://YOUR_IP:3000`
4. Connect with WalletConnect or mobile MetaMask

## 🔧 Troubleshooting

### "Wrong Network" Error
- MetaMask will prompt to add/switch to Flare mainnet
- Click "Add Network" or "Switch Network"

### Can't See USDT0 Balance
- Make sure you're on Flare mainnet
- Verify USDT0 contract: `0x96B41289D90444B8adD57e6F265DB5aE8651DF29`
- Add token to MetaMask if needed

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Port 3000 Already in Use
```bash
# Use a different port
PORT=3001 npm start
```

## 📦 Build for Production

```bash
# Create production build
npm run build

# Test production build locally
npx serve -s build
```

## 🚢 Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy options:
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=build`

## 🧪 Testing Checklist

- [ ] Wallet connects successfully
- [ ] USDT0 balance displays correctly
- [ ] Payment request creates with QR code
- [ ] Payment link works in new tab
- [ ] Transaction executes successfully
- [ ] Transaction shows on Flare Explorer
- [ ] Proof generates after confirmation
- [ ] JSON and PDF downloads work
- [ ] Mobile responsive design works
- [ ] All filters work in dashboard

## 📚 Learn More

- [Full Documentation](README.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Flare Network Docs](https://docs.flare.network/)
- [ProofRails Docs](https://docs.proofrails.com/)

## 🆘 Need Help?

1. Check the [README.md](README.md) troubleshooting section
2. Review browser console for errors
3. Verify Flare network status
4. Check ProofRails API status
5. Open an issue on GitHub

## ⚠️ Important Notes

- **Start Small**: Test with small amounts (0.01 USDT0)
- **Mainnet Only**: This app uses live Flare mainnet
- **Gas Fees**: You need FLR for transaction gas
- **Non-Custodial**: Your keys never leave your wallet
- **Verify Addresses**: Always double-check recipient addresses

---

**Happy Building! 🎉**

For questions or issues, check the main README or open a GitHub issue.
