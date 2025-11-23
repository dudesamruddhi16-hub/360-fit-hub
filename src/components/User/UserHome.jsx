import React, { useState, useEffect } from 'react'
import { Card, Row, Col, ProgressBar, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { membershipsService, trainerAssignmentsService, workoutPlansService, dietPlansService, progressService, usersService } from '../../services'
import { normalizeItem } from '../../utils/helpers'
import VideoCall from '../VideoCall/VideoCall'

const UserHome = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    hasMembership: false,
    hasTrainer: false,
    hasWorkout: false,
    hasDiet: false,
    progressEntries: 0
  })
  const [trainer, setTrainer] = useState(null)
  const [videoCall, setVideoCall] = useState({ show: false, roomId: '', trainerName: '' })

  useEffect(() => {
    if (user?.id) {
      loadStats()
      loadTrainer()
    }
  }, [user])

  const loadTrainer = async () => {
    try {
      const assignments = await trainerAssignmentsService.query('userId', user.id)
      const normalizedAssignments = normalizeItem(assignments)
      if (normalizedAssignments.length > 0) {
        const trainers = await usersService.getAll()
        const normalizedTrainers = normalizeItem(trainers)
        const trainerData = normalizedTrainers.find(t => t.id === normalizedAssignments[0].trainerId && t.role === 'trainer')
        setTrainer(trainerData)
      }
    } catch (error) {
      console.error('Error loading trainer:', error)
    }
  }

  const handleVideoCall = () => {
    if (!trainer) return
    const roomId = `call-${trainer.id}-${user.id}`
    setVideoCall({
      show: true,
      roomId: roomId,
      trainerName: trainer.name
    })
  }

  const loadStats = async () => {
    try {
      const memberships = await membershipsService.query('userId', user.id)
      const normalizedMemberships = normalizeItem(memberships)
      // Only check for active memberships (status: 'active' and not expired)
      const activeMembership = normalizedMemberships.find(m => {
        if (m.status !== 'active') return false
        if (!m.endDate) return false
        return new Date(m.endDate) > new Date()
      })

      const assignments = await trainerAssignmentsService.query('userId', user.id)
      const workouts = await workoutPlansService.query('userId', user.id)
      const diets = await dietPlansService.query('userId', user.id)
      const progress = await progressService.query('userId', user.id)

      console.log('Memberships:', normalizedMemberships)
      console.log('Assignments:', assignments)
      console.log('Workouts:', workouts)
      console.log('Diets:', diets)
      console.log('Progress:', progress)
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
                <div>
                  <p className="text-success"><i className="bi bi-check-circle"></i> Active Workout Plan</p>
                  <Button variant="outline-primary" size="sm" onClick={() => navigate('/user/workouts')}>View Details</Button>
                </div>
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
                <div>
                  <p className="text-success"><i className="bi bi-check-circle"></i> Active Diet Plan</p>
                  <Button variant="outline-success" size="sm" onClick={() => navigate('/user/diet')}>View Details</Button>
                </div>
              ) : (
                <p className="text-muted">No diet plan assigned</p>
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
              {stats.hasTrainer && trainer ? (
                <div>
                  <p className="text-success"><i className="bi bi-check-circle"></i> Assigned to {trainer.name}</p>
                  <Button
                    variant="primary"
                    className="mt-2"
                    onClick={handleVideoCall}
                  >
                    <i className="bi bi-camera-video"></i> Call Trainer
                  </Button>
                </div>
              ) : (
                <p className="text-muted">No trainer assigned yet</p>
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
      {/* Video Call Modal */}
      <VideoCall
        show={videoCall.show}
        onClose={() => setVideoCall({ show: false, roomId: '', trainerName: '' })}
        roomId={videoCall.roomId}
        isInitiator={true}
        userName={user?.name}
        otherUserName={videoCall.trainerName}
      />
    </div>
  )
}

export default UserHome



