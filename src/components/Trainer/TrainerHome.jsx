import React, { useState, useEffect } from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { trainerAssignmentsService, workoutPlansService, dietPlansService, usersService } from '../../services'

const TrainerHome = () => {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [stats, setStats] = useState({
    totalClients: 0,
    activeWorkouts: 0,
    activeDiets: 0
  })
  const [showWorkoutModal, setShowWorkoutModal] = useState(false)
  const [showDietModal, setShowDietModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [planData, setPlanData] = useState({ name: '', description: '', items: [] })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const assignments = await trainerAssignmentsService.query('trainerId', user.id)
      const workouts = await workoutPlansService.query('trainerId', user.id)
      const diets = await dietPlansService.query('trainerId', user.id)

      setStats({
        totalClients: assignments.length,
        activeWorkouts: workouts.length,
        activeDiets: diets.length
      })

      // Fetch client details
      if (assignments.length > 0) {
        const clientPromises = assignments.map(a => usersService.getById(a.userId))
        const clientList = await Promise.all(clientPromises)
        setClients(clientList)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleCreatePlan = (client, type) => {
    setSelectedClient(client)
    setPlanData({ name: '', description: '', items: [] })
    if (type === 'workout') setShowWorkoutModal(true)
    else setShowDietModal(true)
  }

  const submitPlan = async () => {
    try {
      const commonData = {
        userId: selectedClient._id || selectedClient.id,
        trainerId: user.id,
        name: planData.name,
        description: planData.description
      }

      if (showWorkoutModal) {
        await workoutPlansService.create({ ...commonData, exercises: planData.items })
      } else {
        await dietPlansService.create({ ...commonData, meals: planData.items })
      }

      setShowWorkoutModal(false)
      setShowDietModal(false)
      loadData() // Refresh stats
      alert('Plan created successfully!')
    } catch (error) {
      console.error('Error creating plan:', error)
      alert('Failed to create plan')
    }
  }

  return (
    <div>
      <div className="hero-section">
        <h1>Welcome, {user?.name}</h1>
        <p>Manage your clients and create personalized fitness plans</p>
      </div>

      {/* Stats Row */}
      <Row className="mb-4">
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

      {/* Clients List */}
      <h3 className="mb-3">My Clients</h3>
      <Row>
        {clients.length > 0 ? (
          clients.map(client => (
            <Col key={client.id} md={6} lg={4} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>{client.name}</Card.Title>
                  <Card.Text>
                    <strong>Email:</strong> {client.email}<br />
                    <strong>Goal:</strong> {client.goal || 'General Fitness'}
                  </Card.Text>
                  <div className="d-grid gap-2">
                    <button className="btn btn-primary btn-sm" onClick={() => handleCreatePlan(client, 'workout')}>
                      Assign Workout Plan
                    </button>
                    <button className="btn btn-success btn-sm" onClick={() => handleCreatePlan(client, 'diet')}>
                      Assign Diet Plan
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <p className="text-muted">No clients assigned yet.</p>
          </Col>
        )}
      </Row>

      {/* Simple Modal Implementation (Inline for brevity, ideally separate component) */}
      {(showWorkoutModal || showDietModal) && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create {showWorkoutModal ? 'Workout' : 'Diet'} Plan for {selectedClient?.name}</h5>
                <button type="button" className="btn-close" onClick={() => { setShowWorkoutModal(false); setShowDietModal(false) }}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Plan Name</label>
                  <input type="text" className="form-control" value={planData.name} onChange={e => setPlanData({ ...planData, name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" value={planData.description} onChange={e => setPlanData({ ...planData, description: e.target.value })} />
                </div>
                {/* Simplified items input for prototype */}
                <div className="mb-3">
                  <label className="form-label">{showWorkoutModal ? 'Exercises (comma separated)' : 'Meals (comma separated)'}</label>
                  <input type="text" className="form-control" placeholder="Item 1, Item 2..." onChange={e => setPlanData({ ...planData, items: e.target.value.split(',') })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowWorkoutModal(false); setShowDietModal(false) }}>Close</button>
                <button type="button" className="btn btn-primary" onClick={submitPlan}>Save Plan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainerHome



