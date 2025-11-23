import React, { useState } from 'react'
import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setExpanded(false)
  }

  const handleNavClick = (path) => {
    navigate(path)
    setExpanded(false)
  }

  return (
    <Navbar
      expand="lg"
      className="landing-header"
      fixed="top"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="landing-brand" onClick={() => setExpanded(false)}>
          <i className="bi bi-dumbbell"></i> 360 FIT HUB
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          aria-label="Toggle navigation"
          className="hamburger-toggle"
        >
          <span className="hamburger-icon"></span>
          <span className="hamburger-icon"></span>
          <span className="hamburger-icon"></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={location.pathname === '/'} onClick={() => setExpanded(false)}>Home</Nav.Link>
            <Nav.Link href="#programs" onClick={() => setExpanded(false)}>Programs</Nav.Link>
            <Nav.Link href="#about" onClick={() => setExpanded(false)}>About Us</Nav.Link>
            <Nav.Link href="#testimonials" onClick={() => setExpanded(false)}>Testimonials</Nav.Link>
            <Nav.Link href="#contact" onClick={() => setExpanded(false)}>Contact</Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            {user ? (
              <>
                <Navbar.Text className="me-3 d-none d-lg-block">
                  Welcome, {user.name}
                </Navbar.Text>
                <Button
                  variant="outline-light"
                  className="me-2 mb-2 mb-lg-0"
                  onClick={() => {
                    if (user.role === 'admin') handleNavClick('/admin')
                    else if (user.role === 'trainer') handleNavClick('/trainer')
                    else handleNavClick('/user')
                  }}
                >
                  Dashboard
                </Button>
                <Button variant="outline-light" onClick={handleLogout} className="mb-2 mb-lg-0">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline-light"
                  className="me-2 mb-2 mb-lg-0"
                  onClick={() => handleNavClick('/login')}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleNavClick('/signup')}
                  className="mb-2 mb-lg-0"
                >
                  Get Started
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header

