const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, queryByField } = require('../controllers/genericController');
const { models } = require('../models');

router.get('/query', queryByField(models.Membership));
router.get('/', getAll(models.Membership));
router.get('/:id', getById(models.Membership));
router.post('/', create(models.Membership));
router.put('/:id', update(models.Membership));
router.delete('/:id', remove(models.Membership));

module.exports = router;
