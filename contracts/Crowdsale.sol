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

    event TokensBought(address indexed buyer, uint256 amount);

    modifier onlyOwner {
        require(msg.sender == owner, 'You are not the owner');
        _;
    }

    constructor(Token _token, uint256 _price, uint256 _totalSupply) {
        owner = msg.sender;
        token = _token;
        price = _price;
        totalSupply = _totalSupply;
    }

    receive() external payable {
        uint256 amount = msg.value / price;
        buyTokens(amount * 1e18);
    }

    function buyTokens(uint256 _amount) public payable {
        require(msg.value == (_amount / 1e18) * price, 'Incorrect token or ETH amounts');

        require(token.transfer(msg.sender, _amount), 'Token transfer error');
        tokensSold += _amount;

        emit TokensBought(msg.sender, _amount);
    }

    function finalizeSale() external onlyOwner {
        require(token.transfer(owner, token.balanceOf(address(this))));
        
        (bool sent, ) = owner.call{ value: address(this).balance }('');
        require(sent, 'ETH not received from contract');
    }

}
