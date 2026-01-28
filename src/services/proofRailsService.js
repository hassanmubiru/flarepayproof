import { FLARE_CONFIG, USDT0_CONFIG, CONTRACT_ADDRESSES } from '../config/flareConfig';

// Dynamic import to prevent crashes if SDK fails to load
let ProofRails = null;
try {
  const sdk = require('@proofrails/sdk');
  ProofRails = sdk.ProofRails;
} catch (e) {
  console.warn('ProofRails SDK not available, using fallback mode');
}

/**
 * ProofRails Service
 * 
 * Uses the official @proofrails/sdk from FlareStudio for:
 * - ISO 20022 compliant receipt generation (PAIN.001, CAMT.053)
 * - On-chain anchoring on Flare network
 * - Universal verification without API keys
 * - Banking-grade proof documents
 */
class ProofRailsService {
  constructor() {
    this.sdk = null;
    this.initialized = false;
  }

  /**
   * Initialize the ProofRails SDK
   */
  async init(apiKey = null) {
    try {
      const key = apiKey || process.env.REACT_APP_PROOFRAILS_API_KEY;
      
      if (!key || key === 'your_proofrails_api_key') {
        console.warn('ProofRails API key not configured. Get one from https://www.flarestudio.xyz/sdk/proofrails-sdk/create-api-key');
        return false;
      }

      if (!ProofRails) {
        console.warn('ProofRails SDK not loaded, using fallback mode');
        return false;
      }

      this.sdk = new ProofRails({ apiKey: key });
      this.initialized = true;
      console.log('ProofRails SDK initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize ProofRails SDK:', error);
      return false;
    }
  }

  /**
   * Check if SDK is ready
   */
  isReady() {
    return this.initialized && this.sdk !== null;
  }

  /**
   * Generate ISO 20022 receipt for a payment
   * 
   * @param {Object} paymentData - Payment details
   * @returns {Object} Receipt with ISO 20022 artifacts
   */
  async generateReceipt(paymentData) {
    if (!this.isReady()) {
      console.warn('ProofRails SDK not initialized, using fallback');
      return this.generateFallbackReceipt(paymentData);
    }

    try {
      // Create receipt via ProofRails SDK
      const receipt = await this.sdk.createReceipt({
        amount: paymentData.amount.toString(),
        currency: paymentData.currency || USDT0_CONFIG.symbol,
        sender: paymentData.sender,
        receiver: paymentData.recipient,
        reference: paymentData.txHash,
        purpose: paymentData.memo || 'Payment via FlarePayProof',
        metadata: {
          network: 'Flare Coston2 Testnet',
          chainId: FLARE_CONFIG.chainId,
          tokenContract: paymentData.tokenContract || USDT0_CONFIG.address,
          blockNumber: paymentData.blockNumber,
          timestamp: paymentData.timestamp
        }
      });

      console.log('ProofRails receipt created:', receipt.id);
      return this.formatReceipt(receipt, paymentData);

    } catch (error) {
      console.error('ProofRails receipt creation failed:', error);
      return this.generateFallbackReceipt(paymentData);
    }
  }

  /**
   * Verify a receipt on-chain
   * 
   * @param {string} receiptIdOrHash - Receipt ID or transaction hash
   * @returns {Object} Verification result
   */
  async verifyReceipt(receiptIdOrHash) {
    if (!this.isReady()) {
      return { isValid: false, error: 'SDK not initialized' };
    }

    try {
      const result = await this.sdk.verify(receiptIdOrHash);
      return result;
    } catch (error) {
      console.error('Receipt verification failed:', error);
      return { isValid: false, error: error.message };
    }
  }

  /**
   * Get receipt by ID
   */
  async getReceipt(receiptId) {
    if (!this.isReady()) {
      return null;
    }

    try {
      return await this.sdk.getReceipt(receiptId);
    } catch (error) {
      console.error('Failed to get receipt:', error);
      return null;
    }
  }

  /**
   * List receipts for current project
   */
  async listReceipts(options = {}) {
    if (!this.isReady()) {
      return [];
    }

    try {
      return await this.sdk.listReceipts(options);
    } catch (error) {
      console.error('Failed to list receipts:', error);
      return [];
    }
  }

  /**
   * Format SDK receipt with additional data
   */
  formatReceipt(sdkReceipt, paymentData) {
    return {
      // ProofRails receipt data
      id: sdkReceipt.id,
      projectId: sdkReceipt.projectId,
      status: sdkReceipt.status,
      
      // ISO 20022 compliance
      standard: 'ISO 20022',
      messageTypes: ['pain.001', 'camt.053'],
      
      // Transaction details
      transactionHash: paymentData.txHash,
      amount: paymentData.amount,
      currency: USDT0_CONFIG.symbol,
      sender: paymentData.sender,
      recipient: paymentData.recipient,
      memo: paymentData.memo,
      
      // Blockchain anchoring
      anchoring: {
        network: 'Flare Coston2 Testnet',
        chainId: FLARE_CONFIG.chainId,
        status: sdkReceipt.status,
        blockNumber: sdkReceipt.blockNumber,
        timestamp: sdkReceipt.timestamp,
        merkleRoot: sdkReceipt.merkleRoot
      },
      
      // Verification
      verification: {
        status: sdkReceipt.status === 'anchored' ? 'verified' : 'pending',
        verifyUrl: `https://www.flarestudio.xyz/verify/${sdkReceipt.id}`,
        explorerUrl: `${FLARE_CONFIG.explorerUrl}/tx/${paymentData.txHash}`
      },
      
      // ISO 20022 artifacts (if available)
      artifacts: sdkReceipt.artifacts || null,
      
      // Timestamps
      createdAt: sdkReceipt.createdAt,
      
      // Raw SDK receipt
      _raw: sdkReceipt
    };
  }

