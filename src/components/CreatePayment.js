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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (USDT0) *
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flare-primary focus:border-transparent text-lg"
            required
          />
        </div>

        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address *
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flare-primary focus:border-transparent font-mono text-sm"
            required
          />
        </div>

        {/* Memo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Memo (Optional)
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Payment description..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flare-primary focus:border-transparent"
          />
        </div>

        {/* Expiry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date (Optional)
          </label>
          <input
            type="datetime-local"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flare-primary focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isConnected}
          className="w-full px-6 py-4 bg-flare-primary text-white rounded-lg hover:bg-red-600 font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnected ? 'Create Payment Request' : 'Connect Wallet First'}
        </button>
      </form>
    </div>
  );
};

export default CreatePayment;
