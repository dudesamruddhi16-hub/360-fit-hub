const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const membershipRoutes = require('./memberships');
const membershipPlanRoutes = require('./membershipPlans');
const dietPlanRoutes = require('./dietPlans');
const workoutPlanRoutes = require('./workoutPlans');
const exerciseRoutes = require('./exercises');
const progressRoutes = require('./progress');
const paymentRoutes = require('./payments');
const trainerAssignmentRoutes = require('./trainerAssignments');
const wellnessRoutes = require('./wellness');
const seedRoutes = require('./seed');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/memberships', membershipRoutes);
router.use('/membershipPlans', membershipPlanRoutes);
router.use('/dietPlans', dietPlanRoutes);
router.use('/dietplans', dietPlanRoutes); // Support both casing
router.use('/workoutPlans', workoutPlanRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/progress', progressRoutes);
router.use('/payments', paymentRoutes);
router.use('/trainerAssignments', trainerAssignmentRoutes);
router.use('/wellness', wellnessRoutes);
router.use('/seed', seedRoutes);

module.exports = router;