  /**
   * Fallback receipt generation when SDK is not available
   */
  generateFallbackReceipt(paymentData) {
    const receiptId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    return {
      id: receiptId,
      standard: 'ISO 20022',
      messageTypes: ['pain.001.001.09', 'camt.053.001.08'],
      status: 'local',
      
      // Transaction details
      transactionHash: paymentData.txHash,
      amount: paymentData.amount,
      currency: USDT0_CONFIG.symbol,
      sender: paymentData.sender,
      recipient: paymentData.recipient,
      memo: paymentData.memo || 'Payment via FlarePayProof',
      
      // ISO 20022 PAIN.001 structure
      pain001: {
        messageType: 'pain.001.001.09',
        groupHeader: {
          messageId: `FLARE${Date.now()}`,
          creationDateTime: timestamp,
          numberOfTransactions: '1',
          initiatingParty: {
            name: 'FlarePayProof',
            identification: paymentData.sender
          }
        },
        paymentInformation: {
          paymentId: paymentData.txHash,
          paymentMethod: 'TRF',
          debtorAccount: paymentData.sender,
          creditorAccount: paymentData.recipient,
          instructedAmount: {
            value: paymentData.amount,
            currency: USDT0_CONFIG.symbol
          },
          remittanceInfo: paymentData.memo || 'TUSDT Payment'
        }
      },
      
      // ISO 20022 CAMT.053 structure
      camt053: {
        messageType: 'camt.053.001.08',
        statement: {
          identification: receiptId,
          creationDateTime: timestamp,
          account: paymentData.recipient,
          balance: {
            type: 'CLBD',
            amount: paymentData.amount,
            currency: USDT0_CONFIG.symbol
          },
          entry: {
            amount: paymentData.amount,
            creditDebitIndicator: 'CRDT',
            status: 'BOOK',
            bookingDate: timestamp.split('T')[0],
            transactionReference: paymentData.txHash
          }
        }
      },
      
      // Blockchain anchoring
      anchoring: {
        network: 'Flare Coston2 Testnet',
        chainId: FLARE_CONFIG.chainId,
        status: 'blockchain-confirmed',
        transactionHash: paymentData.txHash,
        blockNumber: paymentData.blockNumber,
        timestamp: paymentData.timestamp,
        proofContract: CONTRACT_ADDRESSES.flarePayProof
      },
      
      // Verification
      verification: {
        status: 'blockchain-anchored',
        note: 'Get ProofRails API key for full ISO 20022 anchoring',
        getApiKeyUrl: 'https://www.flarestudio.xyz/sdk/proofrails-sdk/create-api-key',
        explorerUrl: `${FLARE_CONFIG.explorerUrl}/tx/${paymentData.txHash}`
      },
      
      createdAt: timestamp
    };
  }

  /**
   * Download receipt as JSON
   */
  downloadReceiptJSON(receipt) {
    const dataStr = JSON.stringify(receipt, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const filename = `iso20022_receipt_${receipt.id}.json`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', filename);
    link.click();
  }

  /**
   * Download PAIN.001 XML (if available)
   */
  async downloadPAIN001(receipt) {
    if (receipt.artifacts?.pain001) {
      const blob = new Blob([receipt.artifacts.pain001], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PAIN001_${receipt.id}.xml`;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    }
    
    // Generate basic PAIN.001 XML from receipt data
    const xml = this.generatePAIN001XML(receipt);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PAIN001_${receipt.id}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  /**
   * Generate PAIN.001 XML from receipt data
   */
  generatePAIN001XML(receipt) {
    const pain = receipt.pain001 || {};
    const gh = pain.groupHeader || {};
    const pi = pain.paymentInformation || {};
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${gh.messageId || receipt.id}</MsgId>
      <CreDtTm>${gh.creationDateTime || receipt.createdAt}</CreDtTm>
      <NbOfTxs>${gh.numberOfTransactions || '1'}</NbOfTxs>
      <InitgPty>
        <Nm>${gh.initiatingParty?.name || 'FlarePayProof'}</Nm>
        <Id>
          <OrgId>
            <Othr>
              <Id>${gh.initiatingParty?.identification || receipt.sender}</Id>
              <SchmeNm><Cd>BLKC</Cd></SchmeNm>
            </Othr>
          </OrgId>
        </Id>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${pi.paymentId || receipt.transactionHash}</PmtInfId>
      <PmtMtd>${pi.paymentMethod || 'TRF'}</PmtMtd>
      <NbOfTxs>1</NbOfTxs>
      <CtrlSum>${receipt.amount}</CtrlSum>
      <Dbtr>
        <Nm>Sender</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id>
          <Othr>
            <Id>${pi.debtorAccount || receipt.sender}</Id>
            <SchmeNm><Cd>BLKC</Cd></SchmeNm>
          </Othr>
        </Id>
      </DbtrAcct>
      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>${receipt.transactionHash}</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="${pi.instructedAmount?.currency || receipt.currency}">${pi.instructedAmount?.value || receipt.amount}</InstdAmt>
        </Amt>
        <Cdtr>
          <Nm>Recipient</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id>
            <Othr>
              <Id>${pi.creditorAccount || receipt.recipient}</Id>
              <SchmeNm><Cd>BLKC</Cd></SchmeNm>
            </Othr>
          </Id>
        </CdtrAcct>
        <RmtInf>
          <Ustrd>${pi.remittanceInfo || receipt.memo || 'Payment via FlarePayProof'}</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
  }
}

// Export singleton instance
const proofRailsService = new ProofRailsService();
export default proofRailsService;
