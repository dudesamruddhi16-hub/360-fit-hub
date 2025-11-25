const express = require('express');
const router = express.Router();
const { seedInitialData } = require('../models');

router.post('/', async (req, res) => {
    try {
        await seedInitialData();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
