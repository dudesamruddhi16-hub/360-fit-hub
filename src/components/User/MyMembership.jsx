import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { membershipsService, membershipPlansService } from '../../services'
import { normalizeItem } from '../../utils/helpers'
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
    if (user?.id) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      const userId = user?.id || user?._id
      if (!userId) {
        console.error('User ID not available')
        return
      }

      const memberships = await membershipsService.query('userId', userId)
      const normalized = normalizeItem(memberships)
      
      // Get all plans to fetch price if missing from membership
      const allPlans = await membershipPlansService.getAll()
      const normalizedPlans = normalizeItem(allPlans)
      
      // Only show active memberships (status: 'active' and not expired)
      let activeMembership = normalized.find(m => {
        if (m.status !== 'active') return false
        if (!m.endDate) return false
        return new Date(m.endDate) > new Date()
      })
      
      // If no active membership, show pending membership
      if (!activeMembership) {
        activeMembership = normalized.find(m => m.status === 'pending')
      }
      
      // If price is missing, fetch it from the plan
      if (activeMembership && (!activeMembership.price || activeMembership.price === 0) && activeMembership.planId) {
        const plan = normalizedPlans.find(p => {
          const planId = p.id || p._id
          const membershipPlanId = activeMembership.planId
          return String(planId) === String(membershipPlanId)
        })
        if (plan) {
          activeMembership.price = plan.price
          activeMembership.planName = activeMembership.planName || plan.name
        }
      }
      
      setMembership(activeMembership)
      setPlans(normalizedPlans)
    } catch (error) {
      console.error('Error loading data:', error)
      showAlert('Error loading membership data', 'danger')
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
      // Find plan by id (can be string from MongoDB _id or number)
      const plan = plans.find(p => {
        const planId = p.id || p._id
        const selectedId = selectedPlan
        return String(planId) === String(selectedId) || planId === selectedId
      })
      
      if (!plan) {
        showAlert('Plan not found', 'danger')
        return
      }

      // Get the actual plan ID (handle both _id and id)
      const planId = plan.id || plan._id
      const userId = user.id || user._id

      if (!userId) {
        showAlert('User ID not found. Please login again.', 'danger')
        return
      }

      // Create membership with pending status - will be activated after payment
      const membershipData = {
        userId: userId,
        planId: planId,
        planName: plan.name,
        price: plan.price,
        startDate: null, // Will be set after payment
        endDate: null, // Will be set after payment
        status: 'pending', // Pending until payment is completed
        createdAt: new Date().toISOString()
      }

      await membershipsService.create(membershipData)

      showAlert('Plan selected! Please complete payment to activate your membership.')
      setShowModal(false)
      setSelectedPlan('')
      // Redirect to payment page
      setTimeout(() => {
        navigate('/user/payment')
      }, 1500)
      loadData()
    } catch (error) {
      console.error('Subscription error:', error)
      const errorMessage = error.message || 'Error subscribing to plan'
      showAlert(errorMessage, 'danger')
    }
  }

  const getPlanName = (planId) => {
    const plan = plans.find(p => p.id === planId || p._id === planId)
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
                    <td>
                      {membership.price !== undefined && membership.price !== null 
                        ? `₹${Number(membership.price).toFixed(2)}` 
                        : '₹0.00'}
                    </td>
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
            {plans.map(plan => {
              const planId = plan.id || plan._id
              return (
                <div key={planId} className="col-md-4 mb-3">
                  <Card>
                    <Card.Header className="text-center">
                      <h5>{plan.name}</h5>
                      <h3 className="text-primary">
                        {plan.price !== undefined && plan.price !== null 
                          ? `₹${Number(plan.price).toFixed(2)}` 
                          : '₹0.00'}
                      </h3>
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
                            setSelectedPlan(planId)
                            setShowModal(true)
                          }}
                        >
                          Subscribe
                        </Button>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              )
            })}
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
                {plans.map(p => {
                  const planId = p.id || p._id
                  return (
                    <option key={planId} value={planId}>
                      {p.name} - ₹{p.price !== undefined && p.price !== null ? Number(p.price).toFixed(2) : '0.00'} ({p.duration} days)
                    </option>
                  )
                })}
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



