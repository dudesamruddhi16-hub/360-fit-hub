const express = require('express');
const router = express.Router();
const { getAll } = require('../controllers/genericController');
const { models } = require('../models');
console.log('DEBUG: Imported models in wellness route:', models ? Object.keys(models) : 'models is undefined');
console.log('DEBUG: models.Wellness:', models ? models.Wellness : 'N/A');

// Get all wellness videos
router.get('/', getAll(models.Wellness));

module.exports = router;
