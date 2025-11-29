const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, queryByField } = require('../controllers/genericController');
const { models } = require('../models');

router.get('/query', queryByField(models.WorkoutPlan));
router.get('/', getAll(models.WorkoutPlan));
router.get('/:id', getById(models.WorkoutPlan));
router.post('/', create(models.WorkoutPlan));
router.post('/generate', async (req, res) => {
    try {
        const { goal, level, duration } = req.body;

        // Map goal to muscle groups or categories (simplified logic)
        let categoryFilter = {};
        if (goal === 'weight_loss') categoryFilter = { category: 'Cardio' };
        else if (goal === 'muscle_gain') categoryFilter = { category: { $ne: 'Cardio' } };

        // Map level to difficulty
        const difficultyFilter = { difficulty: level };

        // Find matching exercises
        let exercises = await models.Exercise.find({
            ...categoryFilter,
            ...difficultyFilter
        }).limit(5);

        // If not enough specific exercises, relax filters
        if (exercises.length < 3) {
            exercises = await models.Exercise.find({}).limit(5);
        }

        // Construct a simple plan
        const plan = {
            title: `AI Generated ${duration}-Min ${goal.replace('_', ' ')} Plan`,
            exercises: exercises.map(ex => ({
                name: ex.name,
                sets: ex.sets || 3,
                reps: ex.reps || 10
            }))
        };

        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', update(models.WorkoutPlan));
router.delete('/:id', remove(models.WorkoutPlan));

module.exports = router;
