const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Crowdsale', () => {
  let token, crowdsale, owner, user1, user2

  beforeEach(async () => {
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('DApp U', 'DAPP', 18, 1000000)
    
    const Crowdsale = await ethers.getContractFactory('Crowdsale')
    crowdsale = await Crowdsale.deploy(token.address, ether(.5))

    const accounts = await ethers.getSigners()
    owner = accounts[0].address
    user1 = accounts[1]
    user2 = accounts[2].address

    token.transfer(crowdsale.address, tokens(1000000))
  })

  describe('Deployment', () => {

    it('sets the owner', async () => {
      expect(await crowdsale.owner()).to.equal(owner)
    })

    it('fetches the token', async () => {
      expect(await crowdsale.token()).to.equal(token.address)
    })

    it('sets the price', async () => {
      expect(await crowdsale.price()).to.equal(ether(.5))
    })

  })

  describe('Buying Tokens', () => {

    describe('Success', () => {

      beforeEach(async () => {
        await crowdsale.connect(user1).buyTokens(tokens(1), { value: ether(.5) })
      })

      it('transfers tokens to the buyer', async () => {
        expect(await token.balanceOf(user1.address)).to.equal(tokens(1))
        expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(999999))
      })

      it('updates contract\'s ETH balance', async () => {
        expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(ether(.5))
      })

      it('increases the tokens sold', async () => {
        expect(await crowdsale.tokensSold()).to.equal(tokens(1))
      })

      it('emits a tokens bought event', async () => {
        await expect(crowdsale.connect(user1).buyTokens(tokens(1), { value: ether(.5) })).to.emit(crowdsale, 'TokensBought').withArgs(user1.address, tokens(1))
      })

    })

    describe('Failure', () => {
      it('rejects insufficient ETH amounts', async () => {
        await expect(crowdsale.connect(user1).buyTokens(tokens(2), { value: ether(.5) })).to.be.reverted
      })

    })

  })  

  describe('Sending ETH', () => {

    beforeEach(async () => {
      await user1.sendTransaction({ to: crowdsale.address, value: ether(.5) })
    })

    it('updates contract\'s ETH balance', async () => {
      expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(ether(.5))
    })

    it('transfers tokens to the buyer', async () => {
      expect(await token.balanceOf(user1.address)).to.equal(tokens(1))
    })

  })

  describe('Finalize Sale', () => {

    describe('Success', () => {
      
      beforeEach(async () => {
        await crowdsale.connect(user1).buyTokens(tokens(1), { value: ether(.5) })
        await crowdsale.finalizeSale()
      })

      it('sends remaining tokens to owner', async () => {
        expect(await token.balanceOf(owner)).to.equal(tokens(999999))
      })

      it('sends ETH to owner', async () => {
        balanceBefore = await ethers.provider.getBalance(owner)
        expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(ether(0))
      })

    })

    describe('Failure', () => {
      it('rejects calls not from owner', async () => {
        await expect(crowdsale.connect(user1).finalizeSale()).to.be.reverted
      })

    })

  })

})
