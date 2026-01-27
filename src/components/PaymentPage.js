import React, { useState } from 'react';
import { usePayment } from '../context/PaymentContext';
import { useWallet } from '../context/WalletContext';
import { useSearchParams } from 'react-router-dom';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const paymentId = searchParams.get('id');
  const amount = searchParams.get('amount');
  const recipient = searchParams.get('recipient');
  const memo = searchParams.get('memo');

  const { executeTransfer, getExplorerLink } = usePayment();
  const { balance, isConnected, connectWallet } = useWallet();

  const handlePay = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (parseFloat(balance) < parseFloat(amount)) {
      setError('Insufficient USDT0 balance');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await executeTransfer(paymentId, recipient, amount);
      setTxHash(result.txHash);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!paymentId || !amount || !recipient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-gray-200/50 scale-in">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Invalid Payment Link</h2>
          <p className="text-gray-500 text-lg">This payment link is invalid or incomplete.</p>
          <a href="/" className="mt-8 inline-block px-6 py-3 bg-gradient-to-r from-flare-primary to-flare-secondary text-white rounded-xl font-semibold hover:shadow-glow transition-all duration-300">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  if (txHash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-gray-200/50 scale-in">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg animate-float">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 text-lg mb-8">Your payment has been sent and is being confirmed.</p>
          
          <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold">Transaction Hash</div>
            <div className="font-mono text-sm break-all text-gray-700 bg-white p-3 rounded-xl border border-gray-200">{txHash}</div>
          </div>

          <a
            href={getExplorerLink(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-6 py-4 bg-gradient-to-r from-flare-primary to-flare-secondary text-white rounded-xl hover:shadow-glow-lg font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
            </svg>
            <span>View on Flare Explorer</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-flare-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-flare-secondary/10 rounded-full blur-3xl"></div>
      </div>
      <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-10 max-w-md w-full border border-gray-200/50 fade-in-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-flare-primary to-flare-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Payment Request</h2>
          <p className="text-gray-500 mt-2 text-lg">Review and confirm the payment details</p>
        </div>

        {/* Payment Details */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 space-y-5 border border-gray-200">
          <div className="text-center pb-4 border-b border-gray-200">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Amount</div>
            <div className="text-5xl font-bold gradient-text">{amount}</div>
            <div className="text-lg font-semibold text-gray-600 mt-1">USDT0</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Recipient</div>
            <div className="font-mono text-sm break-all bg-white p-3 rounded-xl border border-gray-200">{recipient}</div>
          </div>
          {memo && (
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Memo</div>
              <div className="text-sm text-gray-700 bg-white p-3 rounded-xl border border-gray-200">{memo}</div>
            </div>
          )}
        </div>

        {/* User Balance */}
        {isConnected && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-600 uppercase tracking-wide font-semibold">Your Balance</div>
                <div className="text-2xl font-bold text-blue-900">{parseFloat(balance).toFixed(2)} USDT0</div>
              </div>
              {parseFloat(balance) >= parseFloat(amount) ? (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              ) : (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <div className="text-sm text-red-700 font-medium">{error}</div>
          </div>
        )}

        {/* Action Button */}
        {isConnected ? (
          <button
            onClick={handlePay}
            disabled={loading || parseFloat(balance) < parseFloat(amount)}
            className="w-full px-6 py-5 bg-gradient-to-r from-flare-primary to-flare-secondary text-white rounded-xl hover:shadow-glow-lg font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center space-x-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"/>
                </svg>
                <span>Pay {amount} USDT0</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={connectWallet}
            className="w-full px-6 py-5 bg-gradient-to-r from-flare-primary to-flare-secondary text-white rounded-xl hover:shadow-glow-lg font-bold text-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5z"/>
            </svg>
            <span>Connect Wallet to Pay</span>
          </button>
        )}

        {/* Network Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm text-yellow-700 font-medium">Testnet Mode (Coston2)</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Using test tokens - No real value</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
