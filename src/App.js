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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
          {/* Background decoration */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-flare-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -left-40 w-80 h-80 bg-flare-secondary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>
          
          <Header />
          
          <Routes>
            {/* Payment Page (for payment links) */}
            <Route path="/pay" element={<PaymentPage />} />
            
            {/* Main Dashboard */}
            <Route path="/" element={
              <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Tabs */}
                <div className="mb-8 fade-in-up">
                  <div className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-1.5 inline-flex shadow-sm">
                    <button
                      onClick={() => setActiveTab('create')}
                      className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        activeTab === 'create'
                          ? 'bg-gradient-to-r from-flare-primary to-flare-secondary text-white shadow-glow'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                        </svg>
                        <span>Create Payment</span>
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        activeTab === 'dashboard'
                          ? 'bg-gradient-to-r from-flare-primary to-flare-secondary text-white shadow-glow'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                        </svg>
                        <span>Transaction History</span>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="max-w-4xl mx-auto">
                  {activeTab === 'create' && (
                    <div className="fade-in-up">
                      <CreatePayment onPaymentCreated={() => setActiveTab('dashboard')} />
                    </div>
                  )}
                  {activeTab === 'dashboard' && (
                    <div className="fade-in-up">
                      <Dashboard />
                    </div>
                  )}
                </div>

                {/* Footer */}
                <footer className="mt-20 text-center">
                  <div className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-flare-primary to-flare-secondary rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <span className="text-lg font-bold text-gray-800">FlarePayProof</span>
                    </div>
                    <p className="text-gray-600 font-medium">Powered by Flare Network × ProofRails</p>
                    <p className="text-sm text-gray-500 mt-1">ISO 20022-compliant blockchain payment verification</p>
                    <div className="mt-6 flex items-center justify-center space-x-6">
                      <a
                        href="https://flare.network"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-flare-primary transition-colors font-medium flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"/>
                        </svg>
                        <span>Flare Network</span>
                      </a>
                      <span className="text-gray-300">•</span>
                      <a
                        href="https://coston2-explorer.flare.network"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-flare-primary transition-colors font-medium flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>Block Explorer</span>
                      </a>
                      <span className="text-gray-300">•</span>
                      <a
                        href="https://github.com/hassanmubiru/flarepayproof"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-flare-primary transition-colors font-medium flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/>
                        </svg>
                        <span>GitHub</span>
                      </a>
                    </div>
                    <p className="text-xs text-gray-400 mt-6">© 2026 FlarePayProof. Built for Flare ProofRails Hackathon.</p>
                  </div>
                </footer>
              </main>
            } />
          </Routes>
        </div>
      </PaymentProvider>
    </WalletProvider>
  );
}

export default App;
