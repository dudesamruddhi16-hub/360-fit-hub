import React, { createContext, useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { usersService, apiClient } from '../services'
import { jwtDecode } from 'jwt-decode'

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

  // Initialize auth state from localStorage token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken')

      if (token) {
        try {
          const decoded = jwtDecode(token)
          const currentTime = Date.now() / 1000

          if (decoded.exp < currentTime) {
            // Token expired
            localStorage.removeItem('authToken')
            // Fallback to server check in case cookie is still valid
            await checkServerAuth()
          } else {
            // Token valid - set initial user state immediately
            setUser({
              id: decoded.id,
              role: decoded.role,
              ...decoded
            })

            // Background fetch to sync user details
            apiClient.get('/auth/me')
              .then(({ user }) => {
                setUser(normalizeUser(user))
              })
              .catch(() => {
                // If server rejects token but we have it, maybe it's revoked
                // But let's not be too aggressive to clear it unless 401
              })
            setLoading(false)
            return
          }
        } catch (error) {
          localStorage.removeItem('authToken')
          await checkServerAuth()
        }
      } else {
        // No token, check server session (cookies)
        await checkServerAuth()
      }
    }

    const checkServerAuth = async () => {
      try {
        // Only check if not on public pages to avoid unnecessary 401s
        const publicPages = ['/', '/login', '/signup']
        if (!publicPages.includes(location.pathname)) {
          const { user } = await apiClient.get('/auth/me')
          setUser(normalizeUser(user))
        } else {
          // If on public page and no token, we are done
        }
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, []) // Run only once on mount

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const { user, token } = response

      // Save token to localStorage for header-based auth backup
      if (token) {
        localStorage.setItem('authToken', token)
      } else {
        console.warn('No token received in login response')
      }

      const normalized = normalizeUser(user)
      setUser(normalized)
      setLoading(false)
      return { success: true, user: normalized }
    } catch (error) {
      console.error('Login error:', error)
      setLoading(false)
      return { success: false, error: error.response?.data?.error || error.message }
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
      localStorage.removeItem('authToken')
      setUser(null)
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
