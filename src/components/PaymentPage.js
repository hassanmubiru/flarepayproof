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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Invalid Payment Link</h2>
          <p className="text-sm text-slate-500 mb-6">This payment link is invalid or incomplete.</p>
          <a href="/" className="inline-block px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // Payment success
  if (txHash) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8 max-w-sm w-full text-center fade-in">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Payment Successful</h2>
          <p className="text-sm text-slate-500 mb-6">Your payment has been sent and is being confirmed.</p>
          
          <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-slate-500 mb-1">Transaction Hash</p>
            <p className="font-mono text-xs text-slate-700 break-all">{txHash}</p>
          </div>

          <a
            href={getExplorerLink(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 max-w-sm w-full fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Payment Request</h2>
        </div>

        {/* Amount */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4 text-center">
          <p className="text-sm text-slate-500 mb-1">Amount</p>
          <p className="text-3xl font-semibold text-slate-900">{amount} <span className="text-brand-500">USDT0</span></p>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Recipient</p>
            <p className="font-mono text-xs text-slate-700 bg-slate-50 p-2 rounded break-all">{recipient}</p>
          </div>
          {memo && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Memo</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{memo}</p>
            </div>
          )}
        </div>

        {/* Balance check */}
        {isConnected && (
          <div className={`p-3 rounded-lg mb-4 ${parseFloat(balance) >= parseFloat(amount) ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Your Balance</p>
                <p className="text-sm font-semibold text-slate-900">{parseFloat(balance).toFixed(2)} USDT0</p>
              </div>
              {parseFloat(balance) >= parseFloat(amount) ? (
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Action */}
        {isConnected ? (
          <button
            onClick={handlePay}
            disabled={loading || parseFloat(balance) < parseFloat(amount)}
            className="w-full px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Pay ${amount} USDT0`}
          </button>
        ) : (
          <button
            onClick={connectWallet}
            className="w-full px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors"
          >
            Connect Wallet to Pay
          </button>
        )}

        {/* Network badge */}
        <div className="mt-4 text-center">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5"></span>
            Testnet (Coston2)
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
