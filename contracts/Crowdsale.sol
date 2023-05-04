//SPDX-License-Identifier: ISC
pragma solidity ^0.8.0;

import "./Token.sol";

contract Crowdsale {
    address public owner;
    Token public token;

    constructor(Token _token) {
        owner = msg.sender;
        token = _token;
    }

}
