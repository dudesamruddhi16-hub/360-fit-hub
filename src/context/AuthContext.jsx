import React, { createContext, useState, useEffect, useContext } from 'react'
import { getAllItems, queryByIndex, addItem, STORES } from '../db/indexedDB'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
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
    try {
      const users = await queryByIndex(STORES.USERS, 'email', email)
      if (users.length === 0) {
        throw new Error('User not found')
      }

      const foundUser = users[0]
      // In production, use proper password hashing (bcrypt, etc.)
      if (foundUser.password !== password) {
        throw new Error('Invalid password')
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem('gymUser', JSON.stringify(userWithoutPassword))
      return { success: true, user: userWithoutPassword }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signup = async (userData) => {
    try {
      // Check if email already exists
      const existingUsers = await queryByIndex(STORES.USERS, 'email', userData.email)
      if (existingUsers.length > 0) {
        throw new Error('Email already exists. Please use a different email.')
      }

      // Create new user with role 'user' by default
      const newUser = {
        ...userData,
        role: 'user',
        createdAt: new Date().toISOString()
      }

      // Add user to database (returns the generated ID)
      const userId = await addItem(STORES.USERS, newUser)

      // Create user object with the generated ID
      const createdUser = {
        id: userId,
        ...newUser
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = createdUser
      setUser(userWithoutPassword)
      localStorage.setItem('gymUser', JSON.stringify(userWithoutPassword))
      
      return { success: true, user: userWithoutPassword }
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



