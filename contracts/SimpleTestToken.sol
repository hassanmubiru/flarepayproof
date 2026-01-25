// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleTestToken
 * @dev Simple ERC20 token for testing on Flare Coston2 testnet
 * This is a basic implementation for testing purposes only
 */
contract SimpleTestToken {
    string public name = "Test USDT";
    string public symbol = "TUSDT";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * 10**decimals;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
    
    // Faucet function for easy testing - anyone can mint tokens
    function faucet(uint256 amount) public {
        uint256 mintAmount = amount * 10**decimals;
        totalSupply += mintAmount;
        balanceOf[msg.sender] += mintAmount;
        emit Transfer(address(0), msg.sender, mintAmount);
    }
}
