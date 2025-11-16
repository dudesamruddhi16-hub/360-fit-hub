import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { getAllItems, addItem, queryByIndex, STORES } from '../../db/indexedDB'

const MyClients = () => {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' })

  useEffect(() => {
    loadClients()
    loadAllUsers()
  }, [])

  const loadClients = async () => {
    try {
      const assignments = await queryByIndex(STORES.TRAINER_ASSIGNMENTS, 'trainerId', user.id)
      const users = await getAllItems(STORES.USERS)
      const clientIds = assignments.map(a => a.userId)
      const clientUsers = users.filter(u => clientIds.includes(u.id))
      setClients(clientUsers)
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const loadAllUsers = async () => {
    try {
      const users = await getAllItems(STORES.USERS)
      const userMembers = users.filter(u => u.role === 'user')
      setAllUsers(userMembers)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant })
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000)
  }

  const handleAssign = async () => {
    if (!selectedUserId) {
      showAlert('Please select a user', 'danger')
      return
    }

    try {
      // Check if already assigned
      const existing = await queryByIndex(STORES.TRAINER_ASSIGNMENTS, 'trainerId', user.id)
      if (existing.some(a => a.userId === parseInt(selectedUserId))) {
        showAlert('User is already assigned to you', 'warning')
        return
      }

      await addItem(STORES.TRAINER_ASSIGNMENTS, {
        trainerId: user.id,
        userId: parseInt(selectedUserId),
        assignedDate: new Date().toISOString()
      })
      showAlert('Client assigned successfully')
      setShowModal(false)
      setSelectedUserId('')
      loadClients()
    } catch (error) {
      showAlert('Error assigning client', 'danger')
    }
  }

  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">My Clients</h4>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-circle"></i> Assign Client
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
                <th>Age</th>
                <th>Weight (kg)</th>
                <th>Height (cm)</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No clients assigned</td>
                </tr>
              ) : (
                clients.map(client => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone || '-'}</td>
                    <td>{client.age || '-'}</td>
                    <td>{client.weight || '-'}</td>
                    <td>{client.height || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select User</Form.Label>
              <Form.Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
              >
                <option value="">Choose a user...</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAssign}>Assign</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default MyClients



