import React, { useState, useEffect } from 'react';
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
  const { account, balance, isConnected, connectWallet } = useWallet();

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Payment Link</h2>
          <p className="text-gray-600">This payment link is invalid or incomplete.</p>
        </div>
      </div>
    );
  }

  if (txHash) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your payment has been sent and is being confirmed.</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-2">Transaction Hash</div>
            <div className="font-mono text-xs break-all">{txHash}</div>
          </div>

          <a
            href={getExplorerLink(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-6 py-3 bg-flare-primary text-white rounded-lg hover:bg-red-600 font-semibold transition-colors"
          >
            View on Flare Explorer
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-flare-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Request</h2>
          <p className="text-gray-600 mt-2">Review and confirm the payment details</p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Amount</div>
            <div className="text-3xl font-bold text-gray-900">{amount} USDT0</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">To</div>
            <div className="font-mono text-sm break-all">{recipient}</div>
          </div>
          {memo && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Memo</div>
              <div className="text-sm">{memo}</div>
            </div>
          )}
        </div>

        {/* User Balance */}
        {isConnected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-blue-800">Your USDT0 Balance</div>
            <div className="text-2xl font-bold text-blue-900">{parseFloat(balance).toFixed(2)}</div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Action Button */}
        {isConnected ? (
          <button
            onClick={handlePay}
            disabled={loading || parseFloat(balance) < parseFloat(amount)}
            className="w-full px-6 py-4 bg-flare-primary text-white rounded-lg hover:bg-red-600 font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Pay ${amount} USDT0`}
          </button>
        ) : (
          <button
            onClick={connectWallet}
            className="w-full px-6 py-4 bg-flare-primary text-white rounded-lg hover:bg-red-600 font-semibold text-lg transition-colors"
          >
            Connect Wallet to Pay
          </button>
        )}

        {/* Network Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Payment will be executed on Flare Mainnet</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
