# FlarePayProof - USDT0 Payments Portal with ProofRails

A production-ready, mobile-responsive React web application for the Flare ProofRails Hackathon (Track 1). This app enables merchants, freelancers, and teams to send/receive USDT0 on Flare Coston2 Testnet with automatic ISO 20022-aligned audit records via on-chain proof anchoring.

## 🚀 Live Demo

**https://flarepayproof.vercel.app**

## 📝 Deployed Smart Contracts (Coston2 Testnet)

| Contract | Address |
|----------|---------|
| FlarePayProof | `0x8E453a9EE27ea69998817E7C6307Be1ED00dAa92` |
| PaymentProcessor | `0xD952260dB8bF53f16532E763683B588576f85470` |
| TUSDT Test Token | `0x3e86507116aC86E292d69693c25db78E71C3a36f` |

**Explorer**: https://coston2-explorer.flare.network

## ✨ Features

- 🔐 **Wallet Integration**: WalletConnect v2 + MetaMask support for Flare mainnet
- 💰 **USDT0 Payments**: Send and receive USDT0 (6 decimals) on Flare mainnet
- 📄 **Payment Requests**: Create shareable payment links with QR codes
- 🔍 **Transaction Tracking**: Real-time transaction monitoring with Flare explorer links
- 📊 **ISO 20022 Proofs**: Generate compliant audit records via ProofRails API
- 📥 **Export Options**: Download proofs as JSON or PDF
- 📱 **Mobile-First UI**: Stripe Checkout-inspired responsive design
- 🔄 **Transaction History**: Filter by status, date range, and more

## 🛠 Tech Stack

- **Frontend**: React 18 + Create React App
- **Styling**: TailwindCSS (CDN)
- **Blockchain**: ethers.js v6 + Flare mainnet
- **Wallet**: WalletConnect v2 + MetaMask
- **State Management**: useContext + useReducer
- **PDF Generation**: jsPDF + html2canvas
- **QR Codes**: qrcode.react
- **Routing**: react-router-dom v7

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- MetaMask browser extension or WalletConnect-compatible wallet
- Flare mainnet FLR tokens (for gas fees)
- USDT0 tokens on Flare mainnet

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd flarepayproof
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# ProofRails API (get from https://proofrails.com)
REACT_APP_PROOFRAILS_API_KEY=your_key_here

# WalletConnect (get from https://cloud.walletconnect.com)
REACT_APP_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: Supabase for session management
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
```

### 3. Run Development Server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `build/` directory.

## 🌐 Network Configuration

### Flare Testnet (Coston2) - Current Configuration

- **Chain ID**: 114
- **RPC URL**: https://coston2-api.flare.network/ext/C/rpc
- **Explorer**: https://coston2-explorer.flare.network
- **Native Token**: C2FLR (for gas)
- **Faucet**: https://faucet.flare.network

### Test USDT Token

- **Contract**: Deploy your own ERC20 test token
- **Decimals**: 6
- **Symbol**: TUSDT
- **Get Test Tokens**: Deploy a test ERC20 contract or use faucet

### 🚀 Getting Testnet Tokens

1. **Get C2FLR (for gas)**:
   - Visit https://faucet.flare.network
   - Connect your wallet
   - Select Coston2 network
   - Request test tokens

2. **Get Test USDT**:
   - Deploy your own ERC20 test token contract
   - Or use the SimpleToken.sol contract included in `/contracts`
   - Mint yourself test tokens for testing

## 📖 How to Use

### For Payment Recipients (Merchants/Freelancers)

1. **Connect Wallet**: Click "Connect Wallet" and approve the connection
2. **Create Payment Request**:
   - Enter amount in USDT0
   - Add recipient address (your address or customer's)
   - Add optional memo/description
   - Set optional expiry date
3. **Share Payment Link**: Copy the generated link or show QR code to payer
4. **Track Payment**: View transaction status in the dashboard
5. **Generate Proof**: Once confirmed, generate ISO 20022 proof
6. **Download Records**: Export proof as JSON or PDF for accounting

### For Payers (Customers)

1. **Open Payment Link**: Click the link or scan QR code from merchant
2. **Review Details**: Check amount, recipient, and memo
3. **Connect Wallet**: Connect your Flare wallet
4. **Confirm Payment**: Click "Pay" and approve the transaction
5. **Get Confirmation**: Receive transaction hash and explorer link

## 🔧 Configuration Files

### Flare Config ([src/config/flareConfig.js](src/config/flareConfig.js))

```javascript
export const FLARE_CONFIG = {
  chainId: 14,
  chainName: 'Flare Mainnet',
  rpcUrl: 'https://flare-api.flare.network/ext/C/rpc',
  explorerUrl: 'https://flare-explorer.flare.network'
};
```

### USDT0 Config

```javascript
export const USDT0_CONFIG = {
  address: '0x96B41289D90444B8adD57e6F265DB5aE8651DF29',
  decimals: 6,
  symbol: 'USDT0'
};
```

## 🏗 Project Structure

```
flarepayproof/
├── public/
│   └── index.html              # HTML template with TailwindCSS CDN
├── src/
│   ├── components/
│   │   ├── Header.js           # Wallet connection header
│   │   ├── CreatePayment.js    # Payment request form
│   │   ├── PaymentPage.js      # Payment execution page
│   │   └── Dashboard.js        # Transaction history
│   ├── context/
│   │   ├── WalletContext.js    # Wallet state management
│   │   └── PaymentContext.js   # Payment state management
│   ├── services/
│   │   └── proofRailsService.js # ProofRails API integration
│   ├── config/
│   │   └── flareConfig.js      # Network configuration
│   ├── App.js                  # Main app component
│   ├── index.js                # React entry point
│   └── index.css               # Global styles
├── package.json
├── .env.example
└── README.md
```

## 🔐 Security Notes

- **Non-Custodial**: App never stores private keys or seeds
- **Client-Side Only**: All transactions signed in user's wallet
- **Mainnet Only**: No testnet or mock data in production
- **Verify Contracts**: Always verify token contract addresses
- **HTTPS Required**: Use HTTPS in production for security

## 🚢 Deployment

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm run build
# Upload build/ directory to Netlify or use CLI
netlify deploy --prod --dir=build
```

