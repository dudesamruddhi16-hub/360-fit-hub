const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: String,
    category: String,
    description: String,
    sets: Number,
    reps: Number,
    duration: Number,
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    muscleGroup: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exercise', exerciseSchema);
