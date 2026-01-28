import React, { createContext, useContext, useMemo } from 'react';
import { 
  useProofRails, 
  useProofRailsPayment,
  useReceiptDetails,
  useReceiptsList 
} from '@proofrails/sdk/react';

/**
 * ProofRails Context
 * 
 * Provides ProofRails SDK integration throughout the app.
 * Uses the official @proofrails/sdk for ISO 20022 compliant receipts.
 */

const ProofRailsContext = createContext(null);

export const useProofRailsContext = () => {
  const context = useContext(ProofRailsContext);
  if (!context) {
    throw new Error('useProofRailsContext must be used within ProofRailsProvider');
  }
  return context;
};

export const ProofRailsProvider = ({ children }) => {
  // Initialize ProofRails SDK with API key
  const sdk = useProofRails({
    apiKey: process.env.REACT_APP_PROOFRAILS_API_KEY
  });

  // Payment hook for sending transactions with receipt generation
  const payment = useProofRailsPayment(sdk);

  // Receipts list hook
  const receiptsList = useReceiptsList(sdk);

  const value = useMemo(() => ({
    sdk,
    payment,
    receiptsList,
    
    // Convenience methods
    isReady: sdk?.isReady ?? false,
    isLoading: payment?.loading ?? false,
    error: payment?.error ?? null,
    
    // Send payment with automatic receipt
    sendPayment: payment?.send,
    
    // Get receipt details
    getReceipt: (receiptId) => {
      if (sdk) {
        return sdk.getReceipt(receiptId);
      }
      return null;
    },
    
    // Verify receipt
    verifyReceipt: async (receiptIdOrHash) => {
      if (sdk) {
        try {
          return await sdk.verify(receiptIdOrHash);
        } catch (error) {
          console.error('Receipt verification failed:', error);
          return { isValid: false, error: error.message };
        }
      }
      return { isValid: false, error: 'SDK not initialized' };
    },
    
    // Download ISO 20022 XML
    downloadISO20022XML: async (receiptId) => {
      if (sdk) {
        try {
          const receipt = await sdk.getReceipt(receiptId);
          if (receipt?.artifacts?.pain001) {
            const blob = new Blob([receipt.artifacts.pain001], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ISO20022_PAIN001_${receiptId}.xml`;
            a.click();
            URL.revokeObjectURL(url);
            return true;
          }
        } catch (error) {
          console.error('Download failed:', error);
        }
      }
      return false;
    }
  }), [sdk, payment, receiptsList]);

  return (
    <ProofRailsContext.Provider value={value}>
      {children}
    </ProofRailsContext.Provider>
  );
};

export default ProofRailsProvider;
