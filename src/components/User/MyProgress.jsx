import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { progressService } from '../../services'
import { normalizeItem } from '../../utils/helpers'
import MyProgressGraph from './MyProgressGraph' 

const MyProgress = () => {
  const { user } = useAuth()
  const [progress, setProgress] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    muscleMass: '',
    notes: ''
  })
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' })

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    try {
      const userProgress = await progressService.query('userId', user.id)
      const normalized = normalizeItem(userProgress)
      setProgress(normalized.sort((a, b) => new Date(b.date) - new Date(a.date)))
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant })
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000)
  }

  const handleAdd = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      bodyFat: '',
      muscleMass: '',
      notes: ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      await progressService.create({
        userId: user.id,
        date: formData.date,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
        muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : null,
        notes: formData.notes,
        createdAt: new Date().toISOString()
      })
      showAlert('Progress entry added successfully')
      setShowModal(false)
      loadProgress()
    } catch (error) {
      showAlert('Error saving progress', 'danger')
    }
  }

  const userId = user.id || (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user'))
      return u?.id || u?._id || ''
    } catch (e) {
      return ''
    }
  })()

  if (!userId) return <div>Please login to view progress.</div>

  return (
    <div>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Progress Tracking</h4>
          <Button variant="primary" onClick={handleAdd}>
            <i className="bi bi-plus-circle"></i> Add Entry
          </Button>
        </Card.Header>
        <Card.Body>
          {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}
          {progress.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No progress entries yet. Start tracking your fitness journey!</p>
            </div>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight (kg)</th>
                  <th>Body Fat (%)</th>
                  <th>Muscle Mass (kg)</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {progress.map(entry => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                    <td>{entry.weight || '-'}</td>
                    <td>{entry.bodyFat ? `${entry.bodyFat}%` : '-'}</td>
                    <td>{entry.muscleMass || '-'}</td>
                    <td>{entry.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Progress Tracking</h5>
          <small className="text-muted">{userId ? 'Your progress overview' : 'Not signed in'}</small>
        </div>
      </Card.Header>
      <Card.Body>
        {userId
          ? <MyProgressGraph userId={userId} />
          : <div>Please sign in to view your progress.</div>
        }
      </Card.Body>
    </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Progress Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Weight (kg)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g., 70.5"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Body Fat (%)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                value={formData.bodyFat}
                onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                placeholder="e.g., 15.5"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Muscle Mass (kg)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                value={formData.muscleMass}
                onChange={(e) => setFormData({ ...formData, muscleMass: e.target.value })}
                placeholder="e.g., 55.0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes about your progress..."
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

export default MyProgress



