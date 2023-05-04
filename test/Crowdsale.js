const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = (n) => {
  return ethers.parseUnits(n, 'ether')
}

describe('Crowdsale', () => {
  let token, crowdsale, owner, user1, user2

  beforeEach(async () => {
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('DApp U', 'DAPP', 18, 1000000)
    
    const Crowdsale = await ethers.getContractFactory('Crowdsale')
    crowdsale = await Crowdsale.deploy(token.address)

    const accounts = await ethers.getSigners()
    owner = accounts[0].address
    user1 = accounts[1].address
    user2 = accounts[2].address
  })

  describe('Deployment', () => {

    it('sets the owner', async () => {
      expect(await crowdsale.owner()).to.equal(owner)
    })

    it('fetches the token', async () => {
      expect(await crowdsale.token()).to.equal(token.address)
    })

  })

})
