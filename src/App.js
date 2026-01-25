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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <Header />
          
          <Routes>
            {/* Payment Page (for payment links) */}
            <Route path="/pay" element={<PaymentPage />} />
            
            {/* Main Dashboard */}
            <Route path="/" element={
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Tabs */}
                <div className="mb-8">
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8">
                      <button
                        onClick={() => setActiveTab('create')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === 'create'
                            ? 'border-flare-primary text-flare-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Create Payment
                      </button>
                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === 'dashboard'
                            ? 'border-flare-primary text-flare-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Transaction History
                      </button>
                    </nav>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="max-w-4xl mx-auto">
                  {activeTab === 'create' && (
                    <CreatePayment onPaymentCreated={() => setActiveTab('dashboard')} />
                  )}
                  {activeTab === 'dashboard' && <Dashboard />}
                </div>

                {/* Footer */}
                <footer className="mt-16 text-center text-sm text-gray-500">
                  <p>Powered by Flare Network × ProofRails</p>
                  <p className="mt-2">ISO 20022-compliant blockchain payment verification</p>
                  <div className="mt-4 flex items-center justify-center space-x-4">
                    <a
                      href="https://flare.network"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-flare-primary transition-colors"
                    >
                      Flare Network
                    </a>
                    <span>•</span>
                    <a
                      href="https://flare-explorer.flare.network"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-flare-primary transition-colors"
                    >
                      Block Explorer
                    </a>
                    <span>•</span>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-flare-primary transition-colors"
                    >
                      GitHub
                    </a>
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
