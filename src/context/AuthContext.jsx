import React, { createContext, useState, useEffect, useContext } from 'react'
import { usersService } from '../services'

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

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('gymUser')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('gymUser')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    console.log('Logged in user:', email, password);
    try {
      const users = await usersService.query('email', email)
        console.log('users found:', users);
      if (users.length === 0) {
        throw new Error('User not found')
      }

    
      const foundUser = users[0]
      // In production, use proper password hashing (bcrypt, etc.)
      if (foundUser.password !== password) {
        throw new Error('Invalid password')
      }
      console.log('Logged in user:', users);
      // Normalize user (convert _id to id and remove password)
      const normalizedUser = normalizeUser(foundUser)
      setUser(normalizedUser)
      localStorage.setItem('gymUser', JSON.stringify(normalizedUser))
      return { success: true, user: normalizedUser }
    } catch (error) {
      return { success: false, error: error.message }
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
      const createdUser = await usersService.create(newUser)

      // Normalize user (convert _id to id and remove password)
      const normalizedUser = normalizeUser(createdUser)
      setUser(normalizedUser)
      localStorage.setItem('gymUser', JSON.stringify(normalizedUser))
      
      return { success: true, user: normalizedUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('gymUser')
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



