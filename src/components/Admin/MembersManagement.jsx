import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap'
import { usersService } from '../../services'
import { normalizeItem } from '../../utils/helpers'

const MembersManagement = () => {
  const [members, setMembers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    weight: '',
    height: ''
  })
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' })

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      const users = await usersService.getAll()
      const normalizedUsers = normalizeItem(users)
      const userMembers = normalizedUsers.filter(u => u.role === 'user')
      setMembers(userMembers)
    } catch (error) {
      showAlert('Error loading members', 'danger')
    }
  }

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant })
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000)
  }

  const handleAdd = () => {
    setEditingMember(null)
    setFormData({ name: '', email: '', password: '', phone: '', age: '', weight: '', height: '' })
    setShowModal(true)
  }

  const handleEdit = (member) => {
    setEditingMember(member)
    setFormData({
      name: member.name || '',
      email: member.email || '',
      password: '',
      phone: member.phone || '',
      age: member.age || '',
      weight: member.weight || '',
      height: member.height || ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingMember) {
        const memberId = editingMember.id || editingMember._id
        const updated = {
          ...formData,
          age: formData.age ? parseInt(formData.age) : undefined,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          height: formData.height ? parseInt(formData.height) : undefined
        }
        if (!formData.password) {
          delete updated.password
        }
        await usersService.update(memberId, updated)
        showAlert('Member updated successfully')
      } else {
        // Check if email already exists
        const existing = await usersService.query('email', formData.email)
        if (existing.length > 0) {
          showAlert('Email already exists', 'danger')
          return
        }
        await usersService.create({
          ...formData,
          role: 'user',
          age: formData.age ? parseInt(formData.age) : undefined,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          height: formData.height ? parseInt(formData.height) : undefined,
          createdAt: new Date().toISOString()
        })
        showAlert('Member added successfully')
      }
      setShowModal(false)
      loadMembers()
    } catch (error) {
      showAlert('Error saving member', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await usersService.delete(id)
        showAlert('Member deleted successfully')
        loadMembers()
      } catch (error) {
        showAlert('Error deleting member', 'danger')
      }
    }
  }

  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Members Management</h4>
          <Button variant="primary" onClick={handleAdd}>
            <i className="bi bi-plus-circle"></i> Add Member
          </Button>
        </Card.Header>
        <Card.Body>
          {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}
          <div className="table-responsive">
            <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Age</th>
                <th>Weight (kg)</th>
                <th>Height (cm)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.phone || '-'}</td>
                  <td>{member.age || '-'}</td>
                  <td>{member.weight || '-'}</td>
                  <td>{member.height || '-'}</td>
                  <td>
                    <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(member)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(member.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingMember ? 'Edit Member' : 'Add Member'}</Modal.Title>
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
                disabled={!!editingMember}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password {editingMember && '(leave blank to keep current)'}</Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingMember}
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
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Weight (kg)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Height (cm)</Form.Label>
              <Form.Control
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
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

export default MembersManagement



