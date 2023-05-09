import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'
import config from '../config.json'

import Navigation from './Navigation'
import Info from './Info'
import Loading from './Loading'
import Progress from './Progress'

import TOKEN_ABI from '../abis/Token.json'
import CROWDSALE_ABI from '../abis/Crowdsale.json'

function App() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)

  const [crowdsale, setCrowdsale] = useState(null)

  const [accountBalance, setAccountBalance] = useState(0)
  const [price, setPrice] = useState(0)
  const [tokensSold, setTokensSold] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {

    //Get privider info
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const { chainId } = await provider.getNetwork()

    //Initiate contracts
    const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider)
    const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, provider)
    setCrowdsale(crowdsale)

    //Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'})
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    //Fetch account balance
    const accountBalance = ethers.utils.formatUnits(await token.balanceOf(account), 18)
    setAccountBalance(accountBalance)

    //Fetch price
    const price = ethers.utils.formatUnits(await crowdsale.price(), 18)
    setPrice(price)

    //Fetch tokens sold
    const tokensSold = ethers.utils.formatUnits(await crowdsale.tokensSold(), 18)
    setTokensSold(tokensSold)

    //Fetch total supply
    const totalSupply = ethers.utils.formatUnits(await crowdsale.totalSupply(), 18)
    setTotalSupply(totalSupply)
    
    setIsLoading(false)
  }

  useEffect(() => {
    if(isLoading) {
      loadBlockchainData()
    }
  }, [isLoading])

  return (
    <Container>
      <Navigation />
      <h1 className="text-center">Introducing DApp Token!</h1>
      {isLoading ? (
        <p className='text-center'>Loading...</p>
      ) : (
        <div>
          <Loading price={price} />
          <Progress tokensSold={tokensSold} totalSupply={totalSupply} />
        </div>
      )}

      <hr />

      {account && (<Info account={account} accountBalance={accountBalance} />)}
    </Container>  
  )
}

export default App
