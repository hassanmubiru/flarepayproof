import { ethers } from 'ethers';
import { 
  FLARE_CONFIG, 
  FDC_CONFIG, 
  CONTRACT_ADDRESSES, 
  FLARE_PAY_PROOF_ABI,
  USDT0_CONFIG 
} from '../config/flareConfig';

/**
 * ProofRails Service - Smart Contract Integration
 * 
 * All payment proofs are stored on-chain via the FlarePayProof smart contract.
 * Uses Flare's FDC for cross-chain attestation and verification.
 * Proofs are permanent and verifiable on the Flare blockchain.
 */
class ProofRailsService {
  constructor() {
    this.contractAddress = CONTRACT_ADDRESSES.flarePayProof;
    this.contract = null;
    this.provider = null;
    this.signer = null;
    
    // FDC config for additional verification
    this.fdcConfig = FDC_CONFIG;
    this.firstVotingRoundStartTs = 1658429955;
    this.votingEpochDurationSeconds = 90;
  }

  /**
   * Initialize the contract with a signer
   */
  async init(signer) {
    this.signer = signer;
    this.provider = signer.provider;
    this.contract = new ethers.Contract(
      this.contractAddress,
      FLARE_PAY_PROOF_ABI,
      signer
    );
    return this;
  }

  /**
   * Initialize read-only contract (no signer needed)
   */
  async initReadOnly() {
    this.provider = new ethers.JsonRpcProvider(FLARE_CONFIG.rpcUrl);
    this.contract = new ethers.Contract(
      this.contractAddress,
      FLARE_PAY_PROOF_ABI,
      this.provider
    );
    return this;
  }

