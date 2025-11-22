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

if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env')
  process.exit(1)
}

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, dbName: process.env.MONGO_DB_NAME || '360fit' })
  .then(async () => {
    console.log('MongoDB connected')
    try {
      // Ensure models initialize (creates indexes & collections)
      await Promise.all(Object.values(models).map(m => m.init()))
      console.log('Mongoose models initialized')

      // Seed initial data if empty
      await seedInitialData()
      console.log('Seed completed (if DB was empty)')
    } catch (err) {
      console.error('Error initializing models or seeding:', err)
    }
  })
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

// Map route -> Mongoose model
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

// helper: escape regex for user-supplied value
function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// --- Ensure query route is defined BEFORE the id route ---
// Query by index-like: /api/:store/query?field=email&value=foo
app.get('/api/:store/query', async (req, res) => {
  const { store } = req.params
  const Model = storeToModel[store]
  if (!Model) return res.status(404).json({ error: 'Store not found' })

  const { field, value } = req.query
  if (!field || typeof value === 'undefined') {
    return res.status(400).json({ error: 'field and value required' })
  }

  try {
    let q = {}
    // if searching by id-like field use ObjectId exact match
    if (field === '_id' || /Id$/.test(field)) {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({ error: 'Invalid id value' })
      }
      q[field] = value
    } else {
      // case-insensitive exact match for strings (use regex to be safe)
      q[field] = { $regex: `^${escapeRegex(value)}$`, $options: 'i' }
    }

    const docs = await Model.find(q)
    return res.json(docs)
  } catch (err) {
    console.error('Query error:', err)
    return res.status(500).json({ error: err.message })
  }
})

