import React from 'react';
import { useWallet } from '../context/WalletContext';

const Header = () => {
  const { account, balance, isConnected, connectWallet, disconnectWallet, loading } = useWallet();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="bg-dark-800 border-b border-dark-600">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-400 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">FlarePayProof</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">USDT0 Payments</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
                  Testnet
                </span>
              </div>
            </div>
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <>
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className="text-sm font-bold text-white">{parseFloat(balance).toFixed(2)} <span className="text-brand-400">USDT0</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Wallet</p>
                    <p className="font-mono text-sm text-gray-200">{formatAddress(account)}</p>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-600 hover:to-brand-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
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
