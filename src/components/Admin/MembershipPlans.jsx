import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap'
import { membershipPlansService } from '../../services'
import { normalizeItem } from '../../utils/helpers'

const MembershipPlans = () => {
  const [plans, setPlans] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    features: ''
  })
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const allPlans = await membershipPlansService.getAll()
      setPlans(normalizeItem(allPlans))
    } catch (error) {
      setPlans([])
    }
  }

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant })
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000)
  }

  const handleAdd = () => {
    setEditingPlan(null)
    setFormData({ name: '', price: '', duration: '', features: '' })
    setShowModal(true)
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name || '',
      price: plan.price || '',
      duration: plan.duration || '',
      features: Array.isArray(plan.features) ? plan.features.join(', ') : plan.features || ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      const planData = {
        name: formData.name,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      }

      if (editingPlan) {
        const planId = editingPlan.id || editingPlan._id
        await membershipPlansService.update(planId, planData)
        addToast('Plan updated successfully')
      } else {
        await membershipPlansService.create(planData)
        addToast('Plan added successfully')
      }
      setShowModal(false)
      loadPlans()
    } catch (error) {
      addToast('Error saving plan', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await membershipPlansService.delete(id)
        addToast('Plan deleted successfully')
        loadPlans()
      } catch (error) {
        addToast('Error deleting plan', 'danger')
      }
    }
  }

  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Membership Plans</h4>
          <Button variant="primary" onClick={handleAdd}>
            <i className="bi bi-plus-circle"></i> Add Plan
          </Button>
        </Card.Header>
        <Card.Body>
          {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price (&#8377;)</th>
                <th>Duration (days)</th>
                <th>Features</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id}>
                  <td><strong>{plan.name}</strong></td>
                  <td>&#8377;{plan.price}</td>
                  <td>{plan.duration} days</td>
                  <td>
                    {Array.isArray(plan.features) ? plan.features.map((f, i) => (
                      <Badge key={i} bg="secondary" className="me-1">{f}</Badge>
                    )) : plan.features}
                  </td>
                  <td>
                    <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(plan)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(plan.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingPlan ? 'Edit Plan' : 'Add Plan'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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
              <Form.Label>Price ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Duration (days)</Form.Label>
              <Form.Control
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Features (comma separated)</Form.Label>
              <Form.Control
                type="text"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Gym Access, Personal Trainer, Nutrition Plan"
              />
            </Form.Group>
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

export default MembershipPlans



