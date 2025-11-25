const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: String,
    price: Number,
    duration: Number,
    features: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MembershipPlan', planSchema);
