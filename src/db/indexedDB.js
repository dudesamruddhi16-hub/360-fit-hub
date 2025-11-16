// IndexedDB Database Setup and Operations

const DB_NAME = 'GymManagementDB'
const DB_VERSION = 1

const STORES = {
  USERS: 'users',
  MEMBERSHIPS: 'memberships',
  DIET_PLANS: 'dietPlans',
  WORKOUT_PLANS: 'workoutPlans',
  EXERCISES: 'exercises',
  PROGRESS: 'progress',
  PAYMENTS: 'payments',
  TRAINER_ASSIGNMENTS: 'trainerAssignments'
}

let db = null

// Initialize Database
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      // Users Store
      if (!database.objectStoreNames.contains(STORES.USERS)) {
        const userStore = database.createObjectStore(STORES.USERS, { keyPath: 'id', autoIncrement: true })
        userStore.createIndex('email', 'email', { unique: true })
        userStore.createIndex('role', 'role', { unique: false })
      }

      // Memberships Store
      if (!database.objectStoreNames.contains(STORES.MEMBERSHIPS)) {
        const membershipStore = database.createObjectStore(STORES.MEMBERSHIPS, { keyPath: 'id', autoIncrement: true })
        membershipStore.createIndex('userId', 'userId', { unique: false })
        membershipStore.createIndex('planId', 'planId', { unique: false })
        membershipStore.createIndex('status', 'status', { unique: false })
      }

      // Membership Plans Store
      if (!database.objectStoreNames.contains('membershipPlans')) {
        database.createObjectStore('membershipPlans', { keyPath: 'id', autoIncrement: true })
      }

      // Diet Plans Store
      if (!database.objectStoreNames.contains(STORES.DIET_PLANS)) {
        const dietStore = database.createObjectStore(STORES.DIET_PLANS, { keyPath: 'id', autoIncrement: true })
        dietStore.createIndex('userId', 'userId', { unique: false })
        dietStore.createIndex('trainerId', 'trainerId', { unique: false })
      }

      // Workout Plans Store
      if (!database.objectStoreNames.contains(STORES.WORKOUT_PLANS)) {
        const workoutStore = database.createObjectStore(STORES.WORKOUT_PLANS, { keyPath: 'id', autoIncrement: true })
        workoutStore.createIndex('userId', 'userId', { unique: false })
        workoutStore.createIndex('trainerId', 'trainerId', { unique: false })
      }

      // Exercises Store
      if (!database.objectStoreNames.contains(STORES.EXERCISES)) {
        database.createObjectStore(STORES.EXERCISES, { keyPath: 'id', autoIncrement: true })
      }

      // Progress Store
      if (!database.objectStoreNames.contains(STORES.PROGRESS)) {
        const progressStore = database.createObjectStore(STORES.PROGRESS, { keyPath: 'id', autoIncrement: true })
        progressStore.createIndex('userId', 'userId', { unique: false })
        progressStore.createIndex('date', 'date', { unique: false })
      }

      // Payments Store
      if (!database.objectStoreNames.contains(STORES.PAYMENTS)) {
        const paymentStore = database.createObjectStore(STORES.PAYMENTS, { keyPath: 'id', autoIncrement: true })
        paymentStore.createIndex('userId', 'userId', { unique: false })
        paymentStore.createIndex('date', 'date', { unique: false })
      }

      // Trainer Assignments Store
      if (!database.objectStoreNames.contains(STORES.TRAINER_ASSIGNMENTS)) {
        const assignmentStore = database.createObjectStore(STORES.TRAINER_ASSIGNMENTS, { keyPath: 'id', autoIncrement: true })
        assignmentStore.createIndex('userId', 'userId', { unique: false })
        assignmentStore.createIndex('trainerId', 'trainerId', { unique: false })
      }
    }
  })
}

// Generic CRUD Operations
const getStore = (storeName, mode = 'readwrite') => {
  if (!db) throw new Error('Database not initialized')
  return db.transaction([storeName], mode).objectStore(storeName)
}

export const addItem = async (storeName, item) => {
  const store = getStore(storeName)
  return new Promise((resolve, reject) => {
    const request = store.add(item)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const getAllItems = async (storeName) => {
  const store = getStore(storeName, 'readonly')
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const getItemById = async (storeName, id) => {
  const store = getStore(storeName, 'readonly')
  return new Promise((resolve, reject) => {
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const updateItem = async (storeName, item) => {
  const store = getStore(storeName)
  return new Promise((resolve, reject) => {
    const request = store.put(item)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const deleteItem = async (storeName, id) => {
  const store = getStore(storeName)
  return new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const queryByIndex = async (storeName, indexName, value) => {
  const store = getStore(storeName, 'readonly')
  const index = store.index(indexName)
  return new Promise((resolve, reject) => {
    const request = index.getAll(value)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Initialize with default data
export const seedDatabase = async () => {
  try {
    // Check if users exist
    const users = await getAllItems(STORES.USERS)
    if (users.length === 0) {
      // Create default admin
      await addItem(STORES.USERS, {
        email: 'admin@gym.com',
        password: 'admin123', // In production, this should be hashed
        name: 'Admin User',
        role: 'admin',
        phone: '1234567890',
        createdAt: new Date().toISOString()
      })

      // Create default trainer
      await addItem(STORES.USERS, {
        email: 'trainer@gym.com',
        password: 'trainer123',
        name: 'John Trainer',
        role: 'trainer',
        phone: '1234567891',
        specialization: 'Weight Training',
        experience: '5 years',
        createdAt: new Date().toISOString()
      })

      // Create default user
      await addItem(STORES.USERS, {
        email: 'user@gym.com',
        password: 'user123',
        name: 'Test User',
        role: 'user',
        phone: '1234567892',
        age: 25,
        weight: 70,
        height: 175,
        createdAt: new Date().toISOString()
      })

      // Create default membership plans
      const plans = [
        { name: 'Basic Plan', price: 29.99, duration: 30, features: ['Gym Access', 'Basic Equipment'] },
        { name: 'Premium Plan', price: 49.99, duration: 30, features: ['Gym Access', 'All Equipment', 'Group Classes'] },
        { name: 'VIP Plan', price: 79.99, duration: 30, features: ['Gym Access', 'All Equipment', 'Group Classes', 'Personal Trainer', 'Nutrition Plan'] }
      ]

      for (const plan of plans) {
        await addItem('membershipPlans', plan)
      }

      // Create default exercises
      const exercises = [
        { name: 'Bench Press', category: 'Chest', description: 'Upper body strength exercise', sets: 3, reps: 10 },
        { name: 'Squats', category: 'Legs', description: 'Lower body strength exercise', sets: 3, reps: 12 },
        { name: 'Deadlift', category: 'Back', description: 'Full body strength exercise', sets: 3, reps: 8 },
        { name: 'Pull-ups', category: 'Back', description: 'Upper body pulling exercise', sets: 3, reps: 10 },
        { name: 'Running', category: 'Cardio', description: 'Cardiovascular exercise', duration: 30 }
      ]

      for (const exercise of exercises) {
        await addItem(STORES.EXERCISES, exercise)
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}

export { STORES }

