import React, { useState, useEffect } from 'react'
import { Card, Table, Badge } from 'react-bootstrap'
import { paymentsService, usersService } from '../../services'
import { normalizeItem } from '../../utils/helpers'

const PaymentsManagement = () => {
  const [payments, setPayments] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const allPayments = await paymentsService.getAll()
      const normalizedPayments = normalizeItem(allPayments)
      const allUsers = await usersService.getAll()
      const normalizedUsers = normalizeItem(allUsers)
      setPayments(normalizedPayments.sort((a, b) => new Date(b.date) - new Date(a.date)))
      setUsers(normalizedUsers)
    } catch (error) {
      console.error('Error loading payments:', error)
    }
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId || u._id === userId)
    return user ? user.name : 'Unknown'
  }

  const getStatusBadge = (status) => {
    const variants = {
      'completed': 'success',
      'pending': 'warning',
      'failed': 'danger'
    }
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>
  }

  return (
    <div>
      <Card>
        <Card.Header>
          <h4 className="mb-0">Payments Management</h4>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Amount ($)</th>
                <th>Plan</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">No payments found</td>
                </tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment.id}>
                    <td>#{payment.id}</td>
                    <td>{getUserName(payment.userId)}</td>
                    <td>${payment.amount?.toFixed(2) || '0.00'}</td>
                    <td>{payment.planName || '-'}</td>
                    <td>{new Date(payment.date).toLocaleDateString()}</td>
                    <td>{getStatusBadge(payment.status || 'completed')}</td>
                    <td>{payment.method || 'Online'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  )
}

export default PaymentsManagement



