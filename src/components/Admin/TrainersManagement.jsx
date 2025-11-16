import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap'
import { getAllItems, addItem, updateItem, deleteItem, STORES, queryByIndex } from '../../db/indexedDB'

const TrainersManagement = () => {
  const [trainers, setTrainers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    experience: ''
  })
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' })

  useEffect(() => {
    loadTrainers()
  }, [])

  const loadTrainers = async () => {
    try {
      const users = await getAllItems(STORES.USERS)
      const trainerUsers = users.filter(u => u.role === 'trainer')
      setTrainers(trainerUsers)
    } catch (error) {
      showAlert('Error loading trainers', 'danger')
    }
  }

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant })
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000)
  }

  const handleAdd = () => {
    setEditingTrainer(null)
    setFormData({ name: '', email: '', password: '', phone: '', specialization: '', experience: '' })
    setShowModal(true)
  }

  const handleEdit = (trainer) => {
    setEditingTrainer(trainer)
    setFormData({
      name: trainer.name || '',
      email: trainer.email || '',
      password: '',
      phone: trainer.phone || '',
      specialization: trainer.specialization || '',
      experience: trainer.experience || ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingTrainer) {
        const updated = { ...editingTrainer, ...formData }
        if (!formData.password) {
          delete updated.password
        }
        await updateItem(STORES.USERS, updated)
        showAlert('Trainer updated successfully')
      } else {
        const existing = await queryByIndex(STORES.USERS, 'email', formData.email)
        if (existing.length > 0) {
          showAlert('Email already exists', 'danger')
          return
        }
        await addItem(STORES.USERS, {
          ...formData,
          role: 'trainer',
          createdAt: new Date().toISOString()
        })
        showAlert('Trainer added successfully')
      }
      setShowModal(false)
      loadTrainers()
    } catch (error) {
      showAlert('Error saving trainer', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        await deleteItem(STORES.USERS, id)
        showAlert('Trainer deleted successfully')
        loadTrainers()
      } catch (error) {
        showAlert('Error deleting trainer', 'danger')
      }
    }
  }

  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Trainers Management</h4>
          <Button variant="primary" onClick={handleAdd}>
            <i className="bi bi-plus-circle"></i> Add Trainer
          </Button>
        </Card.Header>
        <Card.Body>
          {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map(trainer => (
                <tr key={trainer.id}>
                  <td>{trainer.name}</td>
                  <td>{trainer.email}</td>
                  <td>{trainer.phone || '-'}</td>
                  <td>{trainer.specialization || '-'}</td>
                  <td>{trainer.experience || '-'}</td>
                  <td>
                    <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(trainer)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(trainer.id)}>
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
          <Modal.Title>{editingTrainer ? 'Edit Trainer' : 'Add Trainer'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!editingTrainer}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password {editingTrainer && '(leave blank to keep current)'}</Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingTrainer}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Specialization</Form.Label>
              <Form.Control
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Experience</Form.Label>
              <Form.Control
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g., 5 years"
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

export default TrainersManagement