// Get by id - placed AFTER the query route to avoid matching "query" as :id
app.get('/api/:store/:id', async (req, res, next) => {
  if (req.params.id === 'query') return next() // safety net

  const Model = storeToModel[req.params.store]
  if (!Model) return res.status(404).json({ error: 'Store not found' })

  const id = req.params.id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid id' })
  }

  try {
    const doc = await Model.findById(id)
    if (!doc) return res.status(404).json({ error: 'Not found' })
    return res.json(doc)
  } catch (err) {
    console.error('GetById error:', err)
    return res.status(500).json({ error: err.message })
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

// Seed route used by frontend seedDatabase()
app.post('/api/seed', async (req, res) => {
  try {
    await seedInitialData()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await models.User.find({}).sort({ _id: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Query users by field - MUST come before /api/users/:id
app.get('/api/users/query', async (req, res) => {
  try {
    const { field, value } = req.query;
    if (!field) return res.status(400).json({ error: 'field required' });
    const q = {};
    q[field] = value;
    const users = await models.User.find(q);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await models.User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const createdUser = await models.User.create(req.body);
    res.status(201).json(createdUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a user
app.put('/api/users/:id', async (req, res) => {
  try {
    const updatedUser = await models.User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const deletedUser = await models.User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all memberships
app.get('/api/memberships', async (req, res) => {
  try {
    const memberships = await models.Membership.find({}).sort({ _id: -1 });
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get membership by ID
app.get('/api/memberships/:id', async (req, res) => {
  try {
    const membership = await models.Membership.findById(req.params.id);
    if (!membership) return res.status(404).json({ error: 'Membership not found' });
    res.json(membership);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new membership
app.post('/api/memberships', async (req, res) => {
  try {
    const createdMembership = await models.Membership.create(req.body);
    res.status(201).json(createdMembership);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a membership
app.put('/api/memberships/:id', async (req, res) => {
  try {
    const updatedMembership = await models.Membership.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMembership) return res.status(404).json({ error: 'Membership not found' });
    res.json(updatedMembership);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a membership
app.delete('/api/memberships/:id', async (req, res) => {
  try {
    const deletedMembership = await models.Membership.findByIdAndDelete(req.params.id);
    if (!deletedMembership) return res.status(404).json({ error: 'Membership not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all membership plans
app.get('/api/membershipPlans', async (req, res) => {
  try {
    const plans = await models.MembershipPlan.find({}).sort({ _id: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get membership plan by ID
app.get('/api/membershipPlans/:id', async (req, res) => {
  try {
    const plan = await models.MembershipPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new membership plan
app.post('/api/membershipPlans', async (req, res) => {
  try {
    const createdPlan = await models.MembershipPlan.create(req.body);
    res.status(201).json(createdPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a membership plan
app.put('/api/membershipPlans/:id', async (req, res) => {
  try {
    const updatedPlan = await models.MembershipPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPlan) return res.status(404).json({ error: 'Plan not found' });
    res.json(updatedPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a membership plan
app.delete('/api/membershipPlans/:id', async (req, res) => {
  try {
    const deletedPlan = await models.MembershipPlan.findByIdAndDelete(req.params.id);
    if (!deletedPlan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all diet plans
app.get('/api/dietPlans', async (req, res) => {
  try {
    const dietPlans = await models.DietPlan.find({}).sort({ _id: -1 });
    res.json(dietPlans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get diet plan by ID
app.get('/api/dietPlans/:id', async (req, res) => {
  try {
    const dietPlan = await models.DietPlan.findById(req.params.id);
    if (!dietPlan) return res.status(404).json({ error: 'Diet Plan not found' });
    res.json(dietPlan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new diet plan
app.post('/api/dietPlans', async (req, res) => {
  try {
    const createdDietPlan = await models.DietPlan.create(req.body);
    res.status(201).json(createdDietPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a diet plan
app.put('/api/dietPlans/:id', async (req, res) => {
  try {
    const updatedDietPlan = await models.DietPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDietPlan) return res.status(404).json({ error: 'Diet Plan not found' });
    res.json(updatedDietPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a diet plan
app.delete('/api/dietPlans/:id', async (req, res) => {
  try {
    const deletedDietPlan = await models.DietPlan.findByIdAndDelete(req.params.id);
    if (!deletedDietPlan) return res.status(404).json({ error: 'Diet Plan not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all workout plans
app.get('/api/workoutPlans', async (req, res) => {
  try {
    const workoutPlans = await models.WorkoutPlan.find({}).sort({ _id: -1 });
    res.json(workoutPlans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get workout plan by ID
app.get('/api/workoutPlans/:id', async (req, res) => {
  try {
    const workoutPlan = await models.WorkoutPlan.findById(req.params.id);
    if (!workoutPlan) return res.status(404).json({ error: 'Workout Plan not found' });
    res.json(workoutPlan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new workout plan
app.post('/api/workoutPlans', async (req, res) => {
  try {
    const createdWorkoutPlan = await models.WorkoutPlan.create(req.body);
    res.status(201).json(createdWorkoutPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a workout plan
app.put('/api/workoutPlans/:id', async (req, res) => {
  try {
    const updatedWorkoutPlan = await models.WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedWorkoutPlan) return res.status(404).json({ error: 'Workout Plan not found' });
    res.json(updatedWorkoutPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a workout plan
app.delete('/api/workoutPlans/:id', async (req, res) => {
  try {
    const deletedWorkoutPlan = await models.WorkoutPlan.findByIdAndDelete(req.params.id);
    if (!deletedWorkoutPlan) return res.status(404).json({ error: 'Workout Plan not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all exercises
app.get('/api/exercises', async (req, res) => {
  try {
    const exercises = await models.Exercise.find({}).sort({ _id: -1 });
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get exercise by ID
app.get('/api/exercises/:id', async (req, res) => {
  try {
    const exercise = await models.Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    res.json(exercise);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new exercise
app.post('/api/exercises', async (req, res) => {
  try {
    const createdExercise = await models.Exercise.create(req.body);
    res.status(201).json(createdExercise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update an exercise
app.put('/api/exercises/:id', async (req, res) => {
  try {
    const updatedExercise = await models.Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedExercise) return res.status(404).json({ error: 'Exercise not found' });
    res.json(updatedExercise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an exercise
app.delete('/api/exercises/:id', async (req, res) => {
  try {
    const deletedExercise = await models.Exercise.findByIdAndDelete(req.params.id);
    if (!deletedExercise) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all progress records
app.get('/api/progress', async (req, res) => {
  try {
    const progressRecords = await models.Progress.find({}).sort({ _id: -1 });
    res.json(progressRecords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get progress by ID
app.get('/api/progress/:id', async (req, res) => {
  try {
    const progress = await models.Progress.findById(req.params.id);
    if (!progress) return res.status(404).json({ error: 'Progress not found' });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new progress record
app.post('/api/progress', async (req, res) => {
  try {
    const createdProgress = await models.Progress.create(req.body);
    res.status(201).json(createdProgress);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a progress record
app.put('/api/progress/:id', async (req, res) => {
  try {
    const updatedProgress = await models.Progress.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProgress) return res.status(404).json({ error: 'Progress not found' });
    res.json(updatedProgress);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a progress record
app.delete('/api/progress/:id', async (req, res) => {
  try {
    const deletedProgress = await models.Progress.findByIdAndDelete(req.params.id);
    if (!deletedProgress) return res.status(404).json({ error: 'Progress not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all payments
app.get('/api/payments', async (req, res) => {
  try {
    const payments = await models.Payment.find({}).sort({ _id: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payment by ID
app.get('/api/payments/:id', async (req, res) => {
  try {
    const payment = await models.Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new payment
app.post('/api/payments', async (req, res) => {
  try {
    const createdPayment = await models.Payment.create(req.body);
    res.status(201).json(createdPayment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a payment
app.put('/api/payments/:id', async (req, res) => {
  try {
    const updatedPayment = await models.Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPayment) return res.status(404).json({ error: 'Payment not found' });
    res.json(updatedPayment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a payment
app.delete('/api/payments/:id', async (req, res) => {
  try {
    const deletedPayment = await models.Payment.findByIdAndDelete(req.params.id);
    if (!deletedPayment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all trainer assignments
app.get('/api/trainerAssignments', async (req, res) => {
  try {
    const assignments = await models.TrainerAssignment.find({}).sort({ _id: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trainer assignment by ID
app.get('/api/trainerAssignments/:id', async (req, res) => {
  try {
    const assignment = await models.TrainerAssignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new trainer assignment
app.post('/api/trainerAssignments', async (req, res) => {
  try {
    const createdAssignment = await models.TrainerAssignment.create(req.body);
    res.status(201).json(createdAssignment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a trainer assignment
app.put('/api/trainerAssignments/:id', async (req, res) => {
  try {
    const updatedAssignment = await models.TrainerAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAssignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(updatedAssignment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a trainer assignment
app.delete('/api/trainerAssignments/:id', async (req, res) => {
  try {
    const deletedAssignment = await models.TrainerAssignment.findByIdAndDelete(req.params.id);
    if (!deletedAssignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

server.listen(PORT, () => console.log(`Server running on ${PORT}`))