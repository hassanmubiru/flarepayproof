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

  // Success screen for direct send
  if (txResult && createdPayment) {
    return (
      <div className="glass-card gradient-border rounded-xl sm:rounded-2xl p-4 sm:p-8 fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-accent-green/20 rounded-full blur-xl"></div>
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent-green to-accent-green/80 rounded-full flex items-center justify-center shadow-glow-green">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-3 sm:mt-4">Payment Sent!</h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Your transaction has been confirmed on-chain</p>
        </div>

        <div className="bg-dark-700/50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-center border border-white/5">
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Amount Sent</p>
          <p className="text-2xl sm:text-4xl font-bold text-white">{createdPayment.amount} <span className="text-brand-400">USDT0</span></p>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <div>
            <p className="text-xs text-gray-400 mb-1.5 sm:mb-2 font-semibold uppercase tracking-wider">Recipient</p>
            <p className="font-mono text-xs text-gray-300 bg-dark-700/50 p-2 sm:p-3 rounded-lg sm:rounded-xl break-all border border-white/10">{createdPayment.recipient}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5 sm:mb-2 font-semibold uppercase tracking-wider">Transaction Hash</p>
            <p className="font-mono text-xs text-accent-green bg-dark-700/50 p-2 sm:p-3 rounded-lg sm:rounded-xl break-all border border-white/10">{txResult.txHash}</p>
          </div>
          {txResult.onChainProofId && (
            <div className="bg-accent-purple/10 border border-accent-purple/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-xs text-accent-purple font-semibold mb-1">✓ ISO 20022 On-Chain Proof Created</p>
              <p className="font-mono text-xs text-gray-300">Proof ID: {txResult.onChainProofId.toString().slice(0, 16)}...</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2.5 sm:py-3 bg-dark-600 hover:bg-dark-500 text-gray-300 border border-white/10 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span className="sm:hidden">New</span>
            <span className="hidden sm:inline">Send Another</span>
          </button>
          <a
            href={getExplorerLink(txResult.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2.5 sm:py-3 btn-primary text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <span className="sm:hidden">Explorer</span>
            <span className="hidden sm:inline">View on Explorer</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      </div>
    );
  }

  if (showLink && createdPayment) {
    return (
      <div className="glass-card gradient-border rounded-xl sm:rounded-2xl p-4 sm:p-8 fade-in">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-accent-green/20 rounded-full blur-xl"></div>
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent-green to-accent-green/80 rounded-full flex items-center justify-center shadow-glow-green">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-3 sm:mt-4">Payment Request Created</h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Share the link or QR code with the payer</p>
        </div>

        {/* Amount Display */}
        <div className="bg-dark-700/50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-center border border-white/5">
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Amount Due</p>
          <p className="text-2xl sm:text-4xl font-bold text-white">{amount} <span className="text-brand-400">USDT0</span></p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="p-3 sm:p-5 bg-white rounded-xl sm:rounded-2xl shadow-card">
            <QRCodeSVG 
              value={paymentLink} 
              size={160} 
              level="H"
              fgColor="#050508"
              bgColor="#FFFFFF"
              className="w-32 h-32 sm:w-[200px] sm:h-[200px]"
            />
          </div>
        </div>

        {/* Payment Link */}
        <div className="mb-6 sm:mb-8">
          <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">Payment Link</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={paymentLink}
              readOnly
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-white/10 rounded-lg sm:rounded-xl bg-dark-700/50 text-xs sm:text-sm font-mono text-gray-300"
            />
            <button
              onClick={() => copyToClipboard(paymentLink)}
              className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
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
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2.5 sm:py-3 bg-dark-600 hover:bg-dark-500 text-gray-300 border border-white/10 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span className="sm:hidden">New</span>
            <span className="hidden sm:inline">Create Another</span>
          </button>
          <button
            onClick={() => window.open(paymentLink, '_blank')}
            className="flex-1 px-4 py-2.5 sm:py-3 btn-primary text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <span className="sm:hidden">Open Page</span>
            <span className="hidden sm:inline">Open Payment Page</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card gradient-border rounded-xl sm:rounded-2xl p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-500 to-brand-400 rounded-lg sm:rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Create Payment</h2>
            <p className="text-xs sm:text-sm text-gray-400">Generate a shareable payment link</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Amount */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">
            Amount <span className="text-brand-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 border border-white/10 rounded-lg sm:rounded-xl bg-dark-700/50 text-lg sm:text-xl font-semibold text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none input-glow transition-all"
              required
            />
            <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 px-2 sm:px-3 py-1 sm:py-1.5 bg-brand-500/20 text-brand-400 text-xs sm:text-sm font-bold rounded-lg">
              USDT0
            </div>
          </div>
        </div>

        {/* Recipient Address */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">
            Recipient Address <span className="text-brand-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-white/10 rounded-lg sm:rounded-xl bg-dark-700/50 font-mono text-xs sm:text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none input-glow transition-all"
              required
            />
          </div>
        </div>

        {/* Memo */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">
            Memo <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Payment for services..."
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-white/10 rounded-lg sm:rounded-xl bg-dark-700/50 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none input-glow transition-all"
            />
          </div>
        </div>

        {/* Expiry */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">
            Expiry Date <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="datetime-local"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-white/10 rounded-lg sm:rounded-xl bg-dark-700/50 text-sm text-white focus:border-brand-500 focus:outline-none input-glow transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 sm:space-y-3">
          {/* Send Now Button - Primary action */}
          <button
            type="button"
            onClick={handleSendNow}
            disabled={!isConnected || isSending}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 ${
              isConnected && !isSending
                ? 'bg-gradient-to-r from-accent-green to-accent-green/80 hover:from-accent-green/90 hover:to-accent-green/70 text-white shadow-glow-green' 
                : 'bg-dark-600 text-gray-500 cursor-not-allowed border border-white/10'
            }`}
          >
            {isSending ? (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Now
              </>
            )}
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Create Payment Link Button - Secondary action */}
          <button
            type="submit"
            disabled={!isConnected || isSending}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 ${
              isConnected && !isSending
                ? 'btn-primary text-white' 
                : 'bg-dark-600 text-gray-500 cursor-not-allowed border border-white/10'
            }`}
          >
            {isConnected ? (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="sm:hidden">Generate Link</span>
                <span className="hidden sm:inline">Generate Payment Link</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="sm:hidden">Connect Wallet</span>
                <span className="hidden sm:inline">Connect Wallet to Continue</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Banner */}
      {!isConnected && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-accent-amber/10 border border-accent-amber/20 rounded-lg sm:rounded-xl flex items-start gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent-amber/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-amber" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-accent-amber text-sm">Wallet Not Connected</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Connect your wallet to create payment requests.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePayment;
