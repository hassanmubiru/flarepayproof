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
                <footer className="mt-20">
                  <div className="bg-gradient-to-br from-flare-dark to-flare-darker rounded-3xl p-10 shadow-2xl border border-white/5 overflow-hidden relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-flare-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-flare-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative z-10">
                      {/* Top Section */}
                      <div className="flex flex-col md:flex-row items-center justify-between mb-10 pb-8 border-b border-white/10">
                        {/* Logo */}
                        <div className="flex items-center space-x-4 mb-6 md:mb-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-flare-primary to-flare-secondary rounded-2xl flex items-center justify-center shadow-glow">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">Flare<span className="gradient-text">PayProof</span></h3>
                            <p className="text-gray-400 text-sm">USDT0 Payments with ProofRails</p>
                          </div>
                        </div>
                        
                        {/* Tech Badges */}
                        <div className="flex flex-wrap justify-center gap-3">
                          <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 font-medium flex items-center space-x-2">
                            <svg className="w-4 h-4 text-flare-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <span>ISO 20022</span>
                          </span>
                          <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 font-medium flex items-center space-x-2">
                            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <span>ProofRails</span>
                          </span>
                          <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 font-medium flex items-center space-x-2">
                            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"/>
                            </svg>
                            <span>Flare Blockchain</span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Links Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                        <div>
                          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
                          <ul className="space-y-3">
                            <li><button onClick={() => setActiveTab('create')} className="text-gray-400 hover:text-white transition-colors text-sm text-left">Create Payment</button></li>
                            <li><button onClick={() => setActiveTab('dashboard')} className="text-gray-400 hover:text-white transition-colors text-sm text-left">Transaction History</button></li>
                            <li><button onClick={() => setActiveTab('dashboard')} className="text-gray-400 hover:text-white transition-colors text-sm text-left">Generate Proofs</button></li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
                          <ul className="space-y-3">
                            <li><a href="https://docs.flare.network" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">Documentation</a></li>
                            <li><a href="https://coston2-explorer.flare.network" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">Block Explorer</a></li>
                            <li><a href="https://faucet.flare.network/coston2" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">Coston2 Faucet</a></li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Community</h4>
                          <ul className="space-y-3">
                            <li><a href="https://github.com/hassanmubiru/flarepayproof" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center space-x-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/></svg>
                              <span>GitHub</span>
                            </a></li>
                            <li><a href="https://twitter.com/FlareNetworks" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center space-x-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                              <span>Twitter</span>
                            </a></li>
                            <li><a href="https://discord.gg/flare" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center space-x-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                              <span>Discord</span>
                            </a></li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Flare Ecosystem</h4>
                          <ul className="space-y-3">
                            <li><a href="https://flare.network" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">Flare Network</a></li>
                            <li><a href="https://portal.flare.network" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">Flare Portal</a></li>
                            <li><a href="https://flare.network/proofrails/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">ProofRails</a></li>
                          </ul>
                        </div>
                      </div>
                      
                      {/* Bottom Section */}
                      <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between">
                        <p className="text-gray-500 text-sm mb-4 md:mb-0">
                          © 2026 FlarePayProof. Built with ❤️ for the Flare ProofRails Hackathon.
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className="inline-flex items-center px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-400 font-medium">
                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
                            Testnet Mode
                          </span>
                          <a href="https://flare.network" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                            <span className="text-sm">Powered by</span>
                            <span className="font-bold text-flare-primary">Flare</span>
                          </a>
                        </div>
                      </div>
                    </div>
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
