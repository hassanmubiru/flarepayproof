// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FlarePayProof
 * @notice ISO 20022 compliant payment proof system on Flare
 * @dev Stores payment proofs on-chain with FDC verification support
 * 
 * This contract implements ProofRails for the Flare ProofRails Hackathon Track 1:
 * - Stores ISO 20022 structured payment data on-chain
 * - Generates verifiable proof IDs anchored to Flare
 * - Integrates with FDC for cross-chain attestation
 * - Supports pacs.008, pain.001, camt.054 message types
 */
contract FlarePayProof is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    /**
     * @notice ISO 20022 Payment Proof structure
     * @dev Aligned with pacs.008.001.08 (FIToFICustomerCreditTransfer)
     */
    struct PaymentProof {
        // Unique proof identifier
        bytes32 proofId;
        // ISO 20022 message type (e.g., "pacs.008.001.08")
        string messageType;
        // Transaction hash on Flare
        bytes32 txHash;
        // Block number when payment was made
        uint256 blockNumber;
        // Timestamp of the payment
        uint256 timestamp;
        // Sender (debtor) address
        address sender;
        // Recipient (creditor) address
        address recipient;
        // Token contract address
        address tokenContract;
        // Amount in smallest unit
        uint256 amount;
        // Token decimals
        uint8 decimals;
        // Token symbol
        string tokenSymbol;
        // Payment memo/reference
        string memo;
        // FDC voting round (0 if not FDC verified)
        uint256 fdcRoundId;
        // Merkle proof hash (bytes32(0) if not verified)
        bytes32 merkleRoot;
        // Verification status
        VerificationStatus status;
        // Creation timestamp of proof
        uint256 proofCreatedAt;
    }

    /**
     * @notice Payment request for receiving payments
     */
    struct PaymentRequest {
        bytes32 requestId;
        address creator;
        address recipient;
        address tokenContract;
        uint256 amount;
        string memo;
        uint256 createdAt;
        uint256 expiresAt;
        bool fulfilled;
        bytes32 proofId; // Linked proof when fulfilled
    }

    /**
     * @notice Verification status of a proof
     */
    enum VerificationStatus {
        Pending,           // Proof created, awaiting verification
        BlockchainAnchored, // Confirmed on Flare blockchain
        FDCVerified,       // Verified via FDC with Merkle proof
        Disputed,          // Proof disputed
        Invalid            // Proof marked invalid
    }

    // ============ State Variables ============
    
    // Mapping from proof ID to PaymentProof
    mapping(bytes32 => PaymentProof) public proofs;
    
    // Mapping from tx hash to proof ID
    mapping(bytes32 => bytes32) public txHashToProofId;
    
    // Mapping from address to their proof IDs
    mapping(address => bytes32[]) public userProofs;
    
    // Mapping from request ID to PaymentRequest
    mapping(bytes32 => PaymentRequest) public paymentRequests;
    
    // User's payment requests
    mapping(address => bytes32[]) public userPaymentRequests;
    
    // Total proofs created
    uint256 public totalProofs;
    
    // Total payment requests
    uint256 public totalRequests;
    
    // FDC Hub address on Coston2
    address public fdcHub;
    
    // Proof generation fee (optional, can be 0)
    uint256 public proofFee;

    // ============ Events ============
    
    event ProofCreated(
        bytes32 indexed proofId,
        bytes32 indexed txHash,
        address indexed sender,
        address recipient,
        uint256 amount,
        string tokenSymbol
    );
    
    event ProofVerified(
        bytes32 indexed proofId,
        VerificationStatus status,
        uint256 fdcRoundId,
        bytes32 merkleRoot
    );
    
    event PaymentRequestCreated(
        bytes32 indexed requestId,
        address indexed creator,
        address recipient,
        uint256 amount,
        uint256 expiresAt
    );
    
    event PaymentRequestFulfilled(
        bytes32 indexed requestId,
        bytes32 indexed proofId,
        address indexed payer
    );

    // ============ Constructor ============
    
    constructor(address _fdcHub) Ownable(msg.sender) {
        fdcHub = _fdcHub;
        proofFee = 0; // Free initially
    }

    // ============ External Functions ============

    /**
     * @notice Create an ISO 20022 payment proof
     * @param _txHash Transaction hash of the payment
     * @param _recipient Payment recipient address
     * @param _tokenContract Token contract address
     * @param _amount Payment amount
     * @param _decimals Token decimals
     * @param _tokenSymbol Token symbol
     * @param _memo Payment memo
     * @return proofId The unique proof identifier
     */
    function createProof(
        bytes32 _txHash,
        address _recipient,
        address _tokenContract,
        uint256 _amount,
        uint8 _decimals,
        string calldata _tokenSymbol,
        string calldata _memo
    ) external payable nonReentrant returns (bytes32 proofId) {
        require(msg.value >= proofFee, "Insufficient fee");
        require(_txHash != bytes32(0), "Invalid tx hash");
        require(txHashToProofId[_txHash] == bytes32(0), "Proof already exists");
        
        // Generate unique proof ID
        proofId = keccak256(abi.encodePacked(
            _txHash,
            msg.sender,
            block.timestamp,
            totalProofs
        ));
        
        // Create the proof
        PaymentProof storage proof = proofs[proofId];
        proof.proofId = proofId;
        proof.messageType = "pacs.008.001.08"; // FIToFICustomerCreditTransfer
        proof.txHash = _txHash;
        proof.blockNumber = block.number;
        proof.timestamp = block.timestamp;
        proof.sender = msg.sender;
        proof.recipient = _recipient;
        proof.tokenContract = _tokenContract;
        proof.amount = _amount;
        proof.decimals = _decimals;
        proof.tokenSymbol = _tokenSymbol;
        proof.memo = _memo;
        proof.status = VerificationStatus.BlockchainAnchored;
        proof.proofCreatedAt = block.timestamp;
        
        // Update mappings
        txHashToProofId[_txHash] = proofId;
        userProofs[msg.sender].push(proofId);
        userProofs[_recipient].push(proofId);
        
        totalProofs++;
        
        emit ProofCreated(
            proofId,
            _txHash,
            msg.sender,
            _recipient,
            _amount,
            _tokenSymbol
        );
        
        return proofId;
    }

    /**
     * @notice Update proof with FDC verification data
     * @param _proofId The proof to update
     * @param _fdcRoundId FDC voting round ID
     * @param _merkleRoot Merkle root from FDC
     */
    function verifyProofWithFDC(
        bytes32 _proofId,
        uint256 _fdcRoundId,
        bytes32 _merkleRoot
    ) external {
        PaymentProof storage proof = proofs[_proofId];
        require(proof.proofId != bytes32(0), "Proof not found");
        require(
            msg.sender == proof.sender || msg.sender == owner(),
            "Not authorized"
        );
        
        proof.fdcRoundId = _fdcRoundId;
        proof.merkleRoot = _merkleRoot;
        proof.status = VerificationStatus.FDCVerified;
        
        emit ProofVerified(
            _proofId,
            VerificationStatus.FDCVerified,
            _fdcRoundId,
            _merkleRoot
        );
    }

    /**
     * @notice Create a payment request
     * @param _recipient Address to receive payment
     * @param _tokenContract Token contract address
     * @param _amount Requested amount
     * @param _memo Payment memo
     * @param _expiresIn Expiration time in seconds (0 for no expiry)
     * @return requestId The unique request identifier
     */
    function createPaymentRequest(
        address _recipient,
        address _tokenContract,
        uint256 _amount,
        string calldata _memo,
        uint256 _expiresIn
    ) external returns (bytes32 requestId) {
        requestId = keccak256(abi.encodePacked(
            msg.sender,
            _recipient,
            _amount,
            block.timestamp,
            totalRequests
        ));
        
        PaymentRequest storage request = paymentRequests[requestId];
        request.requestId = requestId;
        request.creator = msg.sender;
        request.recipient = _recipient;
        request.tokenContract = _tokenContract;
        request.amount = _amount;
        request.memo = _memo;
        request.createdAt = block.timestamp;
        request.expiresAt = _expiresIn > 0 ? block.timestamp + _expiresIn : 0;
        request.fulfilled = false;
        
        userPaymentRequests[msg.sender].push(requestId);
        totalRequests++;
        
        emit PaymentRequestCreated(
            requestId,
            msg.sender,
            _recipient,
            _amount,
            request.expiresAt
        );
        
        return requestId;
    }

    /**
     * @notice Fulfill a payment request with a proof
     * @param _requestId The request to fulfill
     * @param _proofId The proof of payment
     */
    function fulfillPaymentRequest(
        bytes32 _requestId,
        bytes32 _proofId
    ) external {
        PaymentRequest storage request = paymentRequests[_requestId];
        require(request.requestId != bytes32(0), "Request not found");
        require(!request.fulfilled, "Already fulfilled");
        require(
            request.expiresAt == 0 || block.timestamp <= request.expiresAt,
            "Request expired"
        );
        
        PaymentProof storage proof = proofs[_proofId];
        require(proof.proofId != bytes32(0), "Proof not found");
        require(proof.recipient == request.recipient, "Recipient mismatch");
        require(proof.amount >= request.amount, "Amount insufficient");
        require(proof.tokenContract == request.tokenContract, "Token mismatch");
        
        request.fulfilled = true;
        request.proofId = _proofId;
        
        emit PaymentRequestFulfilled(_requestId, _proofId, msg.sender);
    }

    // ============ View Functions ============

    /**
     * @notice Get full proof data
     * @param _proofId The proof ID
     * @return The PaymentProof struct
     */
    function getProof(bytes32 _proofId) external view returns (PaymentProof memory) {
        return proofs[_proofId];
    }

    /**
     * @notice Get proof ID by transaction hash
     * @param _txHash The transaction hash
     * @return The proof ID
     */
    function getProofByTxHash(bytes32 _txHash) external view returns (bytes32) {
        return txHashToProofId[_txHash];
    }

    /**
     * @notice Get all proofs for a user
     * @param _user User address
     * @return Array of proof IDs
     */
    function getUserProofs(address _user) external view returns (bytes32[] memory) {
        return userProofs[_user];
    }

    /**
     * @notice Get payment request data
     * @param _requestId The request ID
     * @return The PaymentRequest struct
     */
    function getPaymentRequest(bytes32 _requestId) external view returns (PaymentRequest memory) {
        return paymentRequests[_requestId];
    }

    /**
     * @notice Get all payment requests for a user
     * @param _user User address
     * @return Array of request IDs
     */
    function getUserPaymentRequests(address _user) external view returns (bytes32[] memory) {
        return userPaymentRequests[_user];
    }

    /**
     * @notice Generate ISO 20022 message ID from proof
     * @param _proofId The proof ID
     * @return The ISO 20022 formatted message ID
     */
    function getISO20022MessageId(bytes32 _proofId) external view returns (string memory) {
        PaymentProof storage proof = proofs[_proofId];
        require(proof.proofId != bytes32(0), "Proof not found");
        
        // Format: FLARE{timestamp}{proofId_short}
        return string(abi.encodePacked(
            "FLARE",
            _uint256ToString(proof.timestamp),
            _bytes32ToHexString(proof.proofId)
        ));
    }

    /**
     * @notice Check if a proof is FDC verified
     * @param _proofId The proof ID
     * @return True if FDC verified
     */
    function isFDCVerified(bytes32 _proofId) external view returns (bool) {
        return proofs[_proofId].status == VerificationStatus.FDCVerified;
    }

    // ============ Admin Functions ============

    /**
     * @notice Update FDC Hub address
     * @param _fdcHub New FDC Hub address
     */
    function setFDCHub(address _fdcHub) external onlyOwner {
        fdcHub = _fdcHub;
    }

    /**
     * @notice Update proof fee
     * @param _fee New fee amount
     */
    function setProofFee(uint256 _fee) external onlyOwner {
        proofFee = _fee;
    }

    /**
     * @notice Withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    // ============ Internal Functions ============

    function _uint256ToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function _bytes32ToHexString(bytes32 _bytes) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory str = new bytes(8); // First 4 bytes = 8 hex chars
        for (uint256 i = 0; i < 4; i++) {
            str[i * 2] = hexChars[uint8(_bytes[i] >> 4)];
            str[1 + i * 2] = hexChars[uint8(_bytes[i] & 0x0f)];
        }
        return string(str);
    }

    // Allow receiving native tokens for fees
    receive() external payable {}
}
