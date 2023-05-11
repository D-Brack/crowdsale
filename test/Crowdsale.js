const { queryHelpers } = require('@testing-library/react')
const { expect } = require('chai')
const { ethers } = require('hardhat')
const { time } = require('@nomicfoundation/hardhat-network-helpers')
const { ltime } = require('lodash')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Crowdsale', () => {
  let token, crowdsale, owner, user1, user2, price, ethAmount, maxSupply, tokenAmount, minBuy, maxBuy, startTime

  describe('Base Tests', () => {

    beforeEach(async () => {
      price = ether(.5)
      ethAmount = price
      maxSupply = 1000000
      tokenAmount = tokens(1)
      minBuy = tokens(.5)
      maxBuy = tokens(5)
      startTime = 1683694800

      const Token = await ethers.getContractFactory('Token')
      token = await Token.deploy('DApp U', 'DAPP', 18, maxSupply)
      
      const Crowdsale = await ethers.getContractFactory('Crowdsale')
      crowdsale = await Crowdsale.deploy(token.address, price, token.totalSupply(), minBuy, maxBuy, startTime)

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

      it('sets the minimum buy amount', async () => {
        expect(await crowdsale.minBuy()).to.equal(minBuy)
      })

      it('sets the maximum buy amount', async () => {
        expect(await crowdsale.maxBuy()).to.equal(maxBuy)
      })

      it('sets a start date', async () => {
        expect(await crowdsale.startTime()).to.exist
      })

      it('adds owner to whitelist', async () => {
        expect(await crowdsale.whitelist(owner)).to.equal(true)
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

        it('rejects minimum buy restrictions', async () => {
          await expect(crowdsale.buyTokens(tokenAmount.div(10), { value: price.div(10) })).to.be.reverted
        })

        it('rejects maximum buy limitations', async () => {
          await expect(crowdsale.buyTokens(tokenAmount.mul(10), { value: price.mul(10) })).to.be.reverted
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

      describe('Failure', () => {

        it('rejects calls not from owner', async () => {
          await expect(crowdsale.connect(user1).setPrice(ether(.25))).to.be.reverted
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

    describe('Adding to Whitelist', () => {

      describe('Success', () => {
        it('adds new address to whitelist', async () => {
          await crowdsale.addToWhitelist(user1.address)
          expect(await crowdsale.whitelist(user1.address)).to.equal(true)
        })
      })

      describe('Failure', () => {

        it('rejects calls not from owner', async () => {
          await expect(crowdsale.connect(user1).finalizeSale()).to.be.reverted
        })

        it('rejects invalid whitelist addresses', async () => {
          await expect(crowdsale.addToWhitelist('0x0000000000000000000000000000000000000000')).to.be.reverted
        })

      })

    })

  })

  describe('Time Test', () => {
    
    beforeEach(async () => {
      price = ether(.5)
      ethAmount = price
      maxSupply = 1000000
      tokenAmount = tokens(1)
      minBuy = tokens(.5)
      maxBuy = tokens(5)
      startTime = 1783694800

      const Token = await ethers.getContractFactory('Token')
      token = await Token.deploy('DApp U', 'DAPP', 18, maxSupply)
      
      const Crowdsale = await ethers.getContractFactory('Crowdsale')
      crowdsale = await Crowdsale.deploy(token.address, price, token.totalSupply(), minBuy, maxBuy, startTime)

      const accounts = await ethers.getSigners()
      owner = accounts[0].address
      user1 = accounts[1]

      maxSupply = tokens(1000000)
      token.transfer(crowdsale.address, maxSupply)
    })

    describe('Start Date', () => {

      it('prevents buying tokens before start date', async () => {
        await expect(crowdsale.connect(user1).buyTokens(tokenAmount, { value: price })).to.be.reverted
      })

      it('allows token sales after start date', async () => {
        await time.increaseTo(1783694800 + 10000)
        await expect(crowdsale.connect(user1).buyTokens(tokenAmount, { value: price })).to.be.fulfilled
      })

    })

  })

})
