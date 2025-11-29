import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, Form, Button } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    weight: '',
    height: ''
  })
  const [loading, setLoading] = useState(false)
  const { signup, user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin')
      } else if (user.role === 'trainer') {
        navigate('/trainer')
      } else {
        navigate('/user')
      }
    }
  }, [user, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match', 'danger')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters long', 'danger')
      setLoading(false)
      return
    }

    const result = await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseInt(formData.height) : undefined
    })

    if (result.success) {
      addToast('Account created successfully! Redirecting...', 'success')
      // Navigation will happen in useEffect
    } else {
      addToast(result.error || 'Signup failed', 'danger')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <Card className="auth-card" style={{ maxWidth: '550px' }}>
        <Card.Header className="auth-card-header">
          <i className="bi bi-dumbbell"></i>
          <h2>Create Account</h2>
          <p className="mb-0 mt-2" style={{ opacity: 0.9, fontSize: '0.9rem' }}>Start Your Fitness Journey Today!</p>
        </Card.Header>
        <Card.Body className="auth-card-body">
          <Form onSubmit={handleSubmit}>

            <Form.Group className="mb-3">
              <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Age</Form.Label>
                  <Form.Control
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleChange}
                    min="1"
                    max="120"
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Weight (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="weight"
                    placeholder="Weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="1"
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Height (cm)</Form.Label>
                  <Form.Control
                    type="number"
                    name="height"
                    placeholder="Height"
                    value={formData.height}
                    onChange={handleChange}
                    min="1"
                  />
                </Form.Group>
              </div>
            </div>

            <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading} style={{ fontSize: '1rem', padding: '0.875rem' }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Creating Account...</> : 'Create Account'}
            </Button>
          </Form>

          <div className="text-center">
            <p className="mb-0" style={{ color: '#666' }}>
              Already have an account? <Link to="/login" style={{ color: '#D4AF37', fontWeight: '600', textDecoration: 'none' }}>Login here</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Signup

