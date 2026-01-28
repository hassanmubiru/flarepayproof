// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaymentProcessor
 * @notice Handles token payments and automatically creates proofs
 * @dev Integrates with FlarePayProof for on-chain proof generation
 */

interface IFlarePayProof {
    function createProof(
        bytes32 _txHash,
        address _recipient,
        address _tokenContract,
        uint256 _amount,
        uint8 _decimals,
        string calldata _tokenSymbol,
        string calldata _memo
    ) external payable returns (bytes32 proofId);
}

contract PaymentProcessor is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // FlarePayProof contract
    IFlarePayProof public flarePayProof;
    
    // Supported tokens
    mapping(address => bool) public supportedTokens;
    mapping(address => TokenInfo) public tokenInfo;
    
    struct TokenInfo {
        string symbol;
        uint8 decimals;
        bool active;
    }

    // Payment record
    struct Payment {
        bytes32 paymentId;
        address sender;
        address recipient;
        address tokenContract;
        uint256 amount;
        string memo;
        uint256 timestamp;
        bytes32 proofId;
    }
    
    // Payments by ID
    mapping(bytes32 => Payment) public payments;
    
    // User payments
    mapping(address => bytes32[]) public userPayments;
    
    // Total payments
    uint256 public totalPayments;

    // Events
    event PaymentProcessed(
        bytes32 indexed paymentId,
        address indexed sender,
        address indexed recipient,
        address tokenContract,
        uint256 amount,
        bytes32 proofId
    );
    
    event TokenAdded(address indexed token, string symbol, uint8 decimals);
    event TokenRemoved(address indexed token);

    constructor(address _flarePayProof) {
        flarePayProof = IFlarePayProof(_flarePayProof);
    }

    /**
     * @notice Process a token payment with automatic proof generation
     * @param _recipient Payment recipient
     * @param _tokenContract Token to send
     * @param _amount Amount to send
     * @param _memo Payment memo
     * @return paymentId The payment ID
     * @return proofId The generated proof ID
     */
    function processPayment(
        address _recipient,
        address _tokenContract,
        uint256 _amount,
        string calldata _memo
    ) external nonReentrant returns (bytes32 paymentId, bytes32 proofId) {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be > 0");
        require(supportedTokens[_tokenContract], "Token not supported");
        
        TokenInfo memory info = tokenInfo[_tokenContract];
        
        // Transfer tokens
        IERC20(_tokenContract).safeTransferFrom(msg.sender, _recipient, _amount);
        
        // Generate payment ID (simulated tx hash for on-chain payments)
        paymentId = keccak256(abi.encodePacked(
            msg.sender,
            _recipient,
            _tokenContract,
            _amount,
            block.timestamp,
            totalPayments
        ));
        
        // Create proof on FlarePayProof contract
        proofId = flarePayProof.createProof(
            paymentId, // Using payment ID as tx hash for contract payments
            _recipient,
            _tokenContract,
            _amount,
            info.decimals,
            info.symbol,
            _memo
        );
        
        // Store payment
        Payment storage payment = payments[paymentId];
        payment.paymentId = paymentId;
        payment.sender = msg.sender;
        payment.recipient = _recipient;
        payment.tokenContract = _tokenContract;
        payment.amount = _amount;
        payment.memo = _memo;
        payment.timestamp = block.timestamp;
        payment.proofId = proofId;
        
        // Update user payments
        userPayments[msg.sender].push(paymentId);
        userPayments[_recipient].push(paymentId);
        
        totalPayments++;
        
        emit PaymentProcessed(
            paymentId,
            msg.sender,
            _recipient,
            _tokenContract,
            _amount,
            proofId
        );
        
        return (paymentId, proofId);
    }

    /**
     * @notice Add a supported token
     * @param _token Token address
     * @param _symbol Token symbol
     * @param _decimals Token decimals
     */
    function addToken(
        address _token,
        string calldata _symbol,
        uint8 _decimals
    ) external {
        supportedTokens[_token] = true;
        tokenInfo[_token] = TokenInfo({
            symbol: _symbol,
            decimals: _decimals,
            active: true
        });
        
        emit TokenAdded(_token, _symbol, _decimals);
    }

    /**
     * @notice Remove a supported token
     * @param _token Token address
     */
    function removeToken(address _token) external {
        supportedTokens[_token] = false;
        tokenInfo[_token].active = false;
        
        emit TokenRemoved(_token);
    }

    /**
     * @notice Get payment details
     * @param _paymentId Payment ID
     * @return The Payment struct
     */
    function getPayment(bytes32 _paymentId) external view returns (Payment memory) {
        return payments[_paymentId];
    }

    /**
     * @notice Get user's payments
     * @param _user User address
     * @return Array of payment IDs
     */
    function getUserPayments(address _user) external view returns (bytes32[] memory) {
        return userPayments[_user];
    }

    /**
     * @notice Update FlarePayProof contract address
     * @param _flarePayProof New contract address
     */
    function setFlarePayProof(address _flarePayProof) external {
        flarePayProof = IFlarePayProof(_flarePayProof);
    }
}
