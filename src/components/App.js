import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'
import config from '../config.json'

import Navigation from './Navigation'
import Info from './Info'

import TOKEN_ABI from '../abis/Token.json'
import CROWDSALE_ABI from '../abis/Crowdsale.json'

function App() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const [token, setToken] = useState(null)
  const [crowdsale, setCrowdsale] = useState(null)

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
    setAccount(ethers.utils.getAddress(accounts[0]))
    
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
      <hr />
      {account && (<Info account={account} />)}
    </Container>  
  )
}

export default App
