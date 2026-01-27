import React from 'react';
import { useWallet } from '../context/WalletContext';

const Header = () => {
  const { account, balance, isConnected, connectWallet, disconnectWallet, loading } = useWallet();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="glass-dark sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-flare-primary to-flare-secondary rounded-xl flex items-center justify-center shadow-glow animate-pulse-slow">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-flare-dark animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Flare<span className="gradient-text">PayProof</span>
              </h1>
              <p className="text-xs text-gray-400 font-medium">USDT0 Payments with ProofRails</p>
              <div className="flex items-center mt-1 space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5 animate-pulse"></span>
                  TESTNET (Coston2)
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
                <div className="hidden sm:block text-right">
                  <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">USDT0 Balance</div>
                  <div className="text-xl font-bold text-white">{parseFloat(balance).toFixed(2)}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                    <div className="text-xs text-gray-400 font-medium">Connected</div>
                    <div className="font-mono text-sm text-white font-medium">{formatAddress(account)}</div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition-all duration-200 hover:scale-105 font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-flare-primary to-flare-secondary hover:from-flare-secondary hover:to-flare-accent text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow hover:shadow-glow-lg hover:scale-105"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Connecting...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5z"/>
                    </svg>
                    <span>Connect Wallet</span>
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Balance Display */}
        {isConnected && (
          <div className="sm:hidden mt-4 p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">USDT0 Balance</div>
            <div className="text-2xl font-bold text-white">{parseFloat(balance).toFixed(2)}</div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
