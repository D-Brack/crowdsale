// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const parseUnits = (n) => {
  return hre.ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {

  //Deploy token
  const Token = await hre.ethers.getContractFactory('Token')
  const token = await Token.deploy('DApp U', 'DAPP', 18, 1000000)
  await token.deployed()

  //Deploy crowdsale
  const Crowdsale = await hre.ethers.getContractFactory('Crowdsale')
  const crowdsale = await Crowdsale.deploy(token.address, parseUnits(.025), token.totalSupply(), parseUnits(100), parseUnits(100000), 1683961827)
  await crowdsale.deployed()

  //Log deployment
  console.log(`Token deployed at: ${token.address}\n`)
  console.log(`Crowdsale deployed at: ${crowdsale.address}\n`)

  //Transfer tokens to crowdsale
  const transaction = await token.transfer(crowdsale.address, token.totalSupply())
  await transaction.wait()
  console.log("Tokens transfered to crowdsale contract")
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
