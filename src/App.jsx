import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './components/Landing/LandingPage'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import SessionTimeout from './components/Auth/SessionTimeout'
import './App.css'

// Lazy load dashboard components
const AdminDashboard = lazy(() => import('./components/Dashboard/AdminDashboard'))
const TrainerDashboard = lazy(() => import('./components/Dashboard/TrainerDashboard'))
const UserDashboard = lazy(() => import('./components/Dashboard/UserDashboard'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <AuthProvider>
        <SessionTimeout />
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </AuthProvider>
    </Router>
  )
}

export default App




