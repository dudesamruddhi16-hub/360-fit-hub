import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './components/Landing/LandingPage'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import AdminDashboard from './components/Dashboard/AdminDashboard'
import TrainerDashboard from './components/Dashboard/TrainerDashboard'
import UserDashboard from './components/Dashboard/UserDashboard'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import './App.css'
import SessionTimeout from './components/Auth/SessionTimeout' // added

function App() {
  return (
    <Router>
      <AuthProvider>
        <SessionTimeout /> {/* session management overlay */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/*"
            element={
              <ProtectedRoute role="trainer">
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/*"
            element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App



