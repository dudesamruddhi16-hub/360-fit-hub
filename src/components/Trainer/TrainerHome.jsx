import React, { useState, useEffect } from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { getAllItems, queryByIndex, STORES } from '../../db/indexedDB'

const TrainerHome = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalClients: 0,
    activeWorkouts: 0,
    activeDiets: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const assignments = await queryByIndex(STORES.TRAINER_ASSIGNMENTS, 'trainerId', user.id)
      const workouts = await queryByIndex(STORES.WORKOUT_PLANS, 'trainerId', user.id)
      const diets = await queryByIndex(STORES.DIET_PLANS, 'trainerId', user.id)
      
      setStats({
        totalClients: assignments.length,
        activeWorkouts: workouts.length,
        activeDiets: diets.length
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  return (
    <div>
      <div className="hero-section">
        <h1>Welcome, {user?.name}</h1>
        <p>Manage your clients and create personalized fitness plans</p>
      </div>
      <Row>
        <Col md={4}>
          <Card className="stats-card">
            <Card.Body>
              <h3>{stats.totalClients}</h3>
              <p><i className="bi bi-people"></i> Total Clients</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stats-card">
            <Card.Body>
              <h3>{stats.activeWorkouts}</h3>
              <p><i className="bi bi-activity"></i> Active Workout Plans</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stats-card">
            <Card.Body>
              <h3>{stats.activeDiets}</h3>
              <p><i className="bi bi-cup-hot"></i> Active Diet Plans</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default TrainerHome



