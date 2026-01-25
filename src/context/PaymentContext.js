import React, { createContext, useContext, useReducer } from 'react';
import { Contract, parseUnits } from 'ethers';
import { USDT0_CONFIG, ERC20_ABI, FLARE_CONFIG } from '../config/flareConfig';
import { useWallet } from './WalletContext';

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

      // Wait for confirmation
      const receipt = await tx.wait();

      // Update payment status
      dispatch({
        type: 'UPDATE_PAYMENT',
        payload: {
          id: paymentId,
          updates: {
            status: 'confirmed',
            confirmedAt: new Date().toISOString(),
            blockNumber: receipt.blockNumber
          }
        }
      });

      dispatch({ type: 'SET_LOADING', payload: false });

      return { txHash: tx.hash, receipt };
    } catch (error) {
      console.error('Error executing transfer:', error);
      dispatch({
        type: 'UPDATE_PAYMENT',
        payload: {
          id: paymentId,
          updates: { status: 'failed', error: error.message }
        }
      });
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

  // Save payment to localStorage
  const savePaymentToStorage = (payment) => {
    const payments = JSON.parse(localStorage.getItem('flarepay_payments') || '[]');
    payments.push(payment);
    localStorage.setItem('flarepay_payments', JSON.stringify(payments));
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

  const value = {
    ...state,
    createPaymentRequest,
    executeTransfer,
    generatePaymentLink,
    loadPaymentsFromStorage,
    getExplorerLink
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
