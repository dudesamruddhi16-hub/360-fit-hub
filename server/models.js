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

const membershipSchema = genericSchema({ userId: mongoose.Types.ObjectId, planId: mongoose.Types.ObjectId, status: String, startDate: Date, endDate: Date })
const planSchema = genericSchema({ name: String, price: Number, duration: Number, features: [String] })
const dietSchema = genericSchema({ userId: mongoose.Types.ObjectId, trainerId: mongoose.Types.ObjectId, name: String, description: String, meals: Array })
const workoutSchema = genericSchema({ userId: mongoose.Types.ObjectId, trainerId: mongoose.Types.ObjectId, name: String, description: String, exercises: Array })
const exerciseSchema = genericSchema({ name: String, category: String, description: String, sets: Number, reps: Number, duration: Number })
const progressSchema = genericSchema({ userId: mongoose.Types.ObjectId, date: Date, weight: Number, bodyFat: Number, muscleMass: Number, notes: String })
const paymentSchema = genericSchema({ userId: mongoose.Types.ObjectId, membershipId: mongoose.Types.ObjectId, amount: Number, planName: String, date: Date, status: String, method: String, transactionId: String })
const assignmentSchema = genericSchema({ userId: mongoose.Types.ObjectId, trainerId: mongoose.Types.ObjectId })

const User = mongoose.model('User', userSchema)
const Membership = mongoose.model('Membership', membershipSchema)
const MembershipPlan = mongoose.model('MembershipPlan', planSchema)
const DietPlan = mongoose.model('DietPlan', dietSchema)
const WorkoutPlan = mongoose.model('WorkoutPlan', workoutSchema)
const Exercise = mongoose.model('Exercise', exerciseSchema)
const Progress = mongoose.model('Progress', progressSchema)
const Payment = mongoose.model('Payment', paymentSchema)
const TrainerAssignment = mongoose.model('TrainerAssignment', assignmentSchema)

// Seed initial data (similar to indexedDB seed)
const seedInitialData = async () => {
  const usersCount = await User.countDocuments()
  if (usersCount > 0) return

  const admin = await User.create({ email: 'admin@gym.com', password: 'admin123', name: 'Admin User', role: 'admin', phone: '1234567890' })
  const trainer = await User.create({ email: 'trainer@gym.com', password: 'trainer123', name: 'John Trainer', role: 'trainer', phone: '1234567891', specialization: 'Weight Training', experience: '5 years' })
  const user = await User.create({ email: 'user@gym.com', password: 'user123', name: 'Test User', role: 'user', phone: '1234567892', age: 25, weight: 70, height: 175 })

  const plans = [
    { name: 'Basic Plan', price: 29.99, duration: 30, features: ['Gym Access', 'Basic Equipment'] },
    { name: 'Premium Plan', price: 49.99, duration: 30, features: ['Gym Access', 'All Equipment', 'Group Classes'] },
    { name: 'VIP Plan', price: 79.99, duration: 30, features: ['Gym Access', 'All Equipment', 'Group Classes', 'Personal Trainer', 'Nutrition Plan'] }
  ]
  await MembershipPlan.insertMany(plans)

  const exercises = [
    { name: 'Bench Press', category: 'Chest', description: 'Upper body strength exercise', sets: 3, reps: 10 },
    { name: 'Squats', category: 'Legs', description: 'Lower body strength exercise', sets: 3, reps: 12 },
    { name: 'Deadlift', category: 'Back', description: 'Full body strength exercise', sets: 3, reps: 8 },
    { name: 'Pull-ups', category: 'Back', description: 'Upper body pulling exercise', sets: 3, reps: 10 },
    { name: 'Running', category: 'Cardio', description: 'Cardiovascular exercise', duration: 30 }
  ]
  await Exercise.insertMany(exercises)
}

module.exports = { models: { User, Membership, MembershipPlan, DietPlan, WorkoutPlan, Exercise, Progress, Payment, TrainerAssignment }, seedInitialData }