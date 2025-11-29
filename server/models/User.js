const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    name: String,
    role: String,
    phone: String,
    age: Number,
    weight: Number,
    height: Number,
    specialization: String,
    experience: String,
    token: String,
    streak: { type: Number, default: 0 },
    lastLogin: { type: Date },
    points: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
