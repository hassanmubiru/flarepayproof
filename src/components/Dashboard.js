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
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      confirming: 'bg-blue-50 text-blue-700 border-blue-200',
      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      failed: 'bg-red-50 text-red-700 border-red-200',
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Transactions</h2>
            <p className="text-sm text-slate-500">{filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => { loadPaymentsFromStorage(); refreshBalance(); }}
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirming">Confirming</option>
              <option value="confirmed">Confirmed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFilter('all'); setDateFrom(''); setDateTo(''); }}
              className="w-full px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900 mb-1">No Transactions</h3>
          <p className="text-sm text-slate-500">Create a payment request to get started</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="p-5 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Status and amount row */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                    <span className="text-lg font-semibold text-slate-900">{payment.amount} <span className="text-brand-500">USDT0</span></span>
                    {payment.proofId && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        Verified
                      </span>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="text-sm text-slate-500 space-y-1">
                    <p className="font-mono text-xs">{payment.recipient}</p>
                    <p>{new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}</p>
                    {payment.memo && <p className="text-slate-600">{payment.memo}</p>}
                  </div>
                  
                  {/* Explorer link */}
                  {payment.txHash && (
                    <a
                      href={getExplorerLink(payment.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm text-brand-500 hover:text-brand-600"
                    >
                      View on Explorer
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
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
                      className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      Generate Proof
                    </button>
                  )}
                  {payment.proofId && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadProofJSON(payment)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                      >
                        JSON
                      </button>
                      <button
                        onClick={() => handleDownloadProofPDF(payment)}
                        className="px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
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
