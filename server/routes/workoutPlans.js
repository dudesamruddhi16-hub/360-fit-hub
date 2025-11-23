const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove } = require('../controllers/genericController');
const { models } = require('../models');
const { verifyToken } = require('../middleware/auth');

const WorkoutPlan = models.WorkoutPlan;

router.get('/', verifyToken, getAll(WorkoutPlan));
router.get('/:id', verifyToken, getById(WorkoutPlan));
router.post('/', verifyToken, create(WorkoutPlan));
router.put('/:id', verifyToken, update(WorkoutPlan));
router.delete('/:id', verifyToken, remove(WorkoutPlan));

module.exports = router;