### Environment Variables

Add these to your deployment platform:

- `REACT_APP_PROOFRAILS_API_KEY`
- `REACT_APP_WALLETCONNECT_PROJECT_ID`
- `REACT_APP_SUPABASE_URL` (optional)
- `REACT_APP_SUPABASE_ANON_KEY` (optional)

## 🧪 Testing

### Manual Testing Checklist

- [ ] Connect MetaMask to Flare mainnet
- [ ] Display correct USDT0 balance
- [ ] Create payment request with valid parameters
- [ ] Generate QR code and payment link
- [ ] Open payment link in new tab
- [ ] Execute payment with sufficient balance
- [ ] View transaction on Flare explorer
- [ ] Generate ISO 20022 proof after confirmation
- [ ] Download proof as JSON and PDF
- [ ] Filter transactions by status and date

### Test with Small Amounts

⚠️ **Important**: Start with small USDT0 amounts (e.g., 0.01 USDT0) for testing!

## 📚 API References

- **Flare Network**: https://docs.flare.network/
- **ProofRails**: https://docs.proofrails.com/
- **WalletConnect**: https://docs.walletconnect.com/
- **ethers.js v6**: https://docs.ethers.org/v6/

## 🐛 Troubleshooting

### "Wrong Network" Error

- Ensure MetaMask is connected to Flare mainnet (Chain ID: 14)
- The app will prompt to add/switch networks automatically

### "Insufficient Balance" Error

- Check FLR balance for gas fees
- Verify USDT0 balance is sufficient

### ProofRails API Errors

- Check API key in `.env` file
- Verify ProofRails service is accessible
- App falls back to mock proofs in development

### Transaction Not Confirming

- Check Flare network status
- Verify sufficient gas (FLR) for transaction
- View transaction on explorer for details

## 🤝 Contributing

This is a hackathon project. For production use:

1. Implement proper error handling
2. Add comprehensive testing
3. Set up Supabase for persistent storage
4. Add user authentication
5. Implement rate limiting
6. Add transaction caching

## 📄 License

MIT License - see LICENSE file for details

## 🏆 Hackathon Info

- **Event**: Flare ProofRails Hackathon
- **Track**: Track 1 - USDT0 Payments Portal
- **Timeline**: 48-hour sprint
- **Network**: Flare Mainnet (LIVE)

## ⚠️ Disclaimer

This is a hackathon project. While functional on mainnet, use at your own risk. Always verify:
- Contract addresses before sending funds
- Transaction details before signing
- Gas prices and network congestion
- Small test amounts before large transfers

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check Flare Network documentation
- Review ProofRails API docs

---

**Built with ❤️ for the Flare ProofRails Hackathon**
