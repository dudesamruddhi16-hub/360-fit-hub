const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    trainerId: mongoose.Schema.Types.ObjectId,
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrainerAssignment', assignmentSchema);
