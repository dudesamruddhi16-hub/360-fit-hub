import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Container, Navbar, Nav, Button } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import MembersManagement from '../Admin/MembersManagement'
import MembershipPlans from '../Admin/MembershipPlans'
import TrainersManagement from '../Admin/TrainersManagement'
import PaymentsManagement from '../Admin/PaymentsManagement'
import DashboardHome from '../Admin/DashboardHome'
import TestimonialApproval from '../Admin/TestimonialApproval'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <Navbar
        expand="lg"
        className="navbar"
        expanded={expanded}
        onToggle={setExpanded}
      >
        <Container fluid>
          <Navbar.Brand><i className="bi bi-dumbbell"></i> Gym Admin</Navbar.Brand>
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
              <Nav.Link active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); navigate('/admin'); setExpanded(false) }}>
                <i className="bi bi-speedometer2"></i> <span>Dashboard</span>
              </Nav.Link>
              <Nav.Link active={activeTab === 'members'} onClick={() => { setActiveTab('members'); navigate('/admin/members'); setExpanded(false) }}>
                <i className="bi bi-people"></i> <span>Members</span>
              </Nav.Link>
              <Nav.Link active={activeTab === 'plans'} onClick={() => { setActiveTab('plans'); navigate('/admin/plans'); setExpanded(false) }}>
                <i className="bi bi-card-list"></i> <span>Membership Plans</span>
              </Nav.Link>
              <Nav.Link active={activeTab === 'trainers'} onClick={() => { setActiveTab('trainers'); navigate('/admin/trainers'); setExpanded(false) }}>
                <i className="bi bi-person-badge"></i> <span>Trainers</span>
              </Nav.Link>
              <Nav.Link active={activeTab === 'payments'} onClick={() => { setActiveTab('payments'); navigate('/admin/payments'); setExpanded(false) }}>
                <i className="bi bi-credit-card"></i> <span>Payments</span>
              </Nav.Link>
              <Nav.Link active={activeTab === 'testimonials'} onClick={() => { setActiveTab('testimonials'); navigate('/admin/testimonials'); setExpanded(false) }}>
                <i className="bi bi-chat-quote"></i> <span>Testimonials</span>
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
          <Route path="/" element={<DashboardHome />} />
          <Route path="/members" element={<MembersManagement />} />
          <Route path="/plans" element={<MembershipPlans />} />
          <Route path="/trainers" element={<TrainersManagement />} />
          <Route path="/payments" element={<PaymentsManagement />} />
          <Route path="/testimonials" element={<TestimonialApproval />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Container>
    </div>
  )
}

export default AdminDashboard



