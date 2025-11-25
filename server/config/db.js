const mongoose = require('mongoose');
const { models, seedInitialData } = require('../models');

const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        console.error('MONGO_URI not set in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: process.env.MONGO_DB_NAME || '360fit',
            serverSelectionTimeoutMS: 20000
        });
        console.log('MongoDB connected');

        await Promise.all(Object.values(models).map(m => m.init()));
        console.log('Mongoose models initialized');

        await seedInitialData();
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
