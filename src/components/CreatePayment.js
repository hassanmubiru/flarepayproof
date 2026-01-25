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
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (showLink && createdPayment) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Payment Request Created!</h3>
          <p className="text-gray-600 mt-2">Share this link or QR code with the payer</p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold ml-2">{amount} USDT0</span>
            </div>
            <div>
              <span className="text-gray-600">ID:</span>
              <span className="font-mono text-xs ml-2">{createdPayment.id}</span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
            <QRCodeSVG value={paymentLink} size={200} level="H" />
          </div>
        </div>

        {/* Payment Link */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Link</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={paymentLink}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
            />
            <button
              onClick={() => copyToClipboard(paymentLink)}
              className="px-4 py-2 bg-flare-primary text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
          >
            Create Another
          </button>
          <button
            onClick={() => window.open(paymentLink, '_blank')}
            className="flex-1 px-4 py-3 bg-flare-primary text-white rounded-lg hover:bg-red-600 font-semibold transition-colors"
          >
            Open Payment Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Payment Request</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
