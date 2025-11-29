const mongoose = require('mongoose');

const wellnessSchema = new mongoose.Schema({
    title: { type: String },
    thumbnail: { type: String },
    duration: { type: String },
    category: { type: String },
    url: { type: String }, // YouTube ID or URL
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Wellness', wellnessSchema);
