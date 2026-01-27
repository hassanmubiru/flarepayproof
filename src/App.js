import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { PaymentProvider } from './context/PaymentContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CreatePayment from './components/CreatePayment';
import PaymentPage from './components/PaymentPage';

function App() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <WalletProvider>
      <PaymentProvider>
        <div className="min-h-screen bg-dark-900 flex flex-col">
          <Header />
          
          <Routes>
            <Route path="/pay" element={<PaymentPage />} />
            
            <Route path="/" element={
              <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
                {/* Tabs */}
                <div className="mb-8">
                  <nav className="flex gap-1 p-1.5 bg-dark-800 border border-dark-600 rounded-xl w-fit">
                    <button
                      onClick={() => setActiveTab('create')}
                      className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        activeTab === 'create'
                          ? 'bg-brand-500 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-dark-600'
                      }`}
                    >
                      Create Payment
                    </button>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        activeTab === 'dashboard'
                          ? 'bg-brand-500 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-dark-600'
                      }`}
                    >
                      Transactions
                    </button>
                  </nav>
                </div>

                {/* Content */}
                <div className="fade-in">
                  {activeTab === 'create' && (
                    <CreatePayment onPaymentCreated={() => setActiveTab('dashboard')} />
                  )}
                  {activeTab === 'dashboard' && <Dashboard />}
                </div>
              </main>
            } />
          </Routes>

          {/* Footer */}
          <footer className="mt-auto border-t border-dark-700 bg-dark-800">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-400 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">FlarePayProof</p>
                    <p className="text-xs text-gray-500">ISO 20022 • ProofRails • Flare</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <a 
                    href="https://docs.flare.network" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Docs
                  </a>
                  <a 
                    href="https://github.com/hassanmubiru/flarepayproof" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                  <a 
                    href="https://flare.network" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Flare
                  </a>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-dark-600 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-xs text-gray-500">
                  © 2026 FlarePayProof. Built for the Flare ProofRails Hackathon.
                </p>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
                  <span className="w-1.5 h-1.5 bg-accent-amber rounded-full mr-2 animate-pulse"></span>
                  Testnet
                </span>
              </div>
            </div>
          </footer>
        </div>
      </PaymentProvider>
    </WalletProvider>
  );
}

export default App;
