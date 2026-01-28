import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import { FLARE_CONFIG, USDT0_CONFIG, ERC20_ABI } from '../config/flareConfig';

// Wallet state reducer
const walletReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACCOUNT':
      return { ...state, account: action.payload, isConnected: true };
    case 'SET_BALANCE':
      return { ...state, balance: action.payload };
    case 'SET_PROVIDER':
      return { ...state, provider: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'DISCONNECT':
      return { ...initialState };
    default:
      return state;
  }
};

const initialState = {
  account: null,
  balance: '0',
  provider: null,
  isConnected: false,
  loading: false,
  error: null
};

const WalletContext = createContext();

// Detect if user is on mobile
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if we're inside MetaMask's in-app browser
const isMetaMaskBrowser = () => {
  return window.ethereum && window.ethereum.isMetaMask;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // On mobile without ethereum provider, open in MetaMask app
      if (!window.ethereum) {
        if (isMobile()) {
          // Deep link to MetaMask mobile app - opens the current page in MetaMask browser
          const currentUrl = window.location.href;
          const metamaskDeepLink = `https://metamask.app.link/dapp/${currentUrl.replace(/^https?:\/\//, '')}`;
          window.location.href = metamaskDeepLink;
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        throw new Error('MetaMask not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];

      // Create provider
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      // Check if on Flare mainnet
      if (Number(network.chainId) !== FLARE_CONFIG.chainId) {
        // Try to switch to Flare mainnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${FLARE_CONFIG.chainId.toString(16)}` }]
          });
        } catch (switchError) {
          // If chain doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${FLARE_CONFIG.chainId.toString(16)}`,
                chainName: FLARE_CONFIG.chainName,
                rpcUrls: [FLARE_CONFIG.rpcUrl],
                nativeCurrency: FLARE_CONFIG.nativeCurrency,
                blockExplorerUrls: [FLARE_CONFIG.explorerUrl]
              }]
            });
          } else {
            throw switchError;
          }
        }
      }

      dispatch({ type: 'SET_ACCOUNT', payload: account });
      dispatch({ type: 'SET_PROVIDER', payload: provider });

      // Fetch USDT0 balance
      await fetchBalance(provider, account);

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fetch USDT0 balance
  const fetchBalance = async (provider, account) => {
    try {
      const usdt0Contract = new Contract(USDT0_CONFIG.address, ERC20_ABI, provider);
      const balance = await usdt0Contract.balanceOf(account);
      const formattedBalance = formatUnits(balance, USDT0_CONFIG.decimals);
      dispatch({ type: 'SET_BALANCE', payload: formattedBalance });
    } catch (error) {
      console.error('Error fetching balance:', error);
      dispatch({ type: 'SET_BALANCE', payload: '0' });
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    dispatch({ type: 'DISCONNECT' });
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (state.provider && state.account) {
      await fetchBalance(state.provider, state.account);
    }
  };

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    ...state,
    connectWallet,
    disconnectWallet,
    refreshBalance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
