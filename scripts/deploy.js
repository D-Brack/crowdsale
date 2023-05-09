// // We require the Hardhat Runtime Environment explicitly here. This is optional
// // but useful for running the script in a standalone fashion through `node <script>`.
// //
// // You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// // will compile your contracts, add the Hardhat Runtime Environment's members to the
// // global scope, and execute the script.
// const hre = require("hardhat");

// async function main() {
//   const Token = await hre.ethers.getContractFactory('Token')
//   const token = await Token.deploy('DApp U', 'DAPP', 18, 1000000)
//   await token.deployed()

//   const Crowdsale = await hre.ethers.getContractFactory('Crowdsale')
//   const crowdsale = await Crowdsale.deploy(token.address, hre.ethers.utils.parseUnits('0.025', 'ether'), hre.ethers.utils.parseUnits('1000000', 'ether'))
//   await crowdsale.deployed()

//   console.log(`Token deployed at: ${token.address}\n`)
//   console.log(`Crowdsale deployed at: ${crowdsale.address}`)

//   const transaction = await token.transfer(crowdsale.address, token.totalSupply(), ethers.utils.parseUnits('1000000', 'ether'))
//   await transaction.wait()

//   console.log(await ethers.utils.parseUnits(token.balanceOf(crowdsale.address)))
//   console.log(await crowdsale.totalSupply())
// }

// // We recommend this pattern to be able to use async/await everywhere
// // and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const NAME = 'Dapp University'
  const SYMBOL = 'DAPP'
  const MAX_SUPPLY = '1000000'
  const PRICE = ethers.utils.parseUnits('0.025', 'ether')

  // Deploy Token
  const Token = await hre.ethers.getContractFactory("Token")
  const token = await Token.deploy(NAME, SYMBOL, 18, MAX_SUPPLY)
  await token.deployed()

  console.log(`Token deployed to: ${token.address}\n`)

  // Deploy Crowdsale
  const Crowdsale = await hre.ethers.getContractFactory("Crowdsale")
  const crowdsale = await Crowdsale.deploy(token.address, PRICE, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'))
  await crowdsale.deployed();

  console.log(`Crowdsale deployed to: ${crowdsale.address}\n`)

  const transaction = await token.transfer(crowdsale.address, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'))
  await transaction.wait()

  console.log(`Tokens transferred to Crowdsale\n`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
