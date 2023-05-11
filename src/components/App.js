//Dependencies
import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'
import config from '../config.json'

//React Components
import Navigation from './Navigation'
import Info from './Info'
import Loading from './Loading'
import Progress from './Progress'
import Buy from './Buy'
import Whitelist from './Whitelist.js'

//ABIs
import TOKEN_ABI from '../abis/Token.json'
import CROWDSALE_ABI from '../abis/Crowdsale.json'

function App() {
  //State variables
  const [account, setAccount] = useState(null)
  const [isWhitelisted, setIsWhitelisted] = useState(false)

  const [provider, setProvider] = useState(null)
  const [crowdsale, setCrowdsale] = useState(null)
  const [owner, setOwner] = useState(null)

  const [accountBalance, setAccountBalance] = useState(0)
  const [price, setPrice] = useState(0)
  const [tokensSold, setTokensSold] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [minBuy, setMinBuy] = useState(0)
  const [maxBuy, setMaxBuy] = useState(0)
  const [startTime, setStartTime] = useState(0)

  const [isLoading, setIsLoading] = useState(true)

  const formatUnits = (n) => {
    return ethers.utils.formatUnits(n.toString(), 18)
  }

  window.ethereum.on('accountsChanged', () => {
    setIsLoading(true)
  })

  //Fetch and load data from the chain
  const loadBlockchainData = async () => {

    //Get privider info
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const { chainId } = await provider.getNetwork()

    //Initiate contracts
    const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider)
    const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, provider)
    setCrowdsale(crowdsale)

    //Fetch contract owner
    const owner = await crowdsale.owner()
    setOwner(owner)

    //Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'})
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    //Fetch account balance
    const accountBalance = formatUnits(await token.balanceOf(account))
    setAccountBalance(accountBalance)

    //Fetch account whitelist status
    const isWhitelisted = await crowdsale.whitelist(account)
    setIsWhitelisted(isWhitelisted)

    //Fetch price
    const price = formatUnits(await crowdsale.price())
    setPrice(price)

    //Fetch tokens sold
    const tokensSold = formatUnits(await crowdsale.tokensSold())
    setTokensSold(tokensSold)

    //Fetch total supply
    const totalSupply = formatUnits(await crowdsale.totalSupply())
    setTotalSupply(totalSupply)

    //Fetch mimimum buy amount
    const minBuy = formatUnits(await crowdsale.minBuy())
    setMinBuy(minBuy)

    //Fetch maximum buy amount
    const maxBuy = formatUnits(await crowdsale.maxBuy())
    setMaxBuy(maxBuy)

    //Fetch start time
    const startTime = await crowdsale.startTime()
    setStartTime(startTime)
    
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
      <h1 className="text-center my-4">Introducing DApp Token!</h1>
      {isLoading ? (
        <Loading />
      ) : (
        <div>
          <p className="text-center"><strong>Price:</strong> {price}</p>
          <Buy
            provider={provider}
            crowdsale={crowdsale}
            price={price}
            setIsLoading={setIsLoading}
            isWhitelisted={isWhitelisted}
            minBuy={minBuy}
            maxBuy={maxBuy}
            startTime={startTime}
          />
          <Progress tokensSold={tokensSold} totalSupply={totalSupply} />
        </div>
      )}

      <hr />

      {account && (<Info account={account} accountBalance={accountBalance} />)}
      <Whitelist account={account} owner={owner} provider={provider} crowdsale={crowdsale} />
    </Container>  
  )
}

export default App
