const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const http = require('http')
const { Server } = require('socket.io')
require('dotenv').config()
const { models, seedInitialData } = require('./models')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })

// Create HTTP server and Socket.io server
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join a room for video call
  socket.on('join-room', (roomId) => {
    socket.join(roomId)
    console.log(`User ${socket.id} joined room ${roomId}`)
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', socket.id)
  })

  // Handle offer signal
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', {
      offer: data.offer,
      from: socket.id
    })
  })

  // Handle answer signal
  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', {
      answer: data.answer,
      from: socket.id
    })
  })

  // Handle ICE candidate
  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    })
  })

  // Handle call end
  socket.on('end-call', (roomId) => {
    socket.to(roomId).emit('call-ended')
    socket.leave(roomId)
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Generic store mapping: route param 'store' maps to a Mongoose model
const storeToModel = {
  users: models.User,
  memberships: models.Membership,
  membershipPlans: models.MembershipPlan,
  dietPlans: models.DietPlan,
  workoutPlans: models.WorkoutPlan,
  exercises: models.Exercise,
  progress: models.Progress,
  payments: models.Payment,
  trainerAssignments: models.TrainerAssignment
}

// List / get all
app.get('/api/:store', async (req, res) => {
  const Model = storeToModel[req.params.store]
  if (!Model) return res.status(404).json({ error: 'Store not found' })
  try {
    const docs = await Model.find(req.query || {}).sort({ _id: -1 })
    res.json(docs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get by id
app.get('/api/:store/:id', async (req, res) => {
  const Model = storeToModel[req.params.store]
  if (!Model) return res.status(404).json({ error: 'Store not found' })
  try {
    const doc = await Model.findById(req.params.id)
    res.json(doc)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create
app.post('/api/:store', async (req, res) => {
  const Model = storeToModel[req.params.store]
  if (!Model) return res.status(404).json({ error: 'Store not found' })
  try {
    const created = await Model.create(req.body)
    res.json(created)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Update
app.put('/api/:store/:id', async (req, res) => {
  const Model = storeToModel[req.params.store]
  if (!Model) return res.status(404).json({ error: 'Store not found' })
  try {
    const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Delete
app.delete('/api/:store/:id', async (req, res) => {
  const Model = storeToModel[req.params.store]
  if (!Model) return res.status(404).json({ error: 'Store not found' })
  try {
    await Model.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Query by index-like: /api/:store/query?field=email&value=foo
app.get('/api/:store/query', async (req, res) => {
  const Model = storeToModel[req.params.store]
  if (!Model) return res.status(404).json({ error: 'Store not found' })
  const { field, value } = req.query
  if (!field) return res.status(400).json({ error: 'field required' })
  try {
    const q = {}
    q[field] = value
    const docs = await Model.find(q)
    res.json(docs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Seed route used by frontend seedDatabase()
app.post('/api/seed', async (req, res) => {
  try {
    await seedInitialData()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

server.listen(PORT, () => console.log(`Server running on ${PORT}`))