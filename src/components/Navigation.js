import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import logo from '../logo.png'

const Navigation = () => {
  return (
      <Navbar>
        <img alt="logo" src={logo} height="40" width="40" className="d-inline-block align-top mx-3" />
        <Navbar.Brand href="#"> DApp ICO Crowdsale</Navbar.Brand>
      </Navbar> 
  )
}

export default Navigation
