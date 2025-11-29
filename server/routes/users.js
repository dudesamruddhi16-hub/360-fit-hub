const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, queryByField } = require('../controllers/genericController');
const { models } = require('../models');

router.get('/query', queryByField(models.User));
router.get('/leaderboard', async (req, res) => {
    try {
        const leaders = await models.User.find({})
            .sort({ points: -1 })
            .limit(10)
            .select('name points role');
        res.json(leaders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/', getAll(models.User));
router.get('/:id', getById(models.User));
router.post('/', create(models.User));
router.put('/:id', update(models.User));
router.delete('/:id', remove(models.User));

module.exports = router;
