import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="text-center p-5">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    } else if (user.role === 'trainer') {
      return <Navigate to="/trainer" replace />
    } else {
      return <Navigate to="/user" replace />
    }
  }

  return children
}

export default ProtectedRoute



