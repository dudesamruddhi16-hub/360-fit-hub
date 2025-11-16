import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Container, Navbar, Nav, Button } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import TrainerHome from '../Trainer/TrainerHome'
import MyClients from '../Trainer/MyClients'
import WorkoutPlans from '../Trainer/WorkoutPlans'
import DietPlans from '../Trainer/DietPlans'

const TrainerDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [expanded, setExpanded] = useState(false)

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
          <Navbar.Brand><i className="bi bi-dumbbell"></i> Trainer Portal</Navbar.Brand>
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
              <Nav.Link active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); navigate('/trainer'); setExpanded(false) }}>
                <i className="bi bi-speedometer2"></i> <span>Dashboard</span>
              </Nav.Link>
              <Nav.Link active={activeTab === 'clients'} onClick={() => { setActiveTab('clients'); navigate('/trainer/clients'); setExpanded(false) }}>
                <i className="bi bi-people"></i> <span>My Clients</span>
              </Nav.Link>
              <Nav.Link active={activeTab === 'workouts'} onClick={() => { setActiveTab('workouts'); navigate('/trainer/workouts'); setExpanded(false) }}>
                <i className="bi bi-activity"></i> <span>Workout Plans</span>
              </Nav.Link>
              <Nav.Link active={activeTab === 'diets'} onClick={() => { setActiveTab('diets'); navigate('/trainer/diets'); setExpanded(false) }}>
                <i className="bi bi-cup-hot"></i> <span>Diet Plans</span>
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
          <Route path="/" element={<TrainerHome />} />
          <Route path="/clients" element={<MyClients />} />
          <Route path="/workouts" element={<WorkoutPlans />} />
          <Route path="/diets" element={<DietPlans />} />
          <Route path="*" element={<Navigate to="/trainer" replace />} />
        </Routes>
      </Container>
    </div>
  )
}

export default TrainerDashboard



