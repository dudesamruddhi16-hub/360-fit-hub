import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Modal, Button } from 'react-bootstrap'
import io from 'socket.io-client'
import Peer from 'simple-peer'

const VideoCall = ({ show, onClose, roomId, isInitiator, userName, otherUserName }) => {
  const [stream, setStream] = useState(null)
  const [receivingCall, setReceivingCall] = useState(false)
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Connecting...')
  
  const userVideo = useRef()
  const partnerVideo = useRef()
  const socketRef = useRef()
  const peerRef = useRef()

  const callUser = useCallback(() => {
    if (!stream) return
    
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    })

    peer.on('signal', (data) => {
      if (socketRef.current) {
        socketRef.current.emit('offer', {
          roomId: roomId,
          offer: data
        })
      }
    })

    peer.on('stream', (stream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream
      }
      setCallAccepted(true)
      setConnectionStatus('Connected')
    })

    peer.on('error', (err) => {
      console.error('Peer error:', err)
      setConnectionStatus('Connection error')
    })

    peerRef.current = peer
  }, [stream, roomId])

  const handleReceiveCall = useCallback((data) => {
    if (!stream) return
    
    setReceivingCall(true)
    setConnectionStatus('Incoming call...')
    
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    })

    peer.on('signal', (answerData) => {
      if (socketRef.current) {
        socketRef.current.emit('answer', {
          roomId: roomId,
          answer: answerData
        })
      }
    })

    peer.on('stream', (stream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream
      }
      setCallAccepted(true)
      setReceivingCall(false)
      setConnectionStatus('Connected')
    })

    peer.signal(data.offer)
    peerRef.current = peer
  }, [stream, roomId])

  const handleAnswer = useCallback((data) => {
    if (peerRef.current) {
      peerRef.current.signal(data.answer)
    }
  }, [])

  const handleNewICECandidateMsg = useCallback((data) => {
    if (peerRef.current) {
      peerRef.current.signal(data.candidate)
    }
  }, [])

  const handleCallEnded = useCallback(() => {
    setCallEnded(true)
    setCallAccepted(false)
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    if (peerRef.current) {
      peerRef.current.destroy()
    }
  }, [stream])

  useEffect(() => {
    if (!show || !roomId) return

    // Connect to socket server
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server')
      socketRef.current.emit('join-room', roomId)
    })

    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(currentStream => {
        setStream(currentStream)
        if (userVideo.current) {
          userVideo.current.srcObject = currentStream
        }
      })
      .catch(err => {
        console.error('Error accessing media devices:', err)
        setConnectionStatus('Error accessing camera/microphone')
      })

    // Handle incoming call
    socketRef.current.on('offer', handleReceiveCall)
    socketRef.current.on('answer', handleAnswer)
    socketRef.current.on('ice-candidate', handleNewICECandidateMsg)
    socketRef.current.on('call-ended', handleCallEnded)
    socketRef.current.on('user-joined', () => {
      if (isInitiator && stream) {
        setConnectionStatus('User joined, starting call...')
        callUser()
      }
    })

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (socketRef.current) {
        socketRef.current.emit('end-call', roomId)
        socketRef.current.disconnect()
      }
      if (peerRef.current) {
        peerRef.current.destroy()
      }
    }
  }, [show, roomId, isInitiator, stream, callUser, handleReceiveCall, handleAnswer, handleNewICECandidateMsg, handleCallEnded])

  const endCall = () => {
    setCallEnded(true)
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    if (socketRef.current) {
      socketRef.current.emit('end-call', roomId)
    }
    if (peerRef.current) {
      peerRef.current.destroy()
    }
    onClose()
  }

  const acceptCall = () => {
    setCallAccepted(true)
    setReceivingCall(false)
  }

  return (
    <Modal show={show} onHide={endCall} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-camera-video"></i> Video Call - {otherUserName || 'User'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="video-call-container">
          <div className="position-relative" style={{ backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', minHeight: '400px' }}>
            {/* Partner Video */}
            <video
              ref={partnerVideo}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover'
              }}
            />
            
            {/* User Video (Picture-in-Picture) */}
            {stream && (
              <video
                ref={userVideo}
                autoPlay
                playsInline
                muted
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  width: '150px',
                  height: '112px',
                  borderRadius: '8px',
                  border: '2px solid #fff',
                  objectFit: 'cover',
                  zIndex: 10
                }}
              />
            )}

            {/* Connection Status Overlay */}
            {!callAccepted && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#fff',
                textAlign: 'center',
                zIndex: 5
              }}>
                <div className="spinner-border text-light mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>{connectionStatus}</p>
              </div>
            )}

            {/* Incoming Call Overlay */}
            {receivingCall && !callAccepted && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#fff',
                textAlign: 'center',
                zIndex: 15,
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '20px',
                borderRadius: '8px'
              }}>
                <h4>Incoming Call from {otherUserName}</h4>
                <div className="mt-3">
                  <Button variant="success" className="me-2" onClick={acceptCall}>
                    <i className="bi bi-telephone-fill"></i> Accept
                  </Button>
                  <Button variant="danger" onClick={endCall}>
                    <i className="bi bi-telephone-x"></i> Decline
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-center w-100">
          <Button variant="danger" size="lg" onClick={endCall}>
            <i className="bi bi-telephone-x"></i> End Call
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default VideoCall