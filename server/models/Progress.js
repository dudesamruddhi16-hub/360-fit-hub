const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    date: { type: Date, default: Date.now },
    weight: Number,
    bodyFat: Number,
    muscleMass: Number,
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);
