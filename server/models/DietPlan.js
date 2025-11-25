const mongoose = require('mongoose');

const dietSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    trainerId: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    meals: [{
        name: String,
        calories: Number,
        food: String,
        mealType: String,
        time: String
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DietPlan', dietSchema);
