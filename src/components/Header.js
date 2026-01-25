import React from 'react';
import { useWallet } from '../context/WalletContext';

const Header = () => {
  const { account, balance, isConnected, connectWallet, disconnectWallet, loading } = useWallet();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="bg-gradient-to-r from-flare-dark to-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-flare-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">FlarePayProof</h1>
              <p className="text-xs text-gray-400">USDT0 Payments with ProofRails</p>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
                <div className="hidden sm:block text-right">
                  <div className="text-sm text-gray-400">USDT0 Balance</div>
                  <div className="text-lg font-semibold">{parseFloat(balance).toFixed(2)}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-4 py-2 bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-400">Connected</div>
                    <div className="font-mono text-sm">{formatAddress(account)}</div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="px-6 py-3 bg-flare-primary hover:bg-red-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Balance Display */}
        {isConnected && (
          <div className="sm:hidden mt-4 p-3 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400">USDT0 Balance</div>
            <div className="text-xl font-semibold">{parseFloat(balance).toFixed(2)}</div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
