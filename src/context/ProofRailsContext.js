import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import proofRailsService from '../services/proofRailsService';

/**
 * ProofRails Context
 * 
 * Provides ProofRails SDK integration throughout the app.
 * Uses a safe initialization pattern to prevent crashes.
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
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize ProofRails service on mount
  useEffect(() => {
    const initService = async () => {
      try {
        const apiKey = process.env.REACT_APP_PROOFRAILS_API_KEY;
        if (apiKey && apiKey !== 'your_proofrails_api_key') {
          const success = await proofRailsService.init(apiKey);
          setIsReady(success);
        } else {
          console.log('ProofRails: Using fallback mode (no API key)');
          setIsReady(false);
        }
      } catch (err) {
        console.error('ProofRails init error:', err);
        setError(err.message);
        setIsReady(false);
      }
    };

    initService();
  }, []);

  // Generate receipt for a payment
  const generateReceipt = async (paymentData) => {
    setIsLoading(true);
    setError(null);
    try {
      const receipt = await proofRailsService.generateReceipt(paymentData);
      setIsLoading(false);
      return receipt;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  // Verify a receipt
  const verifyReceipt = async (receiptIdOrHash) => {
    try {
      return await proofRailsService.verifyReceipt(receiptIdOrHash);
    } catch (err) {
      return { isValid: false, error: err.message };
    }
  };

  // Download receipt as JSON
  const downloadReceipt = (receipt) => {
    proofRailsService.downloadReceiptJSON(receipt);
  };

  // Download PAIN.001 XML
  const downloadPAIN001 = async (receipt) => {
    return await proofRailsService.downloadPAIN001(receipt);
  };

  const value = useMemo(() => ({
    isReady,
    isLoading,
    error,
    generateReceipt,
    verifyReceipt,
    downloadReceipt,
    downloadPAIN001,
    service: proofRailsService
  }), [isReady, isLoading, error]);

  return (
    <ProofRailsContext.Provider value={value}>
      {children}
    </ProofRailsContext.Provider>
  );
};

export default ProofRailsProvider;
