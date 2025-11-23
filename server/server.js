const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const http = require('http')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const { models, seedInitialData } = require('./models')

const app = express()
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI
const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env')
  process.exit(1)
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.MONGO_DB_NAME || '360fit',
  serverSelectionTimeoutMS: 20000
})
  .then(async () => {
    console.log('MongoDB connected')
    try {
      await Promise.all(Object.values(models).map(m => m.init()))
      console.log('Mongoose models initialized')
      await seedInitialData()
    } catch (err) {
      console.error('Error initializing models or seeding:', err)
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  socket.on('join-room', (roomId) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-joined', socket.id)
  })
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', { offer: data.offer, from: socket.id })
  })
  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', { answer: data.answer, from: socket.id })
  })
  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', { candidate: data.candidate, from: socket.id })
  })
  socket.on('end-call', (roomId) => {
    socket.to(roomId).emit('call-ended')
    socket.leave(roomId)
  })
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

const storeToModel = {
  users: models.User,
  memberships: models.Membership,
  membershipPlans: models.MembershipPlan,
  dietPlans: models.DietPlan,
  dietplans: models.DietPlan,
  workoutPlans: models.WorkoutPlan,
  exercises: models.Exercise,
  progress: models.Progress,
  payments: models.Payment,
  trainerAssignments: models.TrainerAssignment
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function attachUserFromToken(req, res, next) {
  try {
    let token = null
    if (req.cookies && req.cookies.token) token = req.cookies.token
    if (!token && req.headers && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ')
      if (parts[0] === 'Bearer' && parts[1]) token = parts[1]
    }
    if (!token) return next()

    const payload = jwt.verify(token, JWT_SECRET)
    const dbUser = await models.User.findById(payload.id).lean()
    if (!dbUser) return next()

    req.user = { id: payload.id, role: payload.role }
    return next()
  } catch (err) {
    return next()
  }
}
app.use(attachUserFromToken)

// --- Auth Routes (Prefixed with /api) ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })

    const user = await models.User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
    res.cookie('token', token, cookieOptions)

    const userObj = user.toObject()
    delete userObj.password
    return res.json({ user: userObj })
  } catch (err) {
    console.error('Auth login error:', err)
    return res.status(500).json({ error: 'Login failed' })
  }
})

app.post('/api/auth/logout', async (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  return res.json({ success: true })
})

app.get('/api/auth/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const user = await models.User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- Generic Routes ---
app.get('/api/:store/query', async (req, res) => {
  const { store } = req.params
  const Model = storeToModel[store]
  if (!Model) return res.status(404).json({ error: 'Store not found' })

  console.log(`Querying ${store} with params:`, req.query)

  let { field, value } = req.query
  if (!field && req.query.params) {
    field = req.query.params.field
    value = req.query.params.value
  }

  if (!field || typeof value === 'undefined') {
    return res.status(400).json({ error: 'field and value required' })
  }

  try {
    let q = {}
    if (field === '_id' || (/Id$/.test(field) && field !== 'userId')) {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({ error: 'Invalid id value' })
      }
      q[field] = value
    } else if (field === 'userId') {
      q[field] = value
    } else {
      q[field] = { $regex: `^${escapeRegex(value)}$`, $options: 'i' }
    }
    const docs = await Model.find(q)
    return res.json(docs)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

app.get('/api/:store/:id', async (req, res, next) => {
  if (req.params.id === 'query') return next()
  const Model = storeToModel[req.params.store]
  if (!Model) return res.status(404).json({ error: 'Store not found' })

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' })
  }

  try {
    const doc = await Model.findById(req.params.id)
    if (!doc) return res.status(404).json({ error: 'Not found' })
    return res.json(doc)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

app.get('/api/:store', async (req, res) => {
  const Model = storeToModel[req.params.store]
  if (!Model) return res.status(404).json({ error: 'Store not found' })
  try {
    const docs = await Model.find({}).sort({ _id: -1 })
    res.json(docs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/:store', async (req, res) => {
  const Model = storeToModel[req.params.store]
  if (!Model) return res.status(404).json({ error: 'Store not found' })
  try {
    const created = await Model.create(req.body)
    res.status(201).json(created)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/:store/:id', async (req, res) => {
  const Model = storeToModel[req.params.store]
  if (!Model) return res.status(404).json({ error: 'Store not found' })
  try {
    const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/:store/:id', async (req, res) => {
  const Model = storeToModel[req.params.store]
  if (!Model) return res.status(404).json({ error: 'Store not found' })
  try {
    const deleted = await Model.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.post('/api/seed', async (req, res) => {
  try {
    await seedInitialData()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

server.listen(PORT, () => console.log(`Server running on ${PORT}`))