//SPDX-License-Identifier: ISC
pragma solidity ^0.8.0;

import "./Token.sol";
import "hardhat/console.sol";

contract Crowdsale {
    address public owner;
    Token public token;
    uint256 public price;
    uint256 public tokensSold;
    uint256 public totalSupply;
    uint256 public minBuy;
    uint256 public maxBuy;

    mapping(address => bool) public whitelist;

    event TokensBought(address indexed buyer, uint256 amount);

    modifier onlyOwner {
        require(msg.sender == owner, 'You are not the owner');
        _;
    }

    constructor(Token _token, uint256 _price, uint256 _totalSupply, uint256 _minBuy, uint256 _maxBuy) {
        owner = msg.sender;
        token = _token;
        price = _price;
        totalSupply = _totalSupply;
        minBuy = _minBuy;
        maxBuy = _maxBuy;

        whitelist[owner] = true;
    }

    receive() external payable {
        uint256 amount = msg.value / price;
        buyTokens(amount * 1e18);
    }

    function buyTokens(uint256 _amount) public payable {
        require(_amount >= minBuy, 'Minimum buy requirement not met');
        require(_amount <= maxBuy, 'Maximum buy amount exceeded');
        require(msg.value == (_amount / 1e18) * price, 'Incorrect token or ETH amounts');

        require(token.transfer(msg.sender, _amount), 'Token transfer error');
        tokensSold += _amount;

        emit TokensBought(msg.sender, _amount);
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    function finalizeSale() external onlyOwner {
        require(token.transfer(owner, token.balanceOf(address(this))));
        
        (bool sent, ) = owner.call{ value: address(this).balance }('');
        require(sent, 'ETH not received from contract');
    }

    function addToWhitelist(address _address) external onlyOwner {
        require(_address != address(0));
        whitelist[_address] = true;
    }

}
