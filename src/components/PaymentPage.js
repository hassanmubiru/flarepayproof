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

  // Invalid payment link
  if (!paymentId || !amount || !recipient) {
    return (
      <div className="min-h-screen bg-dark-950 bg-mesh flex items-center justify-center p-6">
        <div className="glass-card gradient-border rounded-2xl p-10 max-w-sm w-full text-center">
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Invalid Payment Link</h2>
          <p className="text-gray-400 mb-8">This payment link is invalid or incomplete.</p>
          <a href="/" className="btn-primary inline-block px-6 py-3 text-white rounded-xl font-semibold transition-all">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // Payment success
  if (txHash) {
    return (
      <div className="min-h-screen bg-dark-950 bg-mesh flex items-center justify-center p-6">
        <div className="glass-card gradient-border rounded-2xl p-10 max-w-sm w-full text-center fade-in">
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-accent-green/30 rounded-full blur-xl"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-accent-green to-accent-green/80 rounded-full flex items-center justify-center shadow-glow-green">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-400 mb-8">Your payment has been sent and is being confirmed on the blockchain.</p>
          
          <div className="bg-dark-700/50 rounded-xl p-5 mb-8 text-left border border-white/10">
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Transaction Hash</p>
            <p className="font-mono text-xs text-accent-green break-all">{txHash}</p>
          </div>

          <a
            href={getExplorerLink(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition-all"
          >
            View on Explorer
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
            </svg>
          </a>
        </div>
      </div>
    );
  }

  // Payment form
  return (
    <div className="min-h-screen bg-dark-950 bg-mesh flex items-center justify-center p-6">
      <div className="glass-card gradient-border rounded-2xl p-8 max-w-md w-full fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-4">
            <div className="absolute inset-0 bg-brand-500/30 rounded-xl blur-lg"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-brand-500 via-brand-400 to-brand-300 rounded-xl flex items-center justify-center shadow-glow-brand">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Payment Request</h2>
          <p className="text-gray-400 mt-1">Complete your USDT0 payment</p>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-br from-dark-700/80 to-dark-600/50 rounded-xl p-6 mb-6 text-center border border-white/10">
          <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Amount Due</p>
          <p className="text-4xl font-bold text-white">{amount} <span className="text-brand-400">USDT0</span></p>
        </div>

        {/* Details */}
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              Recipient
            </p>
            <p className="font-mono text-xs text-gray-300 bg-dark-700/50 p-3 rounded-xl break-all border border-white/10">{recipient}</p>
          </div>
          {memo && (
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                Memo
              </p>
              <p className="text-sm text-gray-300 bg-dark-700/50 p-3 rounded-xl border border-white/10 italic">"{memo}"</p>
            </div>
          )}
        </div>

        {/* Balance check */}
        {isConnected && (
          <div className={`p-4 rounded-xl mb-6 ${parseFloat(balance) >= parseFloat(amount) ? 'bg-accent-green/10 border border-accent-green/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${parseFloat(balance) >= parseFloat(amount) ? 'bg-accent-green/20' : 'bg-red-500/20'}`}>
                  <svg className={`w-5 h-5 ${parseFloat(balance) >= parseFloat(amount) ? 'text-accent-green' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Your Balance</p>
                  <p className="text-lg font-bold text-white">{parseFloat(balance).toFixed(2)} USDT0</p>
                </div>
              </div>
              {parseFloat(balance) >= parseFloat(amount) ? (
                <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Action */}
        {isConnected ? (
          <button
            onClick={handlePay}
            disabled={loading || parseFloat(balance) < parseFloat(amount)}
            className="w-full px-6 py-4 btn-primary text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Pay {amount} USDT0
              </>
            )}
          </button>
        ) : (
          <button
            onClick={connectWallet}
            className="w-full px-6 py-4 btn-primary text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Connect Wallet to Pay
          </button>
        )}

        {/* Network badge */}
        <div className="mt-6 text-center">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-accent-amber/20 to-accent-amber/10 text-accent-amber border border-accent-amber/30">
            <span className="w-1.5 h-1.5 bg-accent-amber rounded-full mr-2 animate-pulse"></span>
            Coston2 Testnet
          </span>
        </div>
        
        {/* Security note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secured by Flare Network
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
