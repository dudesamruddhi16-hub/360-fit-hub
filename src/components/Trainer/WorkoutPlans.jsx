import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { getAllItems, addItem, updateItem, deleteItem, queryByIndex, STORES } from '../../db/indexedDB'

const WorkoutPlans = () => {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [clients, setClients] = useState([])
  const [exercises, setExercises] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState(null)
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    description: '',
    exercises: []
  })
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const allWorkouts = await queryByIndex(STORES.WORKOUT_PLANS, 'trainerId', user.id)
      setWorkouts(allWorkouts)

      const assignments = await queryByIndex(STORES.TRAINER_ASSIGNMENTS, 'trainerId', user.id)
      const allUsers = await getAllItems(STORES.USERS)
      const clientIds = assignments.map(a => a.userId)
      const clientUsers = allUsers.filter(u => clientIds.includes(u.id))
      setClients(clientUsers)

      const allExercises = await getAllItems(STORES.EXERCISES)
      setExercises(allExercises)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant })
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000)
  }

  const handleAdd = () => {
    setEditingWorkout(null)
    setFormData({ userId: '', name: '', description: '', exercises: [] })
    setShowModal(true)
  }

  const handleEdit = (workout) => {
    setEditingWorkout(workout)
    setFormData({
      userId: workout.userId || '',
      name: workout.name || '',
      description: workout.description || '',
      exercises: workout.exercises || []
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      const workoutData = {
        userId: parseInt(formData.userId),
        trainerId: user.id,
        name: formData.name,
        description: formData.description,
        exercises: formData.exercises,
        createdAt: editingWorkout ? editingWorkout.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (editingWorkout) {
        await updateItem(STORES.WORKOUT_PLANS, { ...editingWorkout, ...workoutData })
        showAlert('Workout plan updated successfully')
      } else {
        await addItem(STORES.WORKOUT_PLANS, workoutData)
        showAlert('Workout plan created successfully')
      }
      setShowModal(false)
      loadData()
    } catch (error) {
      showAlert('Error saving workout plan', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout plan?')) {
      try {
        await deleteItem(STORES.WORKOUT_PLANS, id)
        showAlert('Workout plan deleted successfully')
        loadData()
      } catch (error) {
        showAlert('Error deleting workout plan', 'danger')
      }
    }
  }

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { exerciseId: '', sets: '', reps: '', duration: '' }]
    })
  }

  const removeExercise = (index) => {
    const newExercises = formData.exercises.filter((_, i) => i !== index)
    setFormData({ ...formData, exercises: newExercises })
  }

  const updateExercise = (index, field, value) => {
    const newExercises = [...formData.exercises]
    newExercises[index] = { ...newExercises[index], [field]: value }
    setFormData({ ...formData, exercises: newExercises })
  }

  const getClientName = (userId) => {
    const client = clients.find(c => c.id === userId)
    return client ? client.name : 'Unknown'
  }

  const getExerciseName = (exerciseId) => {
    const exercise = exercises.find(e => e.id === exerciseId)
    return exercise ? exercise.name : 'Unknown'
  }

  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Workout Plans</h4>
          <Button variant="primary" onClick={handleAdd}>
            <i className="bi bi-plus-circle"></i> Create Plan
          </Button>
        </Card.Header>
        <Card.Body>
          {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Client</th>
                <th>Plan Name</th>
                <th>Description</th>
                <th>Exercises</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workouts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No workout plans created</td>
                </tr>
              ) : (
                workouts.map(workout => (
                  <tr key={workout.id}>
                    <td>{getClientName(workout.userId)}</td>
                    <td><strong>{workout.name}</strong></td>
                    <td>{workout.description || '-'}</td>
                    <td>
                      {workout.exercises?.length > 0 ? (
                        workout.exercises.map((ex, i) => (
                          <Badge key={i} bg="info" className="me-1">
                            {getExerciseName(ex.exerciseId)}
                          </Badge>
                        ))
                      ) : '-'}
                    </td>
                    <td>
                      <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(workout)}>
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(workout.id)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingWorkout ? 'Edit Workout Plan' : 'Create Workout Plan'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Client</Form.Label>
              <Form.Select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                required
                disabled={!!editingWorkout}
              >
                <option value="">Select client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Plan Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">Exercises</Form.Label>
                <Button variant="outline-primary" size="sm" onClick={addExercise}>
                  <i className="bi bi-plus"></i> Add Exercise
                </Button>
              </div>
              {formData.exercises.map((ex, index) => (
                <div key={index} className="border p-3 mb-2 rounded">
                  <div className="d-flex justify-content-between mb-2">
                    <strong>Exercise {index + 1}</strong>
                    <Button variant="outline-danger" size="sm" onClick={() => removeExercise(index)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                  <Form.Select
                    className="mb-2"
                    value={ex.exerciseId}
                    onChange={(e) => updateExercise(index, 'exerciseId', e.target.value)}
                  >
                    <option value="">Select exercise...</option>
                    {exercises.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.category})</option>
                    ))}
                  </Form.Select>
                  <div className="row">
                    <div className="col-md-4">
                      <Form.Control
                        type="number"
                        placeholder="Sets"
                        value={ex.sets}
                        onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <Form.Control
                        type="number"
                        placeholder="Reps"
                        value={ex.reps}
                        onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <Form.Control
                        type="number"
                        placeholder="Duration (min)"
                        value={ex.duration}
                        onChange={(e) => updateExercise(index, 'duration', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default WorkoutPlans



