// Flare Testnet Configuration (Coston2)
export const FLARE_CONFIG = {
  chainId: 114,
  chainName: 'Flare Testnet Coston2',
  rpcUrl: 'https://coston2-api.flare.network/ext/C/rpc',
  explorerUrl: 'https://coston2-explorer.flare.network',
  explorerApi: 'https://coston2-explorer.flare.network/api',
  nativeCurrency: {
    name: 'Coston2 Flare',
    symbol: 'C2FLR',
    decimals: 18
  }
};

// Test USDT Token Configuration (for Coston2 testnet)
// Deployed SimpleTestToken contract on Coston2
export const USDT0_CONFIG = {
  // Deployed test token address on Coston2
  address: '0x0024cD1AE97d42e3eEA57f7194473F6a83513FAB',
  decimals: 6,
  symbol: 'TUSDT',
  name: 'Test USDT (Coston2 Testnet)'
};

// ERC20 ABI (minimal for USDT0 operations)
export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

// ProofRails API Configuration
export const PROOFRAILS_CONFIG = {
  // ProofRails API endpoint (check official documentation)
  apiUrl: 'https://api.proofrails.com/v1',
  // You'll need to get API key from ProofRails dashboard
  apiKey: process.env.REACT_APP_PROOFRAILS_API_KEY || ''
};

// WalletConnect Project ID
export const WALLETCONNECT_PROJECT_ID = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE';

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: process.env.REACT_APP_SUPABASE_URL || '',
  anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || ''
};
