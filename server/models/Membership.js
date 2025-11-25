const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    planId: mongoose.Schema.Types.ObjectId,
    planName: String,
    price: Number,
    status: String,
    startDate: Date,
    endDate: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Membership', membershipSchema);
