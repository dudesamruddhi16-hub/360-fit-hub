const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, queryByField } = require('../controllers/genericController');
const { models } = require('../models');

router.get('/query', queryByField(models.TrainerAssignment));
router.get('/', getAll(models.TrainerAssignment));
router.get('/:id', getById(models.TrainerAssignment));
router.post('/', create(models.TrainerAssignment));
router.put('/:id', update(models.TrainerAssignment));
router.delete('/:id', remove(models.TrainerAssignment));

module.exports = router;
