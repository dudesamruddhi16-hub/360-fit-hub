import React, { useState, useEffect } from 'react'
import { Card, Row, Col, ProgressBar } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { getAllItems, queryByIndex, STORES } from '../../db/indexedDB'

const UserHome = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    hasMembership: false,
    hasTrainer: false,
    hasWorkout: false,
    hasDiet: false,
    progressEntries: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const memberships = await queryByIndex(STORES.MEMBERSHIPS, 'userId', user.id)
      // Only check for active memberships (status: 'active' and not expired)
      const activeMembership = memberships.find(m => {
        if (m.status !== 'active') return false
        if (!m.endDate) return false
        return new Date(m.endDate) > new Date()
      })

      const assignments = await queryByIndex(STORES.TRAINER_ASSIGNMENTS, 'userId', user.id)
      const workouts = await queryByIndex(STORES.WORKOUT_PLANS, 'userId', user.id)
      const diets = await queryByIndex(STORES.DIET_PLANS, 'userId', user.id)
      const progress = await queryByIndex(STORES.PROGRESS, 'userId', user.id)

      setStats({
        hasMembership: !!activeMembership,
        hasTrainer: assignments.length > 0,
        hasWorkout: workouts.length > 0,
        hasDiet: diets.length > 0,
        progressEntries: progress.length
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  return (
    <div>
      <div className="hero-section">
        <h1>Welcome, {user?.name}!</h1>
        <p>Your fitness journey starts here</p>
      </div>
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Membership Status</h5>
            </Card.Header>
            <Card.Body>
              {stats.hasMembership ? (
                <div>
                  <p className="text-success"><i className="bi bi-check-circle"></i> Active Membership</p>
                </div>
              ) : (
                <div>
                  <p className="text-warning"><i className="bi bi-exclamation-triangle"></i> No Active Membership</p>
                  <p className="text-muted">Please subscribe to a membership plan to access all features.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Personal Trainer</h5>
            </Card.Header>
            <Card.Body>
              {stats.hasTrainer ? (
                <p className="text-success"><i className="bi bi-check-circle"></i> Assigned to Trainer</p>
              ) : (
                <p className="text-muted">No trainer assigned yet</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Workout Plan</h5>
            </Card.Header>
            <Card.Body>
              {stats.hasWorkout ? (
                <p className="text-success"><i className="bi bi-check-circle"></i> Active Workout Plan</p>
              ) : (
                <p className="text-muted">No workout plan assigned</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Diet Plan</h5>
            </Card.Header>
            <Card.Body>
              {stats.hasDiet ? (
                <p className="text-success"><i className="bi bi-check-circle"></i> Active Diet Plan</p>
              ) : (
                <p className="text-muted">No diet plan assigned</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Progress Tracking</h5>
            </Card.Header>
            <Card.Body>
              <p>Total Progress Entries: <strong>{stats.progressEntries}</strong></p>
              <p className="text-muted">Track your fitness journey and see your improvements over time.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default UserHome



