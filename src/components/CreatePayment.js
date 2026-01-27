import React, { useState } from 'react';
import { usePayment } from '../context/PaymentContext';
import { useWallet } from '../context/WalletContext';
import { QRCodeSVG } from 'qrcode.react';

const CreatePayment = ({ onPaymentCreated }) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [memo, setMemo] = useState('');
  const [expiry, setExpiry] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [createdPayment, setCreatedPayment] = useState(null);
  const [copied, setCopied] = useState(false);

  const { createPaymentRequest, generatePaymentLink } = usePayment();
  const { isConnected } = useWallet();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
      alert('Please enter a valid recipient address');
      return;
    }

    try {
      const payment = await createPaymentRequest(
        amount,
        recipient,
        memo,
        expiry ? new Date(expiry).toISOString() : null
      );

      const link = generatePaymentLink(payment);
      setPaymentLink(link);
      setCreatedPayment(payment);
      setShowLink(true);

      if (onPaymentCreated) {
        onPaymentCreated(payment);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to create payment request');
    }
  };

  const handleReset = () => {
    setAmount('');
    setRecipient('');
    setMemo('');
    setExpiry('');
    setShowLink(false);
    setPaymentLink('');
    setCreatedPayment(null);
    setCopied(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (showLink && createdPayment) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200/50 scale-in">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">Payment Request Created!</h3>
          <p className="text-gray-500 mt-2 text-lg">Share this link or QR code with the payer</p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">Amount</span>
              <div className="text-4xl font-bold gradient-text">{amount} USDT0</div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">Payment ID</span>
              <div className="font-mono text-sm text-gray-600 bg-white px-3 py-1 rounded-lg border border-gray-200 mt-1">{createdPayment.id.substring(0, 8)}...</div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-8">
          <div className="p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-lg card-hover">
            <QRCodeSVG 
              value={paymentLink} 
              size={220} 
              level="H"
              fgColor="#0F0F14"
              bgColor="#FFFFFF"
              includeMargin={true}
            />
          </div>
        </div>

        {/* Payment Link */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Payment Link</label>
          <div className="flex space-x-3">
            <input
              type="text"
              value={paymentLink}
              readOnly
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm font-mono text-gray-600 focus:ring-0"
            />
            <button
              onClick={() => copyToClipboard(paymentLink)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gradient-to-r from-flare-primary to-flare-secondary text-white hover:shadow-glow hover:scale-105'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={handleReset}
            className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
            <span>Create Another</span>
          </button>
          <button
            onClick={() => window.open(paymentLink, '_blank')}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-flare-primary to-flare-secondary text-white rounded-xl hover:shadow-glow-lg font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
            </svg>
            <span>Open Payment Page</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200/50">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-flare-primary to-flare-secondary rounded-2xl flex items-center justify-center shadow-glow">
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Payment Request</h2>
          <p className="text-gray-500">Generate a shareable payment link</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Amount (USDT0) <span className="text-flare-primary">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-flare-primary text-2xl font-bold text-gray-900 placeholder-gray-300 transition-all duration-200"
              required
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-flare-primary to-flare-secondary text-white text-sm font-bold rounded-lg">
              USDT0
            </div>
          </div>
        </div>

        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Recipient Address <span className="text-flare-primary">*</span>
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-flare-primary font-mono text-sm transition-all duration-200"
            required
          />
        </div>

        {/* Memo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Memo <span className="text-gray-400 text-xs normal-case font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Payment for services..."
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-flare-primary transition-all duration-200"
          />
        </div>

        {/* Expiry */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Expiry Date <span className="text-gray-400 text-xs normal-case font-normal">(Optional)</span>
          </label>
          <input
            type="datetime-local"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-flare-primary transition-all duration-200"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isConnected}
          className={`w-full px-6 py-5 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
            isConnected 
              ? 'bg-gradient-to-r from-flare-primary to-flare-secondary text-white hover:shadow-glow-lg hover:scale-[1.02]' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isConnected ? (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              <span>Create Payment Request</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <span>Connect Wallet First</span>
            </>
          )}
        </button>
      </form>

      {/* Info Banner */}
      {!isConnected && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">Wallet Not Connected</p>
            <p className="text-sm text-amber-600 mt-1">Please connect your wallet to create payment requests.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePayment;
