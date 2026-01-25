# FlarePayProof - Deployment Guide

## Quick Deploy

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

4. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add:
     - `REACT_APP_PROOFRAILS_API_KEY`
     - `REACT_APP_WALLETCONNECT_PROJECT_ID`
     - `REACT_APP_SUPABASE_URL` (optional)
     - `REACT_APP_SUPABASE_ANON_KEY` (optional)

### Option 2: Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build the app:
```bash
npm run build
```

3. Deploy:
```bash
netlify deploy --prod --dir=build
```

4. Add environment variables:
```bash
netlify env:set REACT_APP_PROOFRAILS_API_KEY "your-key"
netlify env:set REACT_APP_WALLETCONNECT_PROJECT_ID "your-id"
```

### Option 3: GitHub Pages

1. Add homepage to package.json:
```json
"homepage": "https://yourusername.github.io/flarepayproof"
```

2. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Add deploy scripts to package.json:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

4. Deploy:
```bash
npm run deploy
```

Note: For GitHub Pages, you'll need to handle environment variables differently since they're not supported. Consider using a different deployment option.

## Environment Setup

Before deploying, ensure you have:

1. **ProofRails API Key**
   - Sign up at https://proofrails.com
   - Create a new project
   - Copy your API key

2. **WalletConnect Project ID**
   - Go to https://cloud.walletconnect.com
   - Create a new project
   - Copy your Project ID

3. **Supabase (Optional)**
   - Sign up at https://supabase.com
   - Create a new project
   - Copy URL and anon key from project settings

## Post-Deployment Checklist

- [ ] Verify HTTPS is enabled
- [ ] Test wallet connection on Flare mainnet
- [ ] Test payment creation and QR code generation
- [ ] Test payment execution with small amount
- [ ] Verify ProofRails integration
- [ ] Test on mobile devices
- [ ] Check all links and redirects work
- [ ] Verify environment variables are loaded

## Custom Domain (Optional)

### Vercel
```bash
vercel domains add yourdomain.com
```

### Netlify
- Go to Domain settings in dashboard
- Add custom domain
- Configure DNS records

## Monitoring

Monitor your deployment:
- Check Vercel/Netlify dashboard for build logs
- Monitor ProofRails API usage
- Track transaction volume
- Watch for errors in browser console

## Rollback

If something goes wrong:

### Vercel
```bash
vercel rollback
```

### Netlify
- Go to Deploys tab
- Click on previous successful deploy
- Click "Publish deploy"

## Performance Optimization

Already included:
- ✅ Code splitting via React
- ✅ Minified production build
- ✅ CDN for TailwindCSS
- ✅ Lazy loading of components
- ✅ Optimized images and assets

## Security Checklist

- ✅ All sensitive data in environment variables
- ✅ HTTPS enforced
- ✅ No private keys in code
- ✅ API keys properly secured
- ✅ CORS configured correctly
- ✅ Content Security Policy headers (configure in deployment platform)

## Troubleshooting

### Build Fails

Check:
- Node version (should be 16+)
- All dependencies installed
- No TypeScript errors
- Environment variables set correctly

### Runtime Errors

Check:
- Browser console for errors
- Network tab for failed API calls
- Flare network status
- ProofRails API status

### Wallet Connection Issues

- Verify Flare mainnet is configured correctly
- Check WalletConnect Project ID
- Ensure MetaMask is installed
- Check network connectivity

---

**Need help?** Open an issue on GitHub or check the main README.md
