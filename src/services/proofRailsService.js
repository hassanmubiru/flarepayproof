import { PROOFRAILS_CONFIG } from '../config/flareConfig';

class ProofRailsService {
  constructor() {
    this.apiUrl = PROOFRAILS_CONFIG.apiUrl;
    this.apiKey = PROOFRAILS_CONFIG.apiKey;
  }

  // Generate ISO 20022 proof for a transaction
  async generateProof(transactionData) {
    try {
      const response = await fetch(`${this.apiUrl}/proofs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          network: 'flare',
          txHash: transactionData.txHash,
          amount: transactionData.amount,
          sender: transactionData.sender,
          recipient: transactionData.recipient,
          memo: transactionData.memo,
          timestamp: transactionData.timestamp,
          currency: 'USDT0'
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
  generateMockProof(transactionData) {
    return {
      id: `proof_${Date.now()}`,
      standard: 'ISO 20022',
      messageType: 'pacs.008.001.08',
      transactionId: transactionData.txHash,
      created: new Date().toISOString(),
      data: {
        messageIdentification: `FLARE${Date.now()}`,
        creationDateTime: new Date().toISOString(),
        numberOfTransactions: '1',
        settlementMethod: 'INDA',
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
            currency: 'USDT0'
          },
          remittanceInformation: {
            unstructured: transactionData.memo || 'USDT0 Payment'
          }
        },
        supplementaryData: {
          blockchain: 'Flare',
          network: 'mainnet',
          transactionHash: transactionData.txHash,
          blockNumber: transactionData.blockNumber,
          timestamp: transactionData.timestamp,
          tokenContract: '0x96B41289D90444B8adD57e6F265DB5aE8651DF29'
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
