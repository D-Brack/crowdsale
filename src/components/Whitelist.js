import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Spinner from 'react-bootstrap/Spinner'

const Whitelist = ({ provider, crowdsale, account, owner }) => {
  const [address, setAddress] = useState(null)

  const addToWhitelist = async (e) => {
    e.preventDefault()

    try {
      const signer = await provider.getSigner()
      const transaction = await crowdsale.connect(signer).addToWhitelist(address)
      await transaction.wait()

    } catch {
      window.alert('New address NOT added to Whitelist')
    }
  }

  return (
    <div>
      {account === owner ? (
        <div>
          <Form onSubmit={addToWhitelist} style={{ maxWidth: '800px', margin: '0px 50px 0px 0px' }}>
            <Form.Group as={Row} >
              <Col>
                <Form.Control className='text-left, border' placeholder='Enter Address' onChange={(e) => setAddress(e.target.value)} style={{ maxWidth: '500px' }} />
              </Col>
              <Col>
                <Button type='submit' >Add to Whitelist</Button>
              </Col>
            </Form.Group>
          </Form>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default Whitelist
