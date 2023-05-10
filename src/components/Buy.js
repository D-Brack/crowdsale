import { useState } from 'react'
import { ethers } from 'ethers'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Spinner from 'react-bootstrap/Spinner'

const Buy = ({ provider, crowdsale, price, setIsLoading, isWhitelisted, minBuy, maxBuy }) => {

  const [amount, setAmount] = useState(0)
  const [isWaiting, setIsWaiting] = useState(false)

  const buyHandler = async (e) => {
    e.preventDefault()

    if(amount < minBuy) {
      window.alert(`Minimum buy amount (${minBuy} tokens) not met`)
      return
    }
    
    if(amount > maxBuy) {
      window.alert(`Maximum buy amount (${maxBuy} tokens) exceeded`)
      return
    }
    
    setIsWaiting(true)

    try {
      const cost = ethers.utils.parseUnits((amount * price).toString(), 'ether')
      const formattedAmount = ethers.utils.parseUnits(amount.toString(), 'ether')
  
      const signer = await provider.getSigner()
      const transaction = await crowdsale.connect(signer).buyTokens(formattedAmount, { value: cost })
      await transaction.wait()
        
    } catch {
      window.alert('User canceled or transaction reverted')
    }

    setIsLoading(true)
  }

  return (
    <Form onSubmit={buyHandler} style={{ maxWidth: '800px', margin: '50px auto' }} >
      <Form.Group as={Row}>
        <Col>
          <div> 
              {isWhitelisted ? (
                <Form.Control type="number" placeholder="Enter Amount" onChange={(e) => setAmount(e.target.value)} />
              ) : (
                <Form.Control type="number" placeholder="Enter Amount" onChange={(e) => setAmount(e.target.value)} disabled />
              )}
          </div>
        </Col>
        <Col className='text-center'>
          {isWaiting ? (            
            <Spinner animation="border" variant="info" />
          ) : (
            <div>  
              {isWhitelisted ? (
                <Button type="submit" variant="primary" style={{ width: '100%' }} >Buy Tokens</Button>
              ) : (
                <Button type="submit" variant="secondary" style={{ width: '100%' }} disabled >NOT WHITELISTED</Button>
              )}
            </div>
          )}
        </Col>
      </Form.Group>
    </Form>
  )
}

export default Buy
