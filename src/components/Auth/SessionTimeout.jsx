import React, { useEffect, useRef, useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function SessionTimeout() {
  const { user, logout, refreshSession } = useAuth()
  const navigate = useNavigate()
  const idleMinutes = Number(import.meta.env.VITE_SESSION_IDLE_MINUTES) || 10
  const warnSeconds = Number(import.meta.env.VITE_SESSION_WARN_SECONDS) || 120

  const idleMs = idleMinutes * 60 * 1000
  const warnMs = warnSeconds * 1000

  const [showWarning, setShowWarning] = useState(false)
  const [remaining, setRemaining] = useState(warnSeconds)
  const activityRef = useRef(Date.now())
  const timeoutRef = useRef(null)
  const countdownRef = useRef(null)
  const showWarningRef = useRef(showWarning)

  // keep ref in sync with state so event handlers read latest value
  useEffect(() => { showWarningRef.current = showWarning }, [showWarning])

  const resetIdle = async () => {
    activityRef.current = Date.now()
    setShowWarning(false)
    setRemaining(warnSeconds)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }

    if (typeof refreshSession === 'function') {
      try { await refreshSession() } catch (err) {}
    }

    scheduleWarning()
  }

  const scheduleWarning = () => {
    if (idleMs <= 0) return
    const elapsed = Date.now() - activityRef.current
    const toWait = Math.max(0, idleMs - elapsed)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      setShowWarning(true)
      setRemaining(warnSeconds)

      if (countdownRef.current) clearInterval(countdownRef.current)
      countdownRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current)
            countdownRef.current = null
            // ensure modal stays visible until logout happens
            handleLogout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, toWait)
  }

  const handleLogout = () => {
    try {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
      if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null }
      setShowWarning(false)
      logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  useEffect(() => {
    if (!user) {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
      if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null }
      return undefined
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'click']
    // ignore activity events while warning modal is shown
    const onActivity = () => {
      if (showWarningRef.current) return
      resetIdle().catch(() => {})
    }

    events.forEach(ev => window.addEventListener(ev, onActivity))
    resetIdle().catch(() => {})

    return () => {
      events.forEach(ev => window.removeEventListener(ev, onActivity))
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
      if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (!user) return null

  return (
    <Modal show={showWarning} onHide={() => {}} backdrop="static" centered>
      <Modal.Header>
        <Modal.Title>Session Expiring</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Your session has been idle for {idleMinutes} minute(s).</p>
        <p>You're about to be logged out in <strong>{remaining}</strong> second(s).</p>
        <div className="text-muted small">Click "Continue your session" to remain signed in.</div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleLogout}>Logout now</Button>
        <Button variant="primary" onClick={() => { resetIdle().catch(() => {}) }}>Continue your session</Button>
      </Modal.Footer>
    </Modal>
  )
}