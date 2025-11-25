const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    trainerId: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    exercises: [{
        exerciseId: mongoose.Schema.Types.ObjectId,
        sets: Number,
        reps: Number,
        duration: Number
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkoutPlan', workoutSchema);
