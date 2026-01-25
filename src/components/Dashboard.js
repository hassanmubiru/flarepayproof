import React, { useState, useEffect } from 'react';
import { usePayment } from '../context/PaymentContext';
import { useWallet } from '../context/WalletContext';
import proofRailsService from '../services/proofRailsService';
import { jsPDF } from 'jspdf';

const Dashboard = () => {
  const [filter, setFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [generatingProof, setGeneratingProof] = useState(false);

  const { payments, loadPaymentsFromStorage, getExplorerLink } = usePayment();
  const { account, refreshBalance } = useWallet();

  useEffect(() => {
    loadPaymentsFromStorage();
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirming': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
        <button
          onClick={() => { loadPaymentsFromStorage(); refreshBalance(); }}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flare-primary"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirming">Confirming</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flare-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flare-primary"
          />
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                    {payment.proofId && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        Proof Generated
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold ml-2">{payment.amount} USDT0</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Recipient:</span>
                      <span className="font-mono text-xs ml-2">{payment.recipient.substring(0, 10)}...</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2">{new Date(payment.createdAt).toLocaleString()}</span>
                    </div>
                    {payment.memo && (
                      <div>
                        <span className="text-gray-600">Memo:</span>
                        <span className="ml-2">{payment.memo}</span>
                      </div>
                    )}
                  </div>
                  {payment.txHash && (
                    <div className="mt-2">
                      <a
                        href={getExplorerLink(payment.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-flare-primary hover:underline text-sm font-mono"
                      >
                        View on Explorer →
                      </a>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex flex-col space-y-2">
                  {payment.status === 'confirmed' && !payment.proofId && (
                    <button
                      onClick={() => handleGenerateProof(payment)}
                      disabled={generatingProof}
                      className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      Generate Proof
                    </button>
                  )}
                  {payment.proofId && (
                    <>
                      <button
                        onClick={() => handleDownloadProofJSON(payment)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Download JSON
                      </button>
                      <button
                        onClick={() => handleDownloadProofPDF(payment)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Download PDF
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
