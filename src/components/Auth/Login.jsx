import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Card, Form, Button } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      // Navigation will happen in useEffect
    } else {
      addToast(result.error || 'Login failed', 'danger')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <Card.Header className="auth-card-header">
          <i className="bi bi-dumbbell"></i>
          <h2>Gym Management</h2>
          <p className="mb-0 mt-2" style={{ opacity: 0.9, fontSize: '0.9rem' }}>Welcome Back!</p>
        </Card.Header>
        <Card.Body className="auth-card-body">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ fontSize: '1rem' }}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ fontSize: '1rem' }}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading} style={{ fontSize: '1rem', padding: '0.875rem' }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Logging in...</> : 'Login'}
            </Button>
          </Form>
          <div className="text-center">
            <p className="mb-2" style={{ color: '#666' }}>
              Don't have an account? <Link to="/signup" style={{ color: '#D4AF37', fontWeight: '600', textDecoration: 'none' }}>Sign up here</Link>
            </p>
            {/* <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <small style={{ color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Demo Credentials:</small>
              <small style={{ color: '#888', fontSize: '0.8rem', lineHeight: '1.8' }}>
                Admin: admin@gym.com / admin123<br />
                Trainer: trainer@gym.com / trainer123<br />
                User: user@gym.com / user123
              </small>
            </div> */}
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Login



