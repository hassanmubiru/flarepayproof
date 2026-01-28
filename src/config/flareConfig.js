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
  address: '0x3e86507116aC86E292d69693c25db78E71C3a36f',
  decimals: 6,
  symbol: 'TUSDT',
  name: 'Test USDT (Coston2 Testnet)'
};

// Smart Contract Addresses (Coston2 Testnet)
export const CONTRACT_ADDRESSES = {
  flarePayProof: '0x8E453a9EE27ea69998817E7C6307Be1ED00dAa92',
  paymentProcessor: '0xD952260dB8bF53f16532E763683B588576f85470',
  testToken: '0x3e86507116aC86E292d69693c25db78E71C3a36f'
};

// FlarePayProof Contract ABI
export const FLARE_PAY_PROOF_ABI = [
  'function createProof(bytes32 _txHash, address _recipient, address _tokenContract, uint256 _amount, uint8 _decimals, string _tokenSymbol, string _memo) external payable returns (bytes32 proofId)',
  'function verifyProofWithFDC(bytes32 _proofId, uint256 _fdcRoundId, bytes32 _merkleRoot) external',
  'function createPaymentRequest(address _recipient, address _tokenContract, uint256 _amount, string _memo, uint256 _expiresIn) external returns (bytes32 requestId)',
  'function fulfillPaymentRequest(bytes32 _requestId, bytes32 _proofId) external',
  'function getProof(bytes32 _proofId) external view returns (tuple(bytes32 proofId, string messageType, bytes32 txHash, uint256 blockNumber, uint256 timestamp, address sender, address recipient, address tokenContract, uint256 amount, uint8 decimals, string tokenSymbol, string memo, uint256 fdcRoundId, bytes32 merkleRoot, uint8 status, uint256 proofCreatedAt))',
  'function getProofByTxHash(bytes32 _txHash) external view returns (bytes32)',
  'function getUserProofs(address _user) external view returns (bytes32[])',
  'function getPaymentRequest(bytes32 _requestId) external view returns (tuple(bytes32 requestId, address creator, address recipient, address tokenContract, uint256 amount, string memo, uint256 createdAt, uint256 expiresAt, bool fulfilled, bytes32 proofId))',
  'function getUserPaymentRequests(address _user) external view returns (bytes32[])',
  'function getISO20022MessageId(bytes32 _proofId) external view returns (string)',
  'function isFDCVerified(bytes32 _proofId) external view returns (bool)',
  'function proofFee() external view returns (uint256)',
  'function totalProofs() external view returns (uint256)',
  'event ProofCreated(bytes32 indexed proofId, bytes32 indexed txHash, address indexed sender, address recipient, uint256 amount, string tokenSymbol)',
  'event ProofVerified(bytes32 indexed proofId, uint8 status, uint256 fdcRoundId, bytes32 merkleRoot)',
  'event PaymentRequestCreated(bytes32 indexed requestId, address indexed creator, address recipient, uint256 amount, uint256 expiresAt)',
  'event PaymentRequestFulfilled(bytes32 indexed requestId, bytes32 indexed proofId, address indexed payer)'
];

// PaymentProcessor Contract ABI
export const PAYMENT_PROCESSOR_ABI = [
  'function processPayment(address _recipient, address _tokenContract, uint256 _amount, string _memo) external returns (bytes32 paymentId, bytes32 proofId)',
  'function getPayment(bytes32 _paymentId) external view returns (tuple(bytes32 paymentId, address sender, address recipient, address tokenContract, uint256 amount, string memo, uint256 timestamp, bytes32 proofId))',
  'function getUserPayments(address _user) external view returns (bytes32[])',
  'function supportedTokens(address) external view returns (bool)',
  'function totalPayments() external view returns (uint256)',
  'event PaymentProcessed(bytes32 indexed paymentId, address indexed sender, address indexed recipient, address tokenContract, uint256 amount, bytes32 proofId)'
];

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

// ProofRails SDK Configuration (from FlareStudio)
// Get API key from: https://www.flarestudio.xyz/sdk/proofrails-sdk/create-api-key
export const PROOFRAILS_CONFIG = {
  apiKey: process.env.REACT_APP_PROOFRAILS_API_KEY || '',
  // SDK auto-detects network from wallet
  // Generates ISO 20022 compliant receipts (PAIN.001, CAMT.053)
  // Receipts are anchored on Flare network
  verifyUrl: 'https://www.flarestudio.xyz/verify',
  dashboardUrl: 'https://www.flarestudio.xyz/analytics-dashboard'
};

// WalletConnect Project ID
export const WALLETCONNECT_PROJECT_ID = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE';

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: process.env.REACT_APP_SUPABASE_URL || '',
  anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || ''
};
