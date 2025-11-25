const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: String,
    category: String,
    description: String,
    sets: Number,
    reps: Number,
    duration: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exercise', exerciseSchema);
