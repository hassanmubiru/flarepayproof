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
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 fade-in">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Payment Request Created</h3>
          <p className="text-sm text-slate-500 mt-1">Share the link or QR code with the payer</p>
        </div>

        {/* Amount Display */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-slate-500 mb-1">Amount</p>
          <p className="text-2xl font-semibold text-slate-900">{amount} <span className="text-brand-500">USDT0</span></p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <QRCodeSVG 
              value={paymentLink} 
              size={180} 
              level="H"
              fgColor="#0F172A"
              bgColor="#FFFFFF"
            />
          </div>
        </div>

        {/* Payment Link */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Payment Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={paymentLink}
              readOnly
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm font-mono text-slate-600"
            />
            <button
              onClick={() => copyToClipboard(paymentLink)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-brand-500 hover:bg-brand-600 text-white'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Create Another
          </button>
          <button
            onClick={() => window.open(paymentLink, '_blank')}
            className="flex-1 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Open Payment Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Create Payment Request</h2>
        <p className="text-sm text-slate-500 mt-1">Generate a shareable payment link</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Amount <span className="text-brand-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 pr-20 border border-slate-200 rounded-lg text-lg font-medium text-slate-900 placeholder-slate-300"
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-brand-50 text-brand-600 text-xs font-semibold rounded">
              USDT0
            </div>
          </div>
        </div>

        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Recipient Address <span className="text-brand-500">*</span>
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border border-slate-200 rounded-lg font-mono text-sm"
            required
          />
        </div>

        {/* Memo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Memo <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Payment for services..."
            className="w-full px-4 py-3 border border-slate-200 rounded-lg"
          />
        </div>

        {/* Expiry */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Expiry Date <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isConnected}
          className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
            isConnected 
              ? 'bg-brand-500 hover:bg-brand-600 text-white' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isConnected ? 'Create Payment Request' : 'Connect Wallet to Continue'}
        </button>
      </form>

      {/* Info Banner */}
      {!isConnected && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">Wallet Not Connected</p>
            <p className="text-sm text-amber-600">Connect your wallet to create payment requests.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePayment;
