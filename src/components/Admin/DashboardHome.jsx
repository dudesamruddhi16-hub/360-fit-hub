import React, { useState, useEffect } from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import { getAllItems, STORES } from '../../db/indexedDB'

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalTrainers: 0,
    totalRevenue: 0,
    activeMemberships: 0
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const users = await getAllItems(STORES.USERS)
        const members = users.filter(u => u.role === 'user')
        const trainers = users.filter(u => u.role === 'trainer')
        const memberships = await getAllItems(STORES.MEMBERSHIPS)
        const payments = await getAllItems(STORES.PAYMENTS)
        
        const revenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
        const activeMemberships = memberships.filter(m => {
          if (!m.endDate) return false
          return new Date(m.endDate) > new Date()
        })

        setStats({
          totalMembers: members.length,
          totalTrainers: trainers.length,
          totalRevenue: revenue,
          activeMemberships: activeMemberships.length
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }
    loadStats()
  }, [])

  return (
    <div>
      <div className="hero-section">
        <h1>Admin Dashboard</h1>
        <p>Manage your gym operations efficiently</p>
      </div>
      <Row>
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body>
              <h3>{stats.totalMembers}</h3>
              <p><i className="bi bi-people"></i> Total Members</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body>
              <h3>{stats.totalTrainers}</h3>
              <p><i className="bi bi-person-badge"></i> Total Trainers</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body>
              <h3>${stats.totalRevenue.toFixed(2)}</h3>
              <p><i className="bi bi-currency-dollar"></i> Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body>
              <h3>{stats.activeMemberships}</h3>
              <p><i className="bi bi-check-circle"></i> Active Memberships</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardHome



