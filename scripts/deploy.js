// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory('Token')
  const token = await Token.deploy('DApp U', 'DAPP', 18, 1000000)
  await token.deployed()

  const Crowdsale = await hre.ethers.getContractFactory('Crowdsale')
  const crowdsale = await Crowdsale.deploy(token.address, hre.ethers.utils.parseUnits('0.025', 'ether'), token.totalSupply())
  await crowdsale.deployed()

  console.log(`Token deployed at: ${token.address}\n`)
  console.log(`Crowdsale deployed at: ${crowdsale.address}\n`)

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
