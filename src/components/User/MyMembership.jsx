import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { getAllItems, addItem, queryByIndex, STORES } from '../../db/indexedDB'
import { useNavigate } from 'react-router-dom'

const MyMembership = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [membership, setMembership] = useState(null)
  const [plans, setPlans] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const memberships = await queryByIndex(STORES.MEMBERSHIPS, 'userId', user.id)
      // Only show active memberships (status: 'active' and not expired)
      const activeMembership = memberships.find(m => {
        if (m.status !== 'active') return false
        if (!m.endDate) return false
        return new Date(m.endDate) > new Date()
      })
      setMembership(activeMembership)

      const allPlans = await getAllItems('membershipPlans')
      setPlans(allPlans)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant })
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000)
  }

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      showAlert('Please select a plan', 'warning')
      return
    }

    try {
      const plan = plans.find(p => p.id === parseInt(selectedPlan))
      if (!plan) {
        showAlert('Plan not found', 'danger')
        return
      }

      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + plan.duration)

      // Create membership with pending status - will be activated after payment
      const membershipId = await addItem(STORES.MEMBERSHIPS, {
        userId: user.id,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        startDate: null, // Will be set after payment
        endDate: null, // Will be set after payment
        status: 'pending', // Pending until payment is completed
        createdAt: new Date().toISOString()
      })

      showAlert('Plan selected! Please complete payment to activate your membership.')
      setShowModal(false)
      // Redirect to payment page
      setTimeout(() => {
        navigate('/user/payment')
      }, 1500)
      loadData()
    } catch (error) {
      showAlert('Error subscribing to plan', 'danger')
    }
  }

  const getPlanName = (planId) => {
    const plan = plans.find(p => p.id === planId)
    return plan ? plan.name : 'Unknown'
  }

  return (
    <div>
      <Card>
        <Card.Header>
          <h4 className="mb-0">My Membership</h4>
        </Card.Header>
        <Card.Body>
          {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}
          {membership ? (
            <div>
              <Table striped bordered>
                <tbody>
                  <tr>
                    <th>Plan Name</th>
                    <td><strong>{membership.planName || getPlanName(membership.planId)}</strong></td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>
                      <Badge bg={membership.status === 'active' && new Date(membership.endDate) > new Date() ? 'success' : 'danger'}>
                        {membership.status === 'active' && new Date(membership.endDate) > new Date() ? 'Active' : membership.status === 'pending' ? 'Pending Payment' : 'Expired'}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <th>Start Date</th>
                    <td>
                      {membership.startDate 
                        ? new Date(membership.startDate).toLocaleDateString() 
                        : <span className="text-muted">Will be set after payment</span>}
                    </td>
                  </tr>
                  <tr>
                    <th>End Date</th>
                    <td>
                      {membership.endDate 
                        ? new Date(membership.endDate).toLocaleDateString() 
                        : <span className="text-muted">Will be set after payment</span>}
                    </td>
                  </tr>
                  <tr>
                    <th>Price</th>
                    <td>${membership.price?.toFixed(2) || '0.00'}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted mb-4">You don't have an active membership</p>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <i className="bi bi-plus-circle"></i> Subscribe to a Plan
              </Button>
              <div className="mt-3">
                <Button 
                  variant="outline-primary" 
                  onClick={() => navigate('/user/payment')}
                >
                  <i className="bi bi-credit-card"></i> Check Pending Payments
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Header>
          <h4 className="mb-0">Available Plans</h4>
        </Card.Header>
        <Card.Body>
          <div className="row">
            {plans.map(plan => (
              <div key={plan.id} className="col-md-4 mb-3">
                <Card>
                  <Card.Header className="text-center">
                    <h5>{plan.name}</h5>
                    <h3 className="text-primary">${plan.price}</h3>
                    <small className="text-muted">per {plan.duration} days</small>
                  </Card.Header>
                  <Card.Body>
                    <ul className="list-unstyled">
                      {Array.isArray(plan.features) ? plan.features.map((feature, i) => (
                        <li key={i} className="mb-2">
                          <i className="bi bi-check-circle text-success"></i> {feature}
                        </li>
                      )) : <li>{plan.features}</li>}
                    </ul>
                    {!membership && (
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={() => {
                          setSelectedPlan(plan.id)
                          setShowModal(true)
                        }}
                      >
                        Subscribe
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Subscribe to Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Plan</Form.Label>
              <Form.Select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                required
              >
                <option value="">Choose a plan...</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ${p.price} ({p.duration} days)
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {selectedPlan && (
              <div className="alert alert-info">
                <strong>Note:</strong> After subscribing, you'll be redirected to the payment page to complete your purchase.
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubscribe}>Subscribe</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default MyMembership



