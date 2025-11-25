import React, { createContext, useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { usersService, apiClient } from '../services'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper to convert MongoDB _id to id for frontend compatibility
const normalizeUser = (user) => {
  if (!user) return null
  const { _id, password, ...rest } = user
  return {
    id: _id || user.id,
    ...rest
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  // Check if user is logged in on mount via server session
  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check on landing page (home page doesn't need authentication)
      if (location.pathname === '/') {
        setLoading(false)
        return
      }

      try {
        const { user } = await apiClient.get('/auth/me')
        setUser(normalizeUser(user))
      } catch (error) {
        // Not authenticated or error
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [location.pathname]) // re-run when route changes

  const login = async (email, password) => {
    try {
      const { user } = await apiClient.post('/auth/login', { email, password })
      const normalized = normalizeUser(user)
      setUser(normalized)
      return { success: true, user: normalized }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.response?.data?.error || error.message }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData) => {
    try {
      // Check if email already exists
      const existingUsers = await usersService.query('email', userData.email)
      if (existingUsers.length > 0) {
        throw new Error('Email already exists. Please use a different email.')
      }

      // Create new user with role 'user' by default
      const newUser = {
        ...userData,
        role: 'user',
        createdAt: new Date().toISOString()
      }

      // Create user via API
      await usersService.create(newUser)

      // Auto-login after signup
      return login(userData.email, userData.password)
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      // Optional: Redirect to login or clear other state
    }
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
