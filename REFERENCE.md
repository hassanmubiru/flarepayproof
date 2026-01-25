# FlarePayProof - Quick Reference Card

## 🎯 Essential Information

### Network Details
```
Network:     Flare Mainnet
Chain ID:    14
RPC URL:     https://flare-api.flare.network/ext/C/rpc
Explorer:    https://flare-explorer.flare.network
Symbol:      FLR (native token for gas)
```

### USDT0 Token
```
Contract:    0x96B41289D90444B8adD57e6F265DB5aE8651DF29
Symbol:      USDT0
Decimals:    6
```

### Quick Commands
```bash
# Install
npm install --legacy-peer-deps

# Development
npm start                    # Start dev server (localhost:3000)

# Build
npm run build               # Create production build

# Test
./test-dev.sh              # Run development tests

# Deploy
vercel --prod              # Deploy to Vercel
netlify deploy --prod      # Deploy to Netlify
```

### Environment Variables
```env
REACT_APP_PROOFRAILS_API_KEY=your_key_here
REACT_APP_WALLETCONNECT_PROJECT_ID=your_id_here
REACT_APP_SUPABASE_URL=your_url (optional)
REACT_APP_SUPABASE_ANON_KEY=your_key (optional)
```

### Project Structure
```
src/
├── components/          # UI components
│   ├── Header.js       # Wallet connection
│   ├── CreatePayment.js # Payment form
│   ├── PaymentPage.js  # Payment execution
│   └── Dashboard.js    # Transaction history
├── context/            # State management
│   ├── WalletContext.js # Wallet state
│   └── PaymentContext.js # Payment operations
├── services/           # External integrations
│   └── proofRailsService.js # ISO 20022 proofs
├── config/             # Configuration
│   └── flareConfig.js  # Network & token config
├── App.js             # Main app + routing
├── index.js           # React entry point
└── index.css          # Global styles
```

### File Locations

**Config**: `src/config/flareConfig.js`
**Wallet Logic**: `src/context/WalletContext.js`
**Payment Logic**: `src/context/PaymentContext.js`
**ProofRails**: `src/services/proofRailsService.js`

### Important URLs

**Docs**: `README.md`
**Quick Start**: `QUICKSTART.md`
**Deployment**: `DEPLOYMENT.md`
**Summary**: `PROJECT_SUMMARY.md`
**Checklist**: `HACKATHON_CHECKLIST.md`

### Common Tasks

#### Add MetaMask Network
```javascript
Network Name: Flare Mainnet
RPC URL: https://flare-api.flare.network/ext/C/rpc
Chain ID: 14
Currency Symbol: FLR
Block Explorer: https://flare-explorer.flare.network
```

#### Add USDT0 to MetaMask
```
Token Contract: 0x96B41289D90444B8adD57e6F265DB5aE8651DF29
Token Symbol: USDT0
Token Decimals: 6
```

#### Payment Link Format
```
https://your-domain.com/pay?id={id}&amount={amount}&recipient={address}&memo={memo}
```

#### LocalStorage Keys
```javascript
'flarepay_payments'  // Array of payment objects
```

### Status Indicators

```
pending     → Yellow  → Payment created, not executed
confirming  → Blue    → Transaction submitted, awaiting confirmation
confirmed   → Green   → Transaction confirmed on blockchain
failed      → Red     → Transaction failed
```

### Troubleshooting

**Wrong Network**: App auto-prompts to add/switch to Flare mainnet

**No Balance**: Need FLR for gas + USDT0 for payments

**Build Fails**: Run `npm install --legacy-peer-deps`

**Port Conflict**: Run `PORT=3001 npm start`

**API Errors**: Check .env file has correct keys

### Key Functions

**WalletContext**:
- `connectWallet()` - Connect MetaMask
- `disconnectWallet()` - Disconnect wallet
- `refreshBalance()` - Update USDT0 balance

**PaymentContext**:
- `createPaymentRequest()` - Create new payment
- `executeTransfer()` - Execute USDT0 transfer
- `generatePaymentLink()` - Create shareable link
- `loadPaymentsFromStorage()` - Load history

**ProofRailsService**:
- `generateProof()` - Create ISO 20022 proof
- `downloadProofJSON()` - Export as JSON
- `downloadProofPDF()` - Export as PDF

### Component Props

**CreatePayment**:
```javascript
<CreatePayment onPaymentCreated={(payment) => {...}} />
```

**PaymentPage** (uses URL params):
```javascript
?id=...&amount=...&recipient=...&memo=...
```

### Testing Checklist

- [ ] Wallet connects
- [ ] Balance displays
- [ ] Payment creates
- [ ] QR code generates
- [ ] Link copies
- [ ] Payment executes
- [ ] Explorer link works
- [ ] Proof generates
- [ ] JSON downloads
- [ ] PDF downloads
- [ ] Filters work
- [ ] Mobile responsive

### Performance

**Build Size**: ~295 KB (gzipped)
**First Load**: < 3s
**Transaction**: ~5-15s (network dependent)

### Security Notes

- Never commit .env file
- Always verify recipient addresses
- Test with small amounts first
- Use HTTPS in production
- Keys stay in wallet (non-custodial)

### API Endpoints

**Flare RPC**: https://flare-api.flare.network/ext/C/rpc
**ProofRails**: https://api.proofrails.com/v1
**Flare Explorer**: https://flare-explorer.flare.network

### Contact & Resources

**Flare Docs**: https://docs.flare.network/
**ProofRails Docs**: https://docs.proofrails.com/
**WalletConnect**: https://docs.walletconnect.com/
**ethers.js**: https://docs.ethers.org/v6/

---

**💡 Pro Tips**:
- Start dev server with `npm start`
- Test build before deploying: `npm run build`
- Use `--legacy-peer-deps` for npm install
- Check browser console for errors
- Verify Flare mainnet before transactions
- Keep API keys in .env, never commit
- Test with 0.01 USDT0 amounts
- Mobile test with actual devices

**📱 Mobile Development**:
```bash
# Find your IP
ipconfig (Windows) or ifconfig (Mac/Linux)

# Access from mobile
http://YOUR_IP:3000
```

**🚀 Quick Deploy**:
```bash
# Vercel
vercel --prod

# Netlify  
npm run build
netlify deploy --prod --dir=build
```

---

**Keep this reference handy for quick lookups! 📌**
