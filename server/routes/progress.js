const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, queryByField } = require('../controllers/genericController');
const { models } = require('../models');

router.get('/query', queryByField(models.Progress));
router.get('/', getAll(models.Progress));
router.get('/:id', getById(models.Progress));
router.post('/', create(models.Progress));
router.put('/:id', update(models.Progress));
router.delete('/:id', remove(models.Progress));

module.exports = router;
