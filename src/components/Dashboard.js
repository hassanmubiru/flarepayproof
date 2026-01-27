import React, { useState, useEffect } from 'react';
import { usePayment } from '../context/PaymentContext';
import { useWallet } from '../context/WalletContext';
import proofRailsService from '../services/proofRailsService';
import { jsPDF } from 'jspdf';

const Dashboard = () => {
  const [filter, setFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [generatingProof, setGeneratingProof] = useState(false);

  const { payments, loadPaymentsFromStorage, getExplorerLink } = usePayment();
  const { account, refreshBalance } = useWallet();

  useEffect(() => {
    loadPaymentsFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPayments = payments.filter(payment => {
    // Filter by status
    if (filter !== 'all' && payment.status !== filter) return false;

    // Filter by date
    if (dateFrom && new Date(payment.createdAt) < new Date(dateFrom)) return false;
    if (dateTo && new Date(payment.createdAt) > new Date(dateTo)) return false;

    return true;
  });

  const handleGenerateProof = async (payment) => {
    if (!payment.txHash) {
      alert('No transaction hash available for this payment');
      return;
    }

    setGeneratingProof(true);
    try {
      const proof = await proofRailsService.generateProof({
        txHash: payment.txHash,
        amount: payment.amount,
        sender: payment.createdBy || account,
        recipient: payment.recipient,
        memo: payment.memo,
        timestamp: payment.confirmedAt || payment.createdAt,
        blockNumber: payment.blockNumber
      });

      // Update payment with proof ID (in production, save to Supabase)
      const updatedPayments = payments.map(p =>
        p.id === payment.id ? { ...p, proofId: proof.id, proof } : p
      );
      localStorage.setItem('flarepay_payments', JSON.stringify(updatedPayments));
      loadPaymentsFromStorage();

      alert('Proof generated successfully!');
    } catch (error) {
      console.error('Error generating proof:', error);
      alert('Failed to generate proof');
    } finally {
      setGeneratingProof(false);
    }
  };

  const handleDownloadProofJSON = (payment) => {
    if (!payment.proof) {
      alert('No proof available for this payment');
      return;
    }
    proofRailsService.downloadProofJSON(payment.proof);
  };

  const handleDownloadProofPDF = (payment) => {
    if (!payment.proof) {
      alert('No proof available for this payment');
      return;
    }

    const pdf = new jsPDF();
    
    // Title
    pdf.setFontSize(20);
    pdf.setTextColor(229, 64, 51);
    pdf.text('FlarePayProof - ISO 20022 Proof', 20, 20);
    
    // Subtitle
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Blockchain Payment Verification', 20, 30);
    
    // Horizontal line
    pdf.setLineWidth(0.5);
    pdf.line(20, 35, 190, 35);
    
    // Payment Details
    pdf.setFontSize(10);
    let y = 45;
    
    pdf.text(`Proof ID: ${payment.proof.id}`, 20, y);
    y += 10;
    pdf.text(`Transaction Hash: ${payment.txHash}`, 20, y);
    y += 10;
    pdf.text(`Amount: ${payment.amount} USDT0`, 20, y);
    y += 10;
    pdf.text(`Recipient: ${payment.recipient}`, 20, y);
    y += 10;
    pdf.text(`Memo: ${payment.memo || 'N/A'}`, 20, y);
    y += 10;
    pdf.text(`Created: ${new Date(payment.createdAt).toLocaleString()}`, 20, y);
    y += 15;
    
    // ISO 20022 Details
    pdf.setFontSize(14);
    pdf.text('ISO 20022 Information', 20, y);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.text(`Standard: ${payment.proof.standard}`, 20, y);
    y += 8;
    pdf.text(`Message Type: ${payment.proof.messageType}`, 20, y);
    y += 8;
    pdf.text(`Status: ${payment.proof.verification.status}`, 20, y);
    y += 15;
    
    // Blockchain Details
    pdf.setFontSize(14);
    pdf.text('Blockchain Verification', 20, y);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.text(`Network: Flare Mainnet`, 20, y);
    y += 8;
    pdf.text(`Block: ${payment.blockNumber || 'N/A'}`, 20, y);
    y += 8;
    pdf.text(`Explorer: ${getExplorerLink(payment.txHash)}`, 20, y);
    y += 15;
    
    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text('This document certifies the authenticity of the blockchain transaction', 20, 280);
    pdf.text(`Generated on ${new Date().toLocaleString()}`, 20, 285);
    
    pdf.save(`proof_${payment.id}.pdf`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'confirming': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'confirmed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'failed': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
        </svg>
      );
      case 'confirming': return (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      );
      case 'confirmed': return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
        </svg>
      );
      case 'failed': return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      );
      default: return null;
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200/50">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
            <p className="text-gray-500">View and manage your payments</p>
          </div>
        </div>
        <button
          onClick={() => { loadPaymentsFromStorage(); refreshBalance(); }}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2 font-medium text-gray-700"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Status</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-flare-primary bg-white font-medium text-gray-700"
          >
            <option value="all">All Transactions</option>
            <option value="pending">Pending</option>
            <option value="confirming">Confirming</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-flare-primary bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-flare-primary bg-white"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => { setFilter('all'); setDateFrom(''); setDateTo(''); }}
            className="w-full px-4 py-2.5 text-gray-500 hover:text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Transactions Yet</h3>
          <p className="text-gray-500">Create your first payment request to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment, index) => (
            <div 
              key={payment.id} 
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:border-gray-300 card-hover"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="capitalize">{payment.status}</span>
                    </span>
                    {payment.proofId && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center space-x-1.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Amount</span>
                      <div className="text-xl font-bold gradient-text">{payment.amount} USDT0</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Recipient</span>
                      <div className="font-mono text-sm text-gray-700">{payment.recipient.substring(0, 10)}...{payment.recipient.slice(-6)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Created</span>
                      <div className="text-sm text-gray-700 font-medium">{new Date(payment.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">{new Date(payment.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                  {payment.memo && (
                    <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-xs text-blue-600 font-medium">Memo:</span>
                      <span className="text-sm text-blue-800 ml-2">{payment.memo}</span>
                    </div>
                  )}
                  {payment.txHash && (
                    <div className="mt-3">
                      <a
                        href={getExplorerLink(payment.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-flare-primary hover:text-flare-secondary text-sm font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                        </svg>
                        <span>View on Explorer</span>
                      </a>
                    </div>
                  )}
                </div>
                <div className="ml-6 flex flex-col space-y-2">
                  {payment.status === 'confirmed' && !payment.proofId && (
                    <button
                      onClick={() => handleGenerateProof(payment)}
                      disabled={generatingProof}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 font-medium flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Generate Proof</span>
                    </button>
                  )}
                  {payment.proofId && (
                    <>
                      <button
                        onClick={() => handleDownloadProofJSON(payment)}
                        className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-xl transition-all duration-300 font-medium flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                        <span>JSON</span>
                      </button>
                      <button
                        onClick={() => handleDownloadProofPDF(payment)}
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-xl transition-all duration-300 font-medium flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
                        </svg>
                        <span>PDF</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
