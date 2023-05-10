const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Crowdsale', () => {
  let token, crowdsale, owner, user1, user2, price, ethAmount, maxSupply, tokenAmount

  beforeEach(async () => {
    price = ether(.5)
    ethAmount = price
    maxSupply = 1000000
    tokenAmount = tokens(1)

    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('DApp U', 'DAPP', 18, maxSupply)
    
    const Crowdsale = await ethers.getContractFactory('Crowdsale')
    crowdsale = await Crowdsale.deploy(token.address, price, token.totalSupply())

    const accounts = await ethers.getSigners()
    owner = accounts[0].address
    user1 = accounts[1]

    maxSupply = tokens(1000000)
    token.transfer(crowdsale.address, maxSupply)
  })

  describe('Deployment', () => {

    it('sets the owner', async () => {
      expect(await crowdsale.owner()).to.equal(owner)
    })

    it('fetches the token', async () => {
      expect(await crowdsale.token()).to.equal(token.address)
    })

    it('sets the price', async () => {
      expect(await crowdsale.price()).to.equal(price)
    })

    it('sets the total suply', async () => {
      expect(await crowdsale.totalSupply()).to.equal(maxSupply)
    })

  })

  describe('Buying Tokens', () => {

    describe('Success', () => {

      beforeEach(async () => {
        await crowdsale.connect(user1).buyTokens(tokenAmount, { value: price })
      })

      it('transfers tokens to the buyer', async () => {
        expect(await token.balanceOf(user1.address)).to.equal(tokenAmount)
        expect(await token.balanceOf(crowdsale.address)).to.equal(maxSupply.sub(tokenAmount))
      })

      it('updates contract\'s ETH balance', async () => {
        expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(price)
      })

      it('increases the tokens sold', async () => {
        expect(await crowdsale.tokensSold()).to.equal(tokenAmount)
      })

      it('emits a tokens bought event', async () => {
        await expect(crowdsale.connect(user1).buyTokens(tokenAmount, { value: price })).to.emit(crowdsale, 'TokensBought').withArgs(user1.address, tokenAmount)
      })

    })

    describe('Failure', () => {
      it('rejects insufficient ETH amounts', async () => {
        await expect(crowdsale.connect(user1).buyTokens(tokenAmount.mul(2), { value: price })).to.be.reverted
      })

    })

  })  

  describe('Sending ETH', () => {

    beforeEach(async () => {
      await user1.sendTransaction({ to: crowdsale.address, value: price })
    })

    it('updates contract\'s ETH balance', async () => {
      expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(price)
    })

    it('transfers tokens to the buyer', async () => {
      expect(await token.balanceOf(user1.address)).to.equal(tokenAmount)
      expect(await token.balanceOf(crowdsale.address)).to.equal(maxSupply.sub(tokenAmount))
    })

    it('increases the tokens sold', async () => {
      expect(await crowdsale.tokensSold()).to.equal(tokenAmount)
    })

    it('emits a tokens bought event', async () => {
      await expect(crowdsale.connect(user1).buyTokens(tokenAmount, { value: price })).to.emit(crowdsale, 'TokensBought').withArgs(user1.address, tokenAmount)
    })

  })

  describe('Setting Price', () => {
    describe('Success', () => {
      it('sets the correct price', async () => {
        const newPrice = ether(.25)
        await crowdsale.setPrice(newPrice)
        expect(await crowdsale.price()).to.equal(newPrice)
      })
    })
  })

  describe('Finalize Sale', () => {

    describe('Success', () => {
      
      beforeEach(async () => {
        await crowdsale.connect(user1).buyTokens(tokenAmount, { value: price })
        await crowdsale.finalizeSale()
      })

      it('sends remaining tokens to owner', async () => {
        expect(await token.balanceOf(owner)).to.equal(maxSupply.sub(tokenAmount))
      })

      it('sends ETH to owner', async () => {
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
