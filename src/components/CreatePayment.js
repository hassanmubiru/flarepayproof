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
  const [isSending, setIsSending] = useState(false);
  const [txResult, setTxResult] = useState(null);

  const { createPaymentRequest, generatePaymentLink, executeTransfer, getExplorerLink } = usePayment();
  const { isConnected, balance } = useWallet();

  // Direct send - creates and executes payment immediately
  const handleSendNow = async (e) => {
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

    if (parseFloat(balance) < parseFloat(amount)) {
      alert('Insufficient USDT0 balance');
      return;
    }

    setIsSending(true);
    try {
      // Create payment record
      const payment = await createPaymentRequest(
        amount,
        recipient,
        memo,
        null
      );

      // Execute transfer immediately
      const result = await executeTransfer(payment.id, recipient, amount);
      setTxResult(result);
      setCreatedPayment(payment);

      if (onPaymentCreated) {
        onPaymentCreated(payment);
      }
    } catch (error) {
      console.error('Error sending payment:', error);
      alert('Failed to send payment: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

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
    setIsSending(false);
    setTxResult(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (showLink && createdPayment) {
    return (
      <div className="glass-card gradient-border rounded-2xl p-8 fade-in">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-accent-green/20 rounded-full blur-xl"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-accent-green to-accent-green/80 rounded-full flex items-center justify-center shadow-glow-green">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mt-4">Payment Request Created</h3>
          <p className="text-gray-400 mt-1">Share the link or QR code with the payer</p>
        </div>

        {/* Amount Display */}
        <div className="bg-dark-700/50 rounded-xl p-6 mb-6 text-center border border-white/5">
          <p className="text-sm text-gray-400 mb-1 uppercase tracking-wider">Amount Due</p>
          <p className="text-4xl font-bold text-white">{amount} <span className="text-brand-400">USDT0</span></p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-8">
          <div className="p-5 bg-white rounded-2xl shadow-card">
            <QRCodeSVG 
              value={paymentLink} 
              size={200} 
              level="H"
              fgColor="#050508"
              bgColor="#FFFFFF"
            />
          </div>
        </div>

        {/* Payment Link */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-2">Payment Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={paymentLink}
              readOnly
              className="flex-1 px-4 py-3 border border-white/10 rounded-xl bg-dark-700/50 text-sm font-mono text-gray-300"
            />
            <button
              onClick={() => copyToClipboard(paymentLink)}
              className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                copied 
                  ? 'bg-accent-green text-white shadow-glow-green' 
                  : 'btn-primary text-white'
              }`}
            >
              {copied ? (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-3 bg-dark-600 hover:bg-dark-500 text-gray-300 border border-white/10 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create Another
          </button>
          <button
            onClick={() => window.open(paymentLink, '_blank')}
            className="flex-1 px-4 py-3 btn-primary text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            Open Payment Page
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card gradient-border rounded-2xl p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-400 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create Payment Request</h2>
            <p className="text-sm text-gray-400">Generate a shareable payment link</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Amount <span className="text-brand-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-12 pr-24 py-4 border border-white/10 rounded-xl bg-dark-700/50 text-xl font-semibold text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none input-glow transition-all"
              required
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-brand-500/20 text-brand-400 text-sm font-bold rounded-lg">
              USDT0
            </div>
          </div>
        </div>

        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Recipient Address <span className="text-brand-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full pl-12 pr-4 py-4 border border-white/10 rounded-xl bg-dark-700/50 font-mono text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none input-glow transition-all"
              required
            />
          </div>
        </div>

        {/* Memo */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Memo <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Payment for services..."
              className="w-full pl-12 pr-4 py-4 border border-white/10 rounded-xl bg-dark-700/50 text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none input-glow transition-all"
            />
          </div>
        </div>

        {/* Expiry */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Expiry Date <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="datetime-local"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-white/10 rounded-xl bg-dark-700/50 text-white focus:border-brand-500 focus:outline-none input-glow transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isConnected}
          className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
            isConnected 
              ? 'btn-primary text-white' 
              : 'bg-dark-600 text-gray-500 cursor-not-allowed border border-white/10'
          }`}
        >
          {isConnected ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Create Payment Request
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Connect Wallet to Continue
            </>
          )}
        </button>
      </form>

      {/* Info Banner */}
      {!isConnected && (
        <div className="mt-6 p-4 bg-accent-amber/10 border border-accent-amber/20 rounded-xl flex items-start gap-4">
          <div className="w-10 h-10 bg-accent-amber/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-accent-amber" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-accent-amber">Wallet Not Connected</p>
            <p className="text-sm text-gray-400 mt-0.5">Connect your wallet to create payment requests and start accepting USDT0 payments.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePayment;
