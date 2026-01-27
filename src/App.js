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
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Header />
          
          <Routes>
            <Route path="/pay" element={<PaymentPage />} />
            
            <Route path="/" element={
              <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
                {/* Tabs */}
                <div className="mb-6">
                  <nav className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
                    <button
                      onClick={() => setActiveTab('create')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'create'
                          ? 'bg-white text-slate-900 shadow-soft'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Create Payment
                    </button>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'dashboard'
                          ? 'bg-white text-slate-900 shadow-soft'
                          : 'text-slate-600 hover:text-slate-900'
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
          <footer className="mt-auto border-t border-slate-200 bg-white">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">FlarePayProof</p>
                    <p className="text-xs text-slate-500">ISO 20022 compliant payments on Flare</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <a 
                    href="https://docs.flare.network" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Docs
                  </a>
                  <a 
                    href="https://github.com/hassanmubiru/flarepayproof" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    GitHub
                  </a>
                  <a 
                    href="https://flare.network" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Flare Network
                  </a>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  © 2026 FlarePayProof. Built for the Flare ProofRails Hackathon.
                </p>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5"></span>
                  Coston2 Testnet
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
