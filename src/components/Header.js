import React from 'react';
import { useWallet } from '../context/WalletContext';

const Header = () => {
  const { account, balance, isConnected, connectWallet, disconnectWallet, loading } = useWallet();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">FlarePayProof</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Enterprise Payments</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
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
                  <p className="text-xs text-slate-500">USDT0 Balance</p>
                  <p className="text-sm font-semibold text-slate-900">{parseFloat(balance).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Connected</p>
                    <p className="font-mono text-sm text-slate-700">{formatAddress(account)}</p>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner"></span>
                    Connecting...
                  </span>
                ) : (
                  'Connect Wallet'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Balance */}
        {isConnected && (
          <div className="sm:hidden mt-3 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">USDT0 Balance</span>
              <span className="text-sm font-semibold text-slate-900">{parseFloat(balance).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
