const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, queryByField } = require('../controllers/genericController');
const { models } = require('../models');

router.get('/query', queryByField(models.MembershipPlan));
router.get('/', getAll(models.MembershipPlan));
router.get('/:id', getById(models.MembershipPlan));
router.post('/', create(models.MembershipPlan));
router.put('/:id', update(models.MembershipPlan));
router.delete('/:id', remove(models.MembershipPlan));

module.exports = router;
