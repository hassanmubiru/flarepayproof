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

// Flare Data Connector (FDC) Configuration
// FDC is Flare's enshrined oracle for verifiable cross-chain data attestation
export const FDC_CONFIG = {
  // FDC Verifier service (Coston2 testnet)
  verifierUrl: 'https://fdc-verifiers-testnet.flare.network',
  // Data Availability Layer for proof retrieval
  daLayerUrl: 'https://fdc-da-testnet.flare.network',
  // API key for FDC services (public testnet key)
  apiKey: process.env.REACT_APP_FDC_API_KEY || 'public-testnet',
  // FDC Hub contract on Coston2
  fdcHubAddress: '0x1c78A073E3BD2aCa4cc327d55FB0cD4f0549B55b',
  // FDC Verification contract
  fdcVerificationAddress: '0x...' // Retrieved via ContractRegistry
};

// ProofRails API Configuration (Legacy - now using FDC)
export const PROOFRAILS_CONFIG = {
  apiUrl: 'https://api.proofrails.com/v1',
  apiKey: process.env.REACT_APP_PROOFRAILS_API_KEY || ''
};

// WalletConnect Project ID
export const WALLETCONNECT_PROJECT_ID = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE';

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: process.env.REACT_APP_SUPABASE_URL || '',
  anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || ''
};
