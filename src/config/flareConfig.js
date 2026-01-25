// Flare Mainnet Configuration
export const FLARE_CONFIG = {
  chainId: 14,
  chainName: 'Flare Mainnet',
  rpcUrl: 'https://flare-api.flare.network/ext/C/rpc',
  explorerUrl: 'https://flare-explorer.flare.network',
  explorerApi: 'https://flare-explorer.flare.network/api',
  nativeCurrency: {
    name: 'Flare',
    symbol: 'FLR',
    decimals: 18
  }
};

// USDT0 Token Configuration
export const USDT0_CONFIG = {
  // This address needs to be fetched from Flare explorer
  // Common USDT0 addresses on Flare mainnet (verify via explorer):
  address: '0x96B41289D90444B8adD57e6F265DB5aE8651DF29', // Verify this address
  decimals: 6,
  symbol: 'USDT0',
  name: 'Tether USD (Bridged from Ethereum)'
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
