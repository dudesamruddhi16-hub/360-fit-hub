# Gym Management System

A comprehensive Gym Management System built with React.js, Bootstrap, and mongoDB. This system provides separate dashboards for Admin, Trainer, and User roles with complete gym management features.

## Features

### 1. Secure Login and Logout
- Role-based authentication system
- Secure session management
- Automatic role-based routing

### 2. Separate Profiles and Dashboards
- **Admin Dashboard**: Manage members, trainers, membership plans, and payments
- **Trainer Dashboard**: Manage clients, create workout and diet plans
- **User Dashboard**: View membership, workouts, diet plans, track progress, and make payments

### 3. Personal Dashboard
- Role-specific dashboards with relevant statistics
- Quick access to key features
- Overview of current status

### 4. Flexible Membership Plans
- Create and manage multiple membership plans
- Different pricing tiers and durations
- Feature-based plan comparison

### 5. Personalized Diet Plans
- Trainers can create customized diet plans for clients
- Meal planning with calories and timing
- Multiple meal types (Breakfast, Lunch, Dinner, Snacks)

### 6. Exercise and Workout Plans
- Comprehensive exercise library
- Create personalized workout plans
- Track sets, reps, and duration
- Exercise categorization

### 7. Personal Trainer Guidance
- Trainer-client assignment system
- Personalized workout and diet plan creation
- Direct communication through plans

### 8. Easy Online Payment
- Secure payment processing interface
- Payment history tracking
- Multiple payment methods support
- Transaction management

### 9. Progress Tracking
- Track weight, body fat, muscle mass
- Date-based progress entries
- Notes and comments
- Historical progress visualization

## Technology Stack

- **Frontend**: React.js 18
- **UI Framework**: Bootstrap 5.3.2, React Bootstrap 2.9.1
- **Icons**: Bootstrap Icons 1.11.2
- **Backend**: IndexedDB (Browser-based database)
- **Build Tool**: Vite 5.0.8
- **Routing**: React Router DOM 6.20.0

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Default Login Credentials

### Admin
- **Email**: admin@gym.com
- **Password**: admin123

### Trainer
- **Email**: trainer@gym.com
- **Password**: trainer123

### User
- **Email**: user@gym.com
- **Password**: user123

## Project Structure

```
gym-management-system/
├── src/
│   ├── components/
│   │   ├── Admin/          # Admin dashboard components
│   │   ├── Trainer/        # Trainer dashboard components
│   │   ├── User/           # User dashboard components
│   │   ├── Auth/           # Authentication components
│   │   └── Dashboard/      # Dashboard layouts
│   ├── context/
│   │   └── AuthContext.jsx # Authentication context
│   ├── db/
│   │   └── indexedDB.js    # IndexedDB setup and operations
│   ├── App.jsx             # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Database Schema

The system uses IndexedDB with the following stores:

- **users**: User accounts (admin, trainer, user)
- **memberships**: User membership subscriptions
- **membershipPlans**: Available membership plans
- **dietPlans**: Personalized diet plans
- **workoutPlans**: Personalized workout plans
- **exercises**: Exercise library
- **progress**: User progress tracking entries
- **payments**: Payment transactions
- **trainerAssignments**: Trainer-client relationships

## Features by Role

### Admin
- View dashboard statistics
- Manage members (add, edit, delete)
- Manage trainers (add, edit, delete)
- Create and manage membership plans
- View all payment transactions

### Trainer
- View assigned clients
- Create personalized workout plans
- Create personalized diet plans
- View client statistics

### User
- View and subscribe to membership plans
- View assigned workout plans
- View assigned diet plans
- Track personal progress
- Make payments for memberships
- View payment history

## Usage Guide

1. **Login**: Use one of the default credentials to login
2. **Admin**: Navigate to different sections using the top navigation
3. **Trainer**: Assign clients, then create workout and diet plans
4. **User**: Subscribe to a membership plan, then access all features

## Notes

- All data is stored locally in the browser using IndexedDB
- Data persists across browser sessions
- This is a demo system - in production, implement proper password hashing
- Payment system is simulated for demonstration purposes

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## License

This project is open source and available for educational purposes.

## API Routes (implemented in server.js)

Below are the API routes implemented in server.js. The server exposes generic CRUD endpoints that map a :store param to Mongoose models. Available stores: users, memberships, membershipPlans, dietPlans, workoutPlans, exercises, progress, payments, trainerAssignments.

- GET /api/:store
  - Purpose: list documents (optionally accepts query params to filter)
  - Example: GET http://localhost:5000/api/users

- GET /api/:store/query?field=FIELD&value=VALUE
  - Purpose: search by a given field (supports case-insensitive string matching; validates id-like fields)
  - Query params: field (required), value (required)
  - Example: GET http://localhost:5000/api/users/query?field=email&value=admin@gym.com

- GET /api/:store/:id
  - Purpose: get a single document by _id
  - URL param: id (validated as ObjectId)
  - Example: GET http://localhost:5000/api/users/691f6746dbf69a4b6d4fd952

- POST /api/:store
  - Purpose: create a new document in the store
  - Body: JSON document matching the model
  - Example: POST http://localhost:5000/api/users  { "email": "...", "name": "..." }

- PUT /api/:store/:id
  - Purpose: update document by id (returns updated document)
  - URL param: id
  - Body: JSON with fields to update
  - Example: PUT http://localhost:5000/api/users/691f6746...  { "name": "New" }

- DELETE /api/:store/:id
  - Purpose: delete document by id
  - URL param: id
  - Example: DELETE http://localhost:5000/api/users/691f6746...

- POST /api/seed
  - Purpose: populate the database with initial demo data (users, plans, exercises, etc.)
  - Example: POST http://localhost:5000/api/seed

Socket / realtime
- Socket.io is initialized in server.js (io.on('connection', ...)). The server accepts socket connections for realtime features. See server.js for event names and handlers.

Notes
- The `/api/:store/query` route must be defined before `/api/:store/:id` to avoid ObjectId cast errors (server.js includes this ordering and id validation).
- If collections appear under the wrong DB, set `MONGO_DB_NAME=360fit` in `server/.env` or include the DB name in `MONGO_URI`.
- Use the frontend API adapter (src/db/indexedDB.js) which now proxies to these backend routes via axios — this preserves the previous frontend API surface while using MongoDB.



