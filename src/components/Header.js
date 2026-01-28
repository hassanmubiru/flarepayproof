import React from 'react';
import { useWallet } from '../context/WalletContext';

const Header = () => {
  const { account, balance, isConnected, connectWallet, disconnectWallet, loading } = useWallet();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="bg-dark-800/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-500/30 rounded-lg sm:rounded-xl blur-lg group-hover:bg-brand-500/40 transition-all"></div>
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-brand-500 via-brand-400 to-brand-300 rounded-lg sm:rounded-xl flex items-center justify-center shadow-glow-brand">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">FlarePayProof</h1>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-gray-400">USDT0 Payments</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-accent-amber/20 to-accent-amber/10 text-accent-amber border border-accent-amber/30 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-accent-amber rounded-full mr-1.5 animate-pulse"></span>
                  Testnet
                </span>
              </div>
            </div>
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <>
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-accent-green/10 border border-accent-green/20">
                  <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                  <div className="text-right">
                    <p className="text-[10px] text-accent-green font-medium uppercase tracking-wider">Balance</p>
                    <p className="text-sm font-bold text-white">{parseFloat(balance).toFixed(2)} <span className="text-accent-green">USDT0</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="px-2 sm:px-4 py-2 sm:py-2.5 glass-card rounded-lg sm:rounded-xl">
                    <p className="hidden sm:block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Connected</p>
                    <p className="font-mono text-xs sm:text-sm font-medium text-white">{formatAddress(account)}</p>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="p-2 sm:p-2.5 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg sm:rounded-xl transition-all group"
                    title="Disconnect"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="btn-primary px-3 sm:px-6 py-2.5 sm:py-3 text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl disabled:opacity-50 flex items-center gap-1.5 sm:gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="hidden sm:inline">{loading ? 'Connecting...' : 'Connect Wallet'}</span>
                <span className="sm:hidden">{loading ? '...' : 'Connect'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Balance */}
        {isConnected && (
          <div className="sm:hidden mt-3 pt-3 border-t border-dark-600">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">USDT0 Balance</span>
              <span className="text-sm font-bold text-white">{parseFloat(balance).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
