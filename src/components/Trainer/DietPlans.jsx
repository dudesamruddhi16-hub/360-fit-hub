import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { dietPlansService, trainerAssignmentsService, usersService } from '../../services'
import { normalizeItem } from '../../utils/helpers'

const DietPlans = () => {
  const { user } = useAuth()
  const [diets, setDiets] = useState([])
  const [clients, setClients] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingDiet, setEditingDiet] = useState(null)
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    description: '',
    meals: []
  })
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const allDiets = await dietPlansService.query('trainerId', user.id)
      setDiets(normalizeItem(allDiets))

      const assignments = await trainerAssignmentsService.query('trainerId', user.id)
      const normalizedAssignments = normalizeItem(assignments)
      const allUsers = await usersService.getAll()
      const normalizedUsers = normalizeItem(allUsers)
      const clientIds = normalizedAssignments.map(a => a.userId)
      const clientUsers = normalizedUsers.filter(u => clientIds.includes(u.id) || clientIds.includes(u._id))
      setClients(clientUsers)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant })
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000)
  }

  const handleAdd = () => {
    setEditingDiet(null)
    setFormData({ userId: '', name: '', description: '', meals: [] })
    setShowModal(true)
  }

  const handleEdit = (diet) => {
    setEditingDiet(diet)
    setFormData({
      userId: diet.userId || '',
      name: diet.name || '',
      description: diet.description || '',
      meals: diet.meals || []
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      const dietData = {
        userId: parseInt(formData.userId),
        trainerId: user.id,
        name: formData.name,
        description: formData.description,
        meals: formData.meals,
        createdAt: editingDiet ? editingDiet.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (editingDiet) {
        const dietId = editingDiet.id || editingDiet._id
        await dietPlansService.update(dietId, dietData)
        showAlert('Diet plan updated successfully')
      } else {
        await dietPlansService.create(dietData)
        showAlert('Diet plan created successfully')
      }
      setShowModal(false)
      loadData()
    } catch (error) {
      showAlert('Error saving diet plan', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this diet plan?')) {
      try {
        await dietPlansService.delete(id)
        showAlert('Diet plan deleted successfully')
        loadData()
      } catch (error) {
        showAlert('Error deleting diet plan', 'danger')
      }
    }
  }

  const addMeal = () => {
    setFormData({
      ...formData,
      meals: [...formData.meals, { mealType: '', food: '', calories: '', time: '' }]
    })
  }

  const removeMeal = (index) => {
    const newMeals = formData.meals.filter((_, i) => i !== index)
    setFormData({ ...formData, meals: newMeals })
  }

  const updateMeal = (index, field, value) => {
    const newMeals = [...formData.meals]
    newMeals[index] = { ...newMeals[index], [field]: value }
    setFormData({ ...formData, meals: newMeals })
  }

  const getClientName = (userId) => {
    const client = clients.find(c => c.id === userId || c._id === userId)
    return client ? client.name : 'Unknown'
  }

  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Diet Plans</h4>
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
                <th>Meals</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {diets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No diet plans created</td>
                </tr>
              ) : (
                diets.map(diet => (
                  <tr key={diet.id}>
                    <td>{getClientName(diet.userId)}</td>
                    <td><strong>{diet.name}</strong></td>
                    <td>{diet.description || '-'}</td>
                    <td>{diet.meals?.length || 0} meals</td>
                    <td>
                      <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(diet)}>
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(diet.id)}>
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
          <Modal.Title>{editingDiet ? 'Edit Diet Plan' : 'Create Diet Plan'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Client</Form.Label>
              <Form.Select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                required
                disabled={!!editingDiet}
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
                <Form.Label className="mb-0">Meals</Form.Label>
                <Button variant="outline-primary" size="sm" onClick={addMeal}>
                  <i className="bi bi-plus"></i> Add Meal
                </Button>
              </div>
              {formData.meals.map((meal, index) => (
                <div key={index} className="border p-3 mb-2 rounded">
                  <div className="d-flex justify-content-between mb-2">
                    <strong>Meal {index + 1}</strong>
                    <Button variant="outline-danger" size="sm" onClick={() => removeMeal(index)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                  <Form.Select
                    className="mb-2"
                    value={meal.mealType}
                    onChange={(e) => updateMeal(index, 'mealType', e.target.value)}
                  >
                    <option value="">Select meal type...</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </Form.Select>
                  <Form.Control
                    className="mb-2"
                    type="text"
                    placeholder="Food items"
                    value={meal.food}
                    onChange={(e) => updateMeal(index, 'food', e.target.value)}
                  />
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Control
                        type="number"
                        placeholder="Calories"
                        value={meal.calories}
                        onChange={(e) => updateMeal(index, 'calories', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <Form.Control
                        type="time"
                        placeholder="Time"
                        value={meal.time}
                        onChange={(e) => updateMeal(index, 'time', e.target.value)}
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

export default DietPlans



