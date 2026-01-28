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
        <div className="min-h-screen bg-dark-950 bg-mesh flex flex-col">
          <Header />
          
          <Routes>
            <Route path="/pay" element={<PaymentPage />} />
            
            <Route path="/" element={
              <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
                {/* Hero Section */}
                <div className="mb-10 text-center sm:text-left">
                  <h2 className="text-3xl font-bold text-white mb-2">Payment Portal</h2>
                  <p className="text-gray-400">Create and manage USDT0 payments with ISO 20022 compliance</p>
                </div>
                
                {/* Tabs */}
                <div className="mb-8">
                  <nav className="inline-flex gap-1 p-1.5 glass-card rounded-2xl">
                    <button
                      onClick={() => setActiveTab('create')}
                      className={`relative px-6 py-3 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                        activeTab === 'create'
                          ? 'btn-primary text-white'
                          : 'text-gray-400 hover:text-white hover:bg-dark-600'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Payment
                    </button>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`relative px-6 py-3 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                        activeTab === 'dashboard'
                          ? 'btn-primary text-white'
                          : 'text-gray-400 hover:text-white hover:bg-dark-600'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
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
          <footer className="mt-auto border-t border-white/5 bg-dark-900/80 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto px-6 py-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Brand */}
                <div className="md:col-span-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-500 via-brand-400 to-brand-300 rounded-xl flex items-center justify-center shadow-glow-brand">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-white">FlarePayProof</p>
                      <p className="text-xs text-gray-500">Enterprise Payments</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">Secure USDT0 payments with ISO 20022 compliance, powered by Flare's ProofRails technology.</p>
                </div>
                
                {/* Links */}
                <div className="md:col-span-1">
                  <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
                  <div className="space-y-3">
                    <a href="https://docs.flare.network" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-brand-400 transition-colors group">
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Documentation
                    </a>
                    <a href="https://github.com/hassanmubiru/flarepayproof" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-brand-400 transition-colors group">
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      GitHub
                    </a>
                    <a href="https://flare.network" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-brand-400 transition-colors group">
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                      Flare Network
                    </a>
                  </div>
                </div>
                
                {/* Tech Stack */}
                <div className="md:col-span-1">
                  <h4 className="text-sm font-semibold text-white mb-4">Technology</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-dark-700 rounded-lg text-xs text-gray-300 border border-dark-500">ISO 20022</span>
                    <span className="px-3 py-1.5 bg-dark-700 rounded-lg text-xs text-gray-300 border border-dark-500">ProofRails</span>
                    <span className="px-3 py-1.5 bg-dark-700 rounded-lg text-xs text-gray-300 border border-dark-500">USDT0</span>
                    <span className="px-3 py-1.5 bg-dark-700 rounded-lg text-xs text-gray-300 border border-dark-500">Flare</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-500">
                  © 2026 FlarePayProof. Built for the Flare ProofRails Hackathon.
                </p>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-accent-amber/20 to-accent-amber/10 text-accent-amber border border-accent-amber/30">
                    <span className="w-1.5 h-1.5 bg-accent-amber rounded-full mr-2 animate-pulse"></span>
                    Coston2 Testnet
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </PaymentProvider>
    </WalletProvider>
  );
}

export default App;
