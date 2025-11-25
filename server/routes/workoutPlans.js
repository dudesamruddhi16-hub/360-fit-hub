const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, queryByField } = require('../controllers/genericController');
const { models } = require('../models');

router.get('/query', queryByField(models.WorkoutPlan));
router.get('/', getAll(models.WorkoutPlan));
router.get('/:id', getById(models.WorkoutPlan));
router.post('/', create(models.WorkoutPlan));
router.put('/:id', update(models.WorkoutPlan));
router.delete('/:id', remove(models.WorkoutPlan));

module.exports = router;
