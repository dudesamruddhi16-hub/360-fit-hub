const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, queryByField } = require('../controllers/genericController');
const { models } = require('../models');

router.get('/query', queryByField(models.Exercise));
router.get('/', getAll(models.Exercise));
router.get('/:id', getById(models.Exercise));
router.post('/', create(models.Exercise));
router.put('/:id', update(models.Exercise));
router.delete('/:id', remove(models.Exercise));

module.exports = router;
