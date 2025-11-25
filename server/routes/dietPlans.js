const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, queryByField } = require('../controllers/genericController');
const { models } = require('../models');

router.get('/query', queryByField(models.DietPlan));
router.get('/', getAll(models.DietPlan));
router.get('/:id', getById(models.DietPlan));
router.post('/', create(models.DietPlan));
router.put('/:id', update(models.DietPlan));
router.delete('/:id', remove(models.DietPlan));

module.exports = router;
