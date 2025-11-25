const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, queryByField } = require('../controllers/genericController');
const { models } = require('../models');

router.get('/query', queryByField(models.Payment));
router.get('/', getAll(models.Payment));
router.get('/:id', getById(models.Payment));
router.post('/', create(models.Payment));
router.put('/:id', update(models.Payment));
router.delete('/:id', remove(models.Payment));

module.exports = router;
