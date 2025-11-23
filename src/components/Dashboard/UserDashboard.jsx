import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Container, Navbar, Nav, Button } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import UserHome from '../User/UserHome'
import MyMembership from '../User/MyMembership'
import MyWorkouts from '../User/MyWorkouts'
import MyDiet from '../User/MyDiet'
import MyProgress from '../User/MyProgress'
import Payment from '../User/Payment'
import Chatbot from '../Chatbot/Chatbot'

const UserDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [expanded, setExpanded] = useState(false)

  const getActiveTab = (path) => {
    if (path === '/user') return 'dashboard'
    if (path.includes('/user/membership')) return 'membership'
    if (path.includes('/user/workouts')) return 'workouts'
    if (path.includes('/user/diet')) return 'diet'
    if (path.includes('/user/progress')) return 'progress'
    if (path.includes('/user/payment')) return 'payment'
    return 'dashboard'
  }

  const activeTab = getActiveTab(location.pathname)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <Navbar
        expand="lg"
        className="navbar"
        expanded={expanded}
        onToggle={setExpanded}
      >
        <Container fluid>
          <Navbar.Brand><i className="bi bi-dumbbell"></i> My Gym</Navbar.Brand>
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
            <Nav className="me-auto mobile-nav">
              <Nav.Link active={activeTab === 'dashboard'} onClick={() => { navigate('/user'); setExpanded(false) }}>
                <i className="bi bi-speedometer2"></i> <span>Dashboard</span>
              </Nav.Link>
              <Nav.Link active={activeTab === 'membership'} onClick={() => { navigate('/user/membership'); setExpanded(false) }}>
                <i className="bi bi-card-checklist"></i> <span>Membership</span>
              </Nav.Link>
              <Nav.Link active={activeTab === 'workouts'} onClick={() => { navigate('/user/workouts'); setExpanded(false) }}>
                <i className="bi bi-activity"></i> <span>Workouts</span>
              </Nav.Link>
              <Nav.Link active={activeTab === 'diet'} onClick={() => { navigate('/user/diet'); setExpanded(false) }}>
                <i className="bi bi-cup-hot"></i> <span>Diet Plan</span>
              </Nav.Link>
              <Nav.Link active={activeTab === 'progress'} onClick={() => { navigate('/user/progress'); setExpanded(false) }}>
                <i className="bi bi-graph-up"></i> <span>Progress</span>
              </Nav.Link>
              <Nav.Link active={activeTab === 'payment'} onClick={() => { navigate('/user/payment'); setExpanded(false) }}>
                <i className="bi bi-credit-card"></i> <span>Payment</span>
              </Nav.Link>
            </Nav>
            <Nav className="mobile-nav-buttons">
              <Navbar.Text className="me-3 mobile-welcome">Welcome, {user?.name}</Navbar.Text>
              <Button variant="outline-light" onClick={handleLogout} className="mb-2 mb-md-0">
                <i className="bi bi-box-arrow-right"></i> <span>Logout</span>
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid className="mt-4 px-3 px-md-4">
        <Routes>
          <Route path="/" element={<UserHome />} />
          <Route path="/membership" element={<MyMembership />} />
          <Route path="/workouts" element={<MyWorkouts />} />
          <Route path="/diet" element={<MyDiet />} />
          <Route path="/progress" element={<MyProgress />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="*" element={<Navigate to="/user" replace />} />
        </Routes>
      </Container>
      <Chatbot />
    </div>
  )
}

export default UserDashboard



