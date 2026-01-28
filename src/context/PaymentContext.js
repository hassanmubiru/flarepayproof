import React, { createContext, useContext, useReducer } from 'react';
import { Contract, parseUnits } from 'ethers';
import { USDT0_CONFIG, ERC20_ABI, FLARE_CONFIG, CONTRACT_ADDRESSES, FLARE_PAY_PROOF_ABI } from '../config/flareConfig';
import { useWallet } from './WalletContext';
import proofRailsService from '../services/proofRailsService';

const paymentReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_PAYMENT':
      return { ...state, payments: [action.payload, ...state.payments] };
    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        )
      };
    case 'SET_PAYMENTS':
      return { ...state, payments: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const initialState = {
  payments: [],
  loading: false
};

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);
  const { provider, account } = useWallet();

  // Save payment to localStorage
  const savePaymentToStorage = (payment) => {
    const payments = JSON.parse(localStorage.getItem('flarepay_payments') || '[]');
    payments.push(payment);
    localStorage.setItem('flarepay_payments', JSON.stringify(payments));
  };

  // Update payment in localStorage
  const updatePaymentInStorage = (paymentId, updates) => {
    const payments = JSON.parse(localStorage.getItem('flarepay_payments') || '[]');
    const updatedPayments = payments.map(p =>
      p.id === paymentId ? { ...p, ...updates } : p
    );
    localStorage.setItem('flarepay_payments', JSON.stringify(updatedPayments));
  };

  // Create payment request
  const createPaymentRequest = async (amount, recipient, memo, expiry) => {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payment = {
      id: paymentId,
      amount,
      recipient,
      memo,
      expiry: expiry || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      createdBy: account,
      txHash: null,
      proofId: null
    };

    dispatch({ type: 'ADD_PAYMENT', payload: payment });
    
    // Save to localStorage (in production, use Supabase)
    savePaymentToStorage(payment);
    
    return payment;
  };

  // Execute USDT0 transfer
  const executeTransfer = async (paymentId, recipient, amount) => {
    try {
      if (!provider || !account) {
        throw new Error('Wallet not connected');
      }

      dispatch({ type: 'SET_LOADING', payload: true });

      const signer = await provider.getSigner();
      const usdt0Contract = new Contract(USDT0_CONFIG.address, ERC20_ABI, signer);

      // Parse amount to proper decimals
      const amountInWei = parseUnits(amount.toString(), USDT0_CONFIG.decimals);

      // Execute transfer
      const tx = await usdt0Contract.transfer(recipient, amountInWei);
      
      // Update payment with tx hash
      dispatch({
        type: 'UPDATE_PAYMENT',
        payload: {
          id: paymentId,
          updates: { txHash: tx.hash, status: 'confirming' }
        }
      });
      
      // Also update localStorage
      updatePaymentInStorage(paymentId, { txHash: tx.hash, status: 'confirming' });

      // Wait for confirmation
      const receipt = await tx.wait();

      // Create on-chain proof via FlarePayProof contract
      let onChainProofId = null;
      try {
        console.log('Creating on-chain proof...');
        const proofContract = new Contract(
          CONTRACT_ADDRESSES.flarePayProof,
          FLARE_PAY_PROOF_ABI,
          signer
        );
        
        // Get proof fee
        const proofFee = await proofContract.proofFee();
        
        // Create proof on-chain
        const proofTx = await proofContract.createProof(
          tx.hash, // Use tx hash as bytes32
          recipient,
          USDT0_CONFIG.address,
          amountInWei,
          USDT0_CONFIG.decimals,
          USDT0_CONFIG.symbol,
          'TUSDT Payment via FlarePayProof',
          { value: proofFee }
        );
        
        const proofReceipt = await proofTx.wait();
        console.log('On-chain proof created in block:', proofReceipt.blockNumber);
        
        // Extract proof ID from event
        const proofEvent = proofReceipt.logs.find(log => {
          try {
            const parsed = proofContract.interface.parseLog(log);
            return parsed?.name === 'ProofCreated';
          } catch {
            return false;
          }
        });
        
        if (proofEvent) {
          const parsed = proofContract.interface.parseLog(proofEvent);
          onChainProofId = parsed.args.proofId;
          console.log('Proof ID:', onChainProofId);
        }
      } catch (proofError) {
        console.error('Error creating on-chain proof:', proofError);
        // Continue without on-chain proof - payment still succeeded
      }

      // Update payment status
      const confirmedUpdates = {
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        blockNumber: receipt.blockNumber,
        onChainProofId: onChainProofId
      };
      
      dispatch({
        type: 'UPDATE_PAYMENT',
        payload: {
          id: paymentId,
          updates: confirmedUpdates
        }
      });
      
      // Also update localStorage
      updatePaymentInStorage(paymentId, confirmedUpdates);

      dispatch({ type: 'SET_LOADING', payload: false });

      return { txHash: tx.hash, receipt, onChainProofId };
    } catch (error) {
      console.error('Error executing transfer:', error);
      const failedUpdates = { status: 'failed', error: error.message };
      dispatch({
        type: 'UPDATE_PAYMENT',
        payload: {
          id: paymentId,
          updates: failedUpdates
        }
      });
      // Also update localStorage
      updatePaymentInStorage(paymentId, failedUpdates);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  // Generate payment link
  const generatePaymentLink = (payment) => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      id: payment.id,
      amount: payment.amount,
      recipient: payment.recipient,
      memo: payment.memo || ''
    });
    return `${baseUrl}/pay?${params.toString()}`;
  };

  // Load payments from localStorage
  const loadPaymentsFromStorage = () => {
    const payments = JSON.parse(localStorage.getItem('flarepay_payments') || '[]');
    dispatch({ type: 'SET_PAYMENTS', payload: payments });
  };

  // Get transaction explorer link
  const getExplorerLink = (txHash) => {
    return `${FLARE_CONFIG.explorerUrl}/tx/${txHash}`;
  };

  // Get proof contract link
  const getProofContractLink = () => {
    return `${FLARE_CONFIG.explorerUrl}/address/${CONTRACT_ADDRESSES.flarePayProof}`;
  };

  // Get on-chain proof by ID
  const getOnChainProof = async (proofId) => {
    try {
      await proofRailsService.initReadOnly();
      return await proofRailsService.getProofById(proofId);
    } catch (error) {
      console.error('Error fetching on-chain proof:', error);
      return null;
    }
  };

  // Get all on-chain proofs for current user
  const getUserOnChainProofs = async () => {
    if (!account) return [];
    try {
      await proofRailsService.initReadOnly();
      return await proofRailsService.getUserProofs(account);
    } catch (error) {
      console.error('Error fetching user proofs:', error);
      return [];
    }
  };

  const value = {
    ...state,
    createPaymentRequest,
    executeTransfer,
    generatePaymentLink,
    loadPaymentsFromStorage,
    getExplorerLink,
    getProofContractLink,
    getOnChainProof,
    getUserOnChainProofs,
    proofContractAddress: CONTRACT_ADDRESSES.flarePayProof
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
