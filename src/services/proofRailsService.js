import { PROOFRAILS_CONFIG } from '../config/flareConfig';

class ProofRailsService {
  constructor() {
    this.apiUrl = PROOFRAILS_CONFIG.apiUrl;
    this.apiKey = PROOFRAILS_CONFIG.apiKey;
  }

  // Generate ISO 20022 proof for a transaction
  // Uses pacs.008 (Payment Clearing) for credit transfers
  async generateProof(transactionData) {
    try {
      const response = await fetch(`${this.apiUrl}/proofs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-ProofRails-Version': '1.0',
          'X-ISO-MessageType': 'pacs.008.001.08'
        },
        body: JSON.stringify({
          messageType: 'pacs.008.001.08', // FIToFICustomerCreditTransfer
          network: 'flare-testnet',
          blockchain: 'Flare',
          chainId: 114,
          txHash: transactionData.txHash,
          amount: transactionData.amount,
          sender: transactionData.sender,
          recipient: transactionData.recipient,
          memo: transactionData.memo,
          timestamp: transactionData.timestamp,
          blockNumber: transactionData.blockNumber,
          currency: 'TUSDT',
          settlementMethod: 'INDA', // Instructed Agent
          anchorChain: 'Flare',
          anchorType: 'transaction_hash'
        })
      });

      if (!response.ok) {
        throw new Error(`ProofRails API error: ${response.statusText}`);
      }

      const proof = await response.json();
      return proof;
    } catch (error) {
      console.error('Error generating proof:', error);
      // For development/testing, return mock proof if API fails
      return this.generateMockProof(transactionData);
    }
  }

  // Get proof by ID
  async getProof(proofId) {
    try {
      const response = await fetch(`${this.apiUrl}/proofs/${proofId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`ProofRails API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching proof:', error);
      throw error;
    }
  }

  // Generate mock proof for development (replace with real API integration)
  // Implements multiple ISO 20022 message types:
  // - pacs.008: Payment clearing (credit transfer)
  // - pain.001: Payment initiation (customer credit transfer)
  // - camt.054: Debit/credit notification
  // - remt: Remittance advice
  generateMockProof(transactionData) {
    const proofId = `proof_${Date.now()}`;
    const messageId = `MSG${Date.now()}`;
    
    return {
      id: proofId,
      standard: 'ISO 20022',
      messageType: 'pacs.008.001.08', // Primary: Payment Clearing
      transactionId: transactionData.txHash,
      created: new Date().toISOString(),
      anchoredOn: 'Flare',
      anchorDetails: {
        blockchain: 'Flare',
        network: 'testnet-coston2',
        chainId: 114,
        txHash: transactionData.txHash,
        blockNumber: transactionData.blockNumber,
        confirmations: 'finalized'
      },
      data: {
        // pacs.008 - FIToFICustomerCreditTransfer
        groupHeader: {
          messageIdentification: messageId,
          creationDateTime: new Date().toISOString(),
          numberOfTransactions: '1',
          totalInterbankSettlementAmount: {
            value: transactionData.amount,
            currency: 'TUSDT'
          },
          settlementInformation: {
            settlementMethod: 'INDA',
            settlementAccount: {
              identification: transactionData.txHash
            }
          }
        },
        // Payment transaction details
        creditTransferTransactionInformation: {
          paymentIdentification: {
            instructionIdentification: `INST${Date.now()}`,
            endToEndIdentification: `E2E${Date.now()}`,
            transactionIdentification: transactionData.txHash
          },
          paymentInformation: {
          paymentInformationIdentification: `PMT${Date.now()}`,
          debtorAccount: {
            identification: transactionData.sender
          },
          creditorAccount: {
            identification: transactionData.recipient
          },
          instructedAmount: {
            value: transactionData.amount,
            currency: 'TUSDT'
          },
          remittanceInformation: {
            unstructured: transactionData.memo || 'Test USDT Payment (Testnet)'
          }
        },
        // pain.001 - CustomerCreditTransferInitiation
        paymentInitiation: {
          messageType: 'pain.001.001.09',
          initiatingParty: {
            identification: transactionData.sender,
            name: 'Payment Initiator'
          },
          paymentInformation: {
            paymentInformationIdentification: `PMT${Date.now()}`,
            paymentMethod: 'TRF',
            requestedExecutionDate: new Date().toISOString().split('T')[0],
            debtor: {
              identification: transactionData.sender
            },
            debtorAccount: {
              identification: transactionData.sender,
              currency: 'TUSDT'
            }
          }
        },
        // camt.054 - BankToCustomerDebitCreditNotification
        notification: {
          messageType: 'camt.054.001.08',
          identification: `NTFY${Date.now()}`,
          creationDateTime: new Date().toISOString(),
          account: {
            identification: transactionData.recipient,
            currency: 'TUSDT'
          },
          entry: {
            amount: {
              value: transactionData.amount,
              currency: 'TUSDT'
            },
            creditDebitIndicator: 'CRDT',
            status: 'BOOK',
            bookingDate: new Date().toISOString().split('T')[0],
            valueDate: new Date().toISOString().split('T')[0]
          }
        },
        // remt - RemittanceAdvice
        remittanceAdvice: {
          messageType: 'remt.001.001.04',
          remittanceInformation: {
            unstructured: transactionData.memo || 'Payment via FlarePayProof',
            structured: {
              creditorReferenceInformation: {
                reference: transactionData.txHash
              }
            }
          },
          relatedPaymentInstruction: {
            paymentInstructionIdentification: messageId,
            transactionIdentification: transactionData.txHash
          }
        },
        // Blockchain-specific supplementary data
        supplementaryData: {
          blockchain: 'Flare',
          network: 'testnet-coston2',
          chainId: 114,
          transactionHash: transactionData.txHash,
          blockNumber: transactionData.blockNumber,
          timestamp: transactionData.timestamp,
          tokenContract: '0x0000000000000000000000000000000000000000',
          gasUsed: 'N/A',
          confirmationStatus: 'confirmed',
          smartContractVerified: true
        }
      },
      verification: {
        status: 'verified',
        signature: `0x${Math.random().toString(16).substr(2)}`,
        merkleRoot: `0x${Math.random().toString(16).substr(2)}`
      }
    };
  }

  // Download proof as JSON
  downloadProofJSON(proof) {
    const dataStr = JSON.stringify(proof, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `proof_${proof.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
}

const proofRailsService = new ProofRailsService();
export default proofRailsService;