  /**
   * Create an on-chain ISO 20022 payment proof
   * 
   * @param {Object} transactionData - Payment transaction data
   * @returns {Object} Proof data including on-chain proof ID
   */
  async generateProof(transactionData) {
    try {
      console.log('Creating on-chain proof for transaction:', transactionData.txHash);

      // Convert tx hash to bytes32
      const txHashBytes32 = transactionData.txHash.startsWith('0x') 
        ? transactionData.txHash 
        : '0x' + transactionData.txHash;
      
      // Ensure we have a valid bytes32
      const paddedTxHash = txHashBytes32.padEnd(66, '0');

      // Get proof fee
      const proofFee = await this.contract.proofFee();

      // Create proof on-chain
      const tx = await this.contract.createProof(
        paddedTxHash,
        transactionData.recipient,
        transactionData.tokenContract || USDT0_CONFIG.address,
        ethers.parseUnits(transactionData.amount.toString(), USDT0_CONFIG.decimals),
        USDT0_CONFIG.decimals,
        USDT0_CONFIG.symbol,
        transactionData.memo || '',
        { value: proofFee }
      );

      console.log('Proof creation tx sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Proof created in block:', receipt.blockNumber);

      // Extract proof ID from event
      const proofCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'ProofCreated';
        } catch {
          return false;
        }
      });

      let proofId = null;
      if (proofCreatedEvent) {
        const parsed = this.contract.interface.parseLog(proofCreatedEvent);
        proofId = parsed.args.proofId;
      }

      // Generate full ISO 20022 proof structure
      const proof = this.generateISO20022Proof(transactionData, proofId, receipt);

      return proof;

    } catch (error) {
      console.error('Error creating on-chain proof:', error);
      
      // If contract call fails, return offline proof with pending status
      return this.generateISO20022Proof(transactionData, null, null);
    }
  }

  /**
   * Get proof from blockchain by proof ID
   */
  async getProofById(proofId) {
    try {
      const proof = await this.contract.getProof(proofId);
      return this.formatOnChainProof(proof);
    } catch (error) {
      console.error('Error fetching proof:', error);
      throw error;
    }
  }

  /**
   * Get proof by transaction hash
   */
  async getProofByTxHash(txHash) {
    try {
      const proofId = await this.contract.getProofByTxHash(txHash);
      if (proofId === ethers.ZeroHash) {
        return null;
      }
      return this.getProofById(proofId);
    } catch (error) {
      console.error('Error fetching proof by tx hash:', error);
      throw error;
    }
  }

  /**
   * Get all proofs for a user
   */
  async getUserProofs(userAddress) {
    try {
      const proofIds = await this.contract.getUserProofs(userAddress);
      const proofs = await Promise.all(
        proofIds.map(id => this.getProofById(id))
      );
      return proofs;
    } catch (error) {
      console.error('Error fetching user proofs:', error);
      return [];
    }
  }

  /**
   * Verify proof with FDC data
   */
  async verifyProofWithFDC(proofId, fdcRoundId, merkleRoot) {
    try {
      const tx = await this.contract.verifyProofWithFDC(
        proofId,
        fdcRoundId,
        merkleRoot
      );
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error verifying proof with FDC:', error);
      return false;
    }
  }

  /**
   * Create a payment request on-chain
   */
  async createPaymentRequest(recipient, amount, memo, expiresInSeconds = 0) {
    try {
      const tx = await this.contract.createPaymentRequest(
        recipient,
        USDT0_CONFIG.address,
        ethers.parseUnits(amount.toString(), USDT0_CONFIG.decimals),
        memo,
        expiresInSeconds
      );
      
      const receipt = await tx.wait();
      
      // Extract request ID from event
      const requestEvent = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'PaymentRequestCreated';
        } catch {
          return false;
        }
      });

      if (requestEvent) {
        const parsed = this.contract.interface.parseLog(requestEvent);
        return parsed.args.requestId;
      }

      return null;
    } catch (error) {
      console.error('Error creating payment request:', error);
      throw error;
    }
  }

  /**
   * Get payment request from blockchain
   */
  async getPaymentRequest(requestId) {
    try {
      const request = await this.contract.getPaymentRequest(requestId);
      return {
        requestId: request.requestId,
        creator: request.creator,
        recipient: request.recipient,
        tokenContract: request.tokenContract,
        amount: ethers.formatUnits(request.amount, USDT0_CONFIG.decimals),
        memo: request.memo,
        createdAt: Number(request.createdAt),
        expiresAt: Number(request.expiresAt),
        fulfilled: request.fulfilled,
        proofId: request.proofId
      };
    } catch (error) {
      console.error('Error fetching payment request:', error);
      throw error;
    }
  }

  /**
   * Check if proof is FDC verified
   */
  async isFDCVerified(proofId) {
    try {
      return await this.contract.isFDCVerified(proofId);
    } catch (error) {
      console.error('Error checking FDC verification:', error);
      return false;
    }
  }

  /**
   * Get ISO 20022 message ID for a proof
   */
  async getISO20022MessageId(proofId) {
    try {
      return await this.contract.getISO20022MessageId(proofId);
    } catch (error) {
      console.error('Error getting message ID:', error);
      return null;
    }
  }

  /**
   * Get total proofs created
   */
  async getTotalProofs() {
    try {
      return Number(await this.contract.totalProofs());
    } catch (error) {
      console.error('Error getting total proofs:', error);
      return 0;
    }
  }

  /**
   * Format on-chain proof data
   */
  formatOnChainProof(proof) {
    const statusMap = ['Pending', 'BlockchainAnchored', 'FDCVerified', 'Disputed', 'Invalid'];
    
    return {
      id: proof.proofId,
      proofId: proof.proofId,
      standard: 'ISO 20022',
      messageType: proof.messageType,
      transactionId: proof.txHash,
      txHash: proof.txHash,
      blockNumber: Number(proof.blockNumber),
      timestamp: Number(proof.timestamp),
      sender: proof.sender,
      recipient: proof.recipient,
      tokenContract: proof.tokenContract,
      amount: ethers.formatUnits(proof.amount, proof.decimals),
      decimals: proof.decimals,
      tokenSymbol: proof.tokenSymbol,
      memo: proof.memo,
      fdcRoundId: Number(proof.fdcRoundId),
      merkleRoot: proof.merkleRoot,
      status: statusMap[proof.status] || 'Unknown',
      verificationStatus: statusMap[proof.status] || 'Unknown',
      proofCreatedAt: Number(proof.proofCreatedAt),
      onChain: true,
      contractAddress: this.contractAddress,
      explorerLink: `${FLARE_CONFIG.explorerUrl}/address/${this.contractAddress}`
    };
  }

  /**
   * Generate ISO 20022 compliant proof structure
   */
  generateISO20022Proof(transactionData, proofId, receipt) {
    const timestamp = new Date().toISOString();
    const messageId = `FLARE${Date.now()}`;
    
    return {
      id: proofId || `LOCAL_${Date.now()}_${transactionData.txHash?.slice(0, 10) || 'pending'}`,
      proofId: proofId,
      standard: 'ISO 20022',
      version: '2.0',
      messageType: 'pacs.008.001.08',
      transactionId: transactionData.txHash,
      created: timestamp,
      
      // On-chain anchoring
      onChainAnchoring: {
        status: proofId ? 'confirmed' : 'pending',
        contractAddress: this.contractAddress,
        proofId: proofId,
        transactionHash: receipt?.hash || null,
        blockNumber: receipt?.blockNumber || null,
        network: 'Flare Coston2 Testnet',
        chainId: FLARE_CONFIG.chainId,
        explorerUrl: proofId 
          ? `${FLARE_CONFIG.explorerUrl}/address/${this.contractAddress}`
          : null
      },

      // FDC anchoring (for additional verification)
      fdcAnchoring: {
        protocol: 'Flare Data Connector (FDC)',
        network: 'Flare Coston2 Testnet',
        chainId: FLARE_CONFIG.chainId,
        attestationType: 'EVMTransaction',
        verificationStatus: proofId ? 'blockchain-anchored' : 'pending',
        explorerUrl: `${FLARE_CONFIG.explorerUrl}/tx/${transactionData.txHash}`,
        merkleProof: null,
        fdcResponse: null,
        roundId: null
      },

      // pacs.008 - FIToFICustomerCreditTransfer
      data: {
        groupHeader: {
          messageIdentification: messageId,
          creationDateTime: timestamp,
          numberOfTransactions: '1',
          totalInterbankSettlementAmount: {
            value: transactionData.amount,
            currency: USDT0_CONFIG.symbol
          },
          interbankSettlementDate: timestamp.split('T')[0],
          settlementInformation: {
            settlementMethod: 'INDA',
            settlementAccount: {
              identification: transactionData.txHash
            }
          },
          instructingAgent: {
            financialInstitutionIdentification: {
              bicfi: 'FLRXUS00XXX',
              name: 'Flare Network'
            }
          }
        },
        
        creditTransferTransactionInformation: {
          paymentIdentification: {
            instructionIdentification: `INST${Date.now()}`,
            endToEndIdentification: `E2E${Date.now()}`,
            transactionIdentification: transactionData.txHash,
            uetr: this.generateUETR()
          },
          interbankSettlementAmount: {
            value: transactionData.amount,
            currency: USDT0_CONFIG.symbol
          },
          chargeBearer: 'SLEV',
          debtorAgent: {
            financialInstitutionIdentification: {
              bicfi: 'FLRXUS00XXX',
              name: 'Flare Wallet'
            }
          },
          debtorAccount: {
            identification: {
              other: {
                identification: transactionData.sender,
                schemeName: 'BLKC'
              }
            }
          },
          creditorAgent: {
            financialInstitutionIdentification: {
              bicfi: 'FLRXUS00XXX',
              name: 'Flare Wallet'
            }
          },
          creditorAccount: {
            identification: {
              other: {
                identification: transactionData.recipient,
                schemeName: 'BLKC'
              }
            }
          },
          remittanceInformation: {
            unstructured: transactionData.memo || 'TUSDT Payment via FlarePayProof'
          }
        },

        // pain.001 - Payment Initiation
        paymentInitiation: {
          messageType: 'pain.001.001.09',
          creationDateTime: timestamp,
          initiatingParty: {
            identification: transactionData.sender,
            name: 'FlarePayProof User'
          },
          paymentInformation: {
            paymentInformationIdentification: `PMT${Date.now()}`,
            paymentMethod: 'TRF',
            requestedExecutionDate: timestamp.split('T')[0],
            debtor: {
              identification: transactionData.sender
            },
            debtorAccount: {
              identification: transactionData.sender,
              currency: USDT0_CONFIG.symbol
            }
          }
        },

        // camt.054 - Notification
        notification: {
          messageType: 'camt.054.001.08',
          identification: `NTFY${Date.now()}`,
          creationDateTime: timestamp,
          account: {
            identification: transactionData.recipient,
            currency: USDT0_CONFIG.symbol
          },
          entry: {
            amount: {
              value: transactionData.amount,
              currency: USDT0_CONFIG.symbol
            },
            creditDebitIndicator: 'CRDT',
            status: 'BOOK',
            bookingDate: timestamp.split('T')[0],
            valueDate: timestamp.split('T')[0]
          }
        },

        // remt - Remittance Advice
        remittanceAdvice: {
          messageType: 'remt.001.001.04',
          remittanceInformation: {
            unstructured: transactionData.memo || 'Payment via FlarePayProof',
            structured: {
              creditorReferenceInformation: {
                type: { codeOrProprietary: 'TXID' },
                reference: transactionData.txHash
              }
            }
          }
        }
      },

      // Blockchain verification
      blockchainVerification: {
        network: 'Flare Coston2 Testnet',
        chainId: FLARE_CONFIG.chainId,
        transactionHash: transactionData.txHash,
        blockNumber: transactionData.blockNumber,
        timestamp: transactionData.timestamp,
        tokenContract: transactionData.tokenContract || USDT0_CONFIG.address,
        tokenSymbol: USDT0_CONFIG.symbol,
        confirmationStatus: 'confirmed',
        explorerLink: `${FLARE_CONFIG.explorerUrl}/tx/${transactionData.txHash}`,
        proofContract: this.contractAddress,
        proofExplorerLink: `${FLARE_CONFIG.explorerUrl}/address/${this.contractAddress}`
      },

      // Verification status
      verification: {
        status: proofId ? 'on-chain' : 'pending',
        protocol: 'FlarePayProof Smart Contract',
        onChain: !!proofId,
        contractAddress: this.contractAddress,
        proofId: proofId
      }
    };
  }

  /**
   * Generate UETR (Unique End-to-end Transaction Reference)
   */
  generateUETR() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Download proof as JSON file
   */
  downloadProofJSON(proof) {
    const dataStr = JSON.stringify(proof, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `iso20022_proof_${proof.id || proof.proofId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  /**
   * Store proof locally (backup)
   */
  storeProof(proof) {
    localStorage.setItem(`proof_${proof.id || proof.proofId}`, JSON.stringify(proof));
  }

  /**
   * Get proof from local storage
   */
  getLocalProof(proofId) {
    const stored = localStorage.getItem(`proof_${proofId}`);
    return stored ? JSON.parse(stored) : null;
  }
}

// Export singleton instance
const proofRailsService = new ProofRailsService();
export default proofRailsService;
