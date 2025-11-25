const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, queryByField } = require('../controllers/genericController');
const { models } = require('../models');

router.get('/query', queryByField(models.User));
router.get('/', getAll(models.User));
router.get('/:id', getById(models.User));
router.post('/', create(models.User));
router.put('/:id', update(models.User));
router.delete('/:id', remove(models.User));

module.exports = router;
