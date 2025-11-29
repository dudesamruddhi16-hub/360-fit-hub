const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  name: String,
  role: String,
  phone: String,
  age: Number,
  weight: Number,
  height: Number,
  specialization: String,
  experience: String,
  createdAt: { type: Date, default: Date.now }
})

const genericSchema = (schemaDef) => new mongoose.Schema({ ...schemaDef, createdAt: { type: Date, default: Date.now } })

const membershipSchema = genericSchema({
  userId: mongoose.Schema.Types.ObjectId,
  planId: mongoose.Schema.Types.ObjectId,
  planName: String,
  price: Number,
  status: String,
  startDate: Date,
  endDate: Date
})

const planSchema = genericSchema({
  name: String,
  price: Number,
  duration: Number,
  features: [String]
})

const dietSchema = genericSchema({
  userId: mongoose.Schema.Types.ObjectId,
  trainerId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  meals: [{
    name: String,
    calories: Number,
    food: String,
    mealType: String,
    time: String
  }]
})

const workoutSchema = genericSchema({
  userId: mongoose.Schema.Types.ObjectId,
  trainerId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  exercises: [{
    exerciseId: mongoose.Schema.Types.ObjectId,
    sets: Number,
    reps: Number,
    duration: Number
  }]
})

const exerciseSchema = genericSchema({
  name: String,
  category: String,
  description: String,
  sets: Number,
  reps: Number,
  duration: Number
})

const progressSchema = genericSchema({
  userId: mongoose.Schema.Types.ObjectId,
  date: { type: Date, default: Date.now },
  weight: Number,
  notes: String
})

const paymentSchema = genericSchema({
  userId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  method: String,
  status: String
})

const assignmentSchema = genericSchema({
  userId: mongoose.Schema.Types.ObjectId,
  trainerId: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: 'active' }
})

const wellnessSchema = new mongoose.Schema({
  title: { type: String },
  thumbnail: { type: String },
  duration: { type: String },
  category: { type: String },
  url: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'wellness' })

const User = mongoose.model('User', userSchema)
const Membership = mongoose.model('Membership', membershipSchema)
const MembershipPlan = mongoose.model('MembershipPlan', planSchema)
const DietPlan = mongoose.model('DietPlan', dietSchema)
const WorkoutPlan = mongoose.model('WorkoutPlan', workoutSchema)
const Exercise = mongoose.model('Exercise', exerciseSchema)
const Progress = mongoose.model('Progress', progressSchema)
const Payment = mongoose.model('Payment', paymentSchema)
const TrainerAssignment = mongoose.model('TrainerAssignment', assignmentSchema)
const Wellness = mongoose.model('Wellness', wellnessSchema)

// Seed initial data (similar to indexedDB seed)
const seedInitialData = async () => {
  try {
    const usersCount = await User.countDocuments()

    // Ensure specific admin user exists
    const specificUser = await User.findOne({ email: 'yogesh@gym.com' })
    if (!specificUser) {
      await User.create({
        email: 'yogesh@gym.com',
        password: 'yogesh123',
        name: 'Gym Owner',
        role: 'admin',
        phone: '9623002470',
        age: 34
      })
      console.log('Seeded specific user: yogesh@gym.com')
    }

    if (usersCount > 0) return

    // Create users
    const admin = await User.create({ email: 'admin@gym.com', password: 'admin123', name: 'Admin User', role: 'admin', phone: '1234567890' })
    const trainer = await User.create({ email: 'trainer@gym.com', password: 'trainer123', name: 'John Trainer', role: 'trainer', phone: '1234567891', specialization: 'Weight Training', experience: '5 years' })
    const user = await User.create({ email: 'user@gym.com', password: 'user123', name: 'Test User', role: 'user', phone: '1234567892', age: 25, weight: 70, height: 175 })

    // Membership plans
    const plans = await MembershipPlan.insertMany([
      { name: 'Basic Plan', price: 29.99, duration: 30, features: ['Gym Access', 'Basic Equipment'] },
      { name: 'Premium Plan', price: 49.99, duration: 30, features: ['Gym Access', 'All Equipment', 'Group Classes'] },
      { name: 'VIP Plan', price: 79.99, duration: 30, features: ['Gym Access', 'All Equipment', 'Group Classes', 'Personal Trainer', 'Nutrition Plan'] }
    ])

    // Exercises
    await Exercise.insertMany([
      { name: 'Bench Press', category: 'Chest', description: 'Upper body strength exercise', sets: 3, reps: 10 },
      { name: 'Squats', category: 'Legs', description: 'Lower body strength exercise', sets: 3, reps: 12 },
      { name: 'Deadlift', category: 'Back', description: 'Full body strength exercise', sets: 3, reps: 8 },
      { name: 'Pull-ups', category: 'Back', description: 'Upper body pulling exercise', sets: 3, reps: 10 },
      { name: 'Running', category: 'Cardio', description: 'Cardiovascular exercise', duration: 30 }
    ])

    // Wellness
    await Wellness.insertMany([
      { title: 'Yoga', thumbnail: 'https://example.com/yoga.jpg', duration: '60 minutes', category: 'Yoga', url: 'https://www.youtube.com/watch?v=example' },
      { title: 'Zumba', thumbnail: 'https://example.com/zumba.jpg', duration: '60 minutes', category: 'Zumba', url: 'https://www.youtube.com/watch?v=example' },
      { title: 'Pilates', thumbnail: 'https://example.com/pilates.jpg', duration: '60 minutes', category: 'Pilates', url: 'https://www.youtube.com/watch?v=example' }
    ])

    // Example membership for test user (link to first plan)
    if (plans && plans.length) {
      await Membership.create({
        userId: user._id,
        planId: plans[0]._id,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // +30 days
      })
    }

    // Example trainer assignment
    await TrainerAssignment.create({ userId: user._id, trainerId: trainer._id })

    console.log('SeedInitialData: inserted users, plans, exercises, membership, assignment')
  } catch (err) {
    // ignore duplicate key errors during re-seed attempt
    if (err.code === 11000) {
      console.warn('Seed skipped duplicate keys:', err.keyValue)
      return
    }
    console.error('Error in seedInitialData:', err)
    throw err
  }
}

module.exports = {
  models: {
    User,
    Membership,
    MembershipPlan,
    DietPlan,
    WorkoutPlan,
    Exercise,
    Progress,
    Payment,
    TrainerAssignment,
    Wellness
  },
  seedInitialData
}