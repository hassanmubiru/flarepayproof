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
    if (filter !== 'all' && payment.status !== filter) return false;
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
    pdf.setFontSize(18);
    pdf.setTextColor(229, 64, 51);
    pdf.text('FlarePayProof - ISO 20022 Proof', 20, 20);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Blockchain Payment Verification', 20, 28);
    
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(230, 230, 230);
    pdf.line(20, 32, 190, 32);
    
    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    let y = 42;
    
    pdf.text(`Proof ID: ${payment.proof.id}`, 20, y); y += 8;
    pdf.text(`Transaction Hash: ${payment.txHash}`, 20, y); y += 8;
    pdf.text(`Amount: ${payment.amount} USDT0`, 20, y); y += 8;
    pdf.text(`Recipient: ${payment.recipient}`, 20, y); y += 8;
    pdf.text(`Memo: ${payment.memo || 'N/A'}`, 20, y); y += 8;
    pdf.text(`Created: ${new Date(payment.createdAt).toLocaleString()}`, 20, y); y += 12;
    
    pdf.setFontSize(12);
    pdf.text('ISO 20022 Details', 20, y); y += 8;
    
    pdf.setFontSize(10);
    pdf.text(`Standard: ${payment.proof.standard}`, 20, y); y += 6;
    pdf.text(`Message Type: ${payment.proof.messageType}`, 20, y); y += 6;
    pdf.text(`Status: ${payment.proof.verification.status}`, 20, y); y += 12;
    
    pdf.setFontSize(12);
    pdf.text('Blockchain Details', 20, y); y += 8;
    
    pdf.setFontSize(10);
    pdf.text(`Network: Flare Coston2 Testnet`, 20, y); y += 6;
    pdf.text(`Block: ${payment.blockNumber || 'N/A'}`, 20, y); y += 6;
    pdf.text(`Explorer: ${getExplorerLink(payment.txHash)}`, 20, y);
    
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Generated on ${new Date().toLocaleString()}`, 20, 285);
    
    pdf.save(`proof_${payment.id}.pdf`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-accent-amber/20 text-accent-amber border-accent-amber/30',
      confirming: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30',
      confirmed: 'bg-accent-green/20 text-accent-green border-accent-green/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[status] || 'bg-dark-600 text-gray-400 border-dark-500';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'confirming':
        return <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
      case 'confirmed':
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
      case 'failed':
        return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
      default:
        return null;
    }
  };

  return (
    <div className="glass-card gradient-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center shadow-glow-purple">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Transactions</h2>
              <p className="text-sm text-gray-400">{filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>
          <button
            onClick={() => { loadPaymentsFromStorage(); refreshBalance(); }}
            className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white hover:bg-dark-600 rounded-xl transition-all flex items-center gap-2 group"
          >
            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-white/5 bg-dark-800/30">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-white/10 rounded-xl text-sm bg-dark-700/50 text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirming">Confirming</option>
              <option value="confirmed">Confirmed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2.5 border border-white/10 rounded-xl text-sm bg-dark-700/50 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2.5 border border-white/10 rounded-xl text-sm bg-dark-700/50 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFilter('all'); setDateFrom(''); setDateTo(''); }}
              className="w-full px-4 py-2.5 text-sm font-semibold text-gray-400 hover:text-white hover:bg-dark-600 rounded-xl transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="p-16 text-center">
          <div className="w-16 h-16 bg-dark-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No Transactions Yet</h3>
          <p className="text-gray-400">Create a payment request to get started</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="p-6 hover:bg-dark-700/30 transition-all">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  {/* Status and amount row */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusBadge(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status}
                    </span>
                    <span className="text-xl font-bold text-white">{payment.amount} <span className="text-brand-400">USDT0</span></span>
                    {payment.proofId && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-accent-purple/20 text-accent-purple border border-accent-purple/30">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        ISO 20022 Verified
                      </span>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="text-sm text-gray-400 space-y-1.5">
                    <p className="font-mono text-xs bg-dark-700/50 px-3 py-1.5 rounded-lg inline-block">{payment.recipient}</p>
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}
                    </p>
                    {payment.memo && <p className="text-gray-300 italic">"{payment.memo}"</p>}
                  </div>
                  
                  {/* Explorer link */}
                  {payment.txHash && (
                    <a
                      href={getExplorerLink(payment.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors group"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      View on Explorer
                      <svg className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                      </svg>
                    </a>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {payment.status === 'confirmed' && !payment.proofId && (
                    <button
                      onClick={() => handleGenerateProof(payment)}
                      disabled={generatingProof}
                      className="px-4 py-2.5 bg-gradient-to-r from-accent-purple to-accent-blue hover:opacity-90 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-glow-purple"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      Generate Proof
                    </button>
                  )}
                  {payment.proofId && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadProofJSON(payment)}
                        className="px-4 py-2.5 bg-dark-600 hover:bg-dark-500 text-gray-300 text-sm font-semibold rounded-xl transition-all border border-white/10 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        JSON
                      </button>
                      <button
                        onClick={() => handleDownloadProofPDF(payment)}
                        className="px-4 py-2.5 btn-primary text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        PDF
                      </button>
                    </div>
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
