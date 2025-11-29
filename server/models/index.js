const User = require('./User');
const Membership = require('./Membership');
const MembershipPlan = require('./MembershipPlan');
const DietPlan = require('./DietPlan');
const WorkoutPlan = require('./WorkoutPlan');
const Exercise = require('./Exercise');
const Progress = require('./Progress');
const Payment = require('./Payment');
const TrainerAssignment = require('./TrainerAssignment');
const Wellness = require('./wellness');

// Seed initial data (similar to indexedDB seed)
const seedInitialData = async () => {
    try {
        const usersCount = await User.countDocuments()

        // Ensure specific admin user exists
        const specificUser = await User.findOne({ email: 'yogesh@gym.com' })
        if (!specificUser) {
            await User.create({
                email: 'yogesh@gym.com',
                password: 'yogesh123',
                name: 'Gym Owner',
                role: 'admin',
                phone: '9623002470',
                age: 34
            })
            console.log('Seeded specific user: yogesh@gym.com')
        }

        if (usersCount > 0) return

        // Create users
        const admin = await User.create({ email: 'admin@gym.com', password: 'admin123', name: 'Admin User', role: 'admin', phone: '1234567890' })
        const trainer = await User.create({ email: 'trainer@gym.com', password: 'trainer123', name: 'John Trainer', role: 'trainer', phone: '1234567891', specialization: 'Weight Training', experience: '5 years' })
        const user = await User.create({ email: 'user@gym.com', password: 'user123', name: 'Test User', role: 'user', phone: '1234567892', age: 25, weight: 70, height: 175 })

        // Membership plans
        const plans = await MembershipPlan.insertMany([
            { name: 'Basic Plan', price: 29.99, duration: 30, features: ['Gym Access', 'Basic Equipment'] },
            { name: 'Premium Plan', price: 49.99, duration: 30, features: ['Gym Access', 'All Equipment', 'Group Classes'] },
            { name: 'VIP Plan', price: 79.99, duration: 30, features: ['Gym Access', 'All Equipment', 'Group Classes', 'Personal Trainer', 'Nutrition Plan'] }
        ])

        // Exercises
        await Exercise.insertMany([
            { name: 'Bench Press', category: 'Chest', description: 'Upper body strength exercise', sets: 3, reps: 10 },
            { name: 'Squats', category: 'Legs', description: 'Lower body strength exercise', sets: 3, reps: 12 },
            { name: 'Deadlift', category: 'Back', description: 'Full body strength exercise', sets: 3, reps: 8 },
            { name: 'Pull-ups', category: 'Back', description: 'Upper body pulling exercise', sets: 3, reps: 10 },
            { name: 'Running', category: 'Cardio', description: 'Cardiovascular exercise', duration: 30 }
        ])

        // Example membership for test user (link to first plan)
        if (plans && plans.length) {
            await Membership.create({
                userId: user._id,
                planId: plans[0]._id,
                status: 'active',
                startDate: new Date(),
                endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // +30 days
            })
        }

        // Example trainer assignment
        await TrainerAssignment.create({ userId: user._id, trainerId: trainer._id })

        // Seed Wellness Videos
        const videos = [
            {
                title: "10-Minute Morning Yoga",
                thumbnail: "https://img.youtube.com/vi/VaoV1PrYft4/maxresdefault.jpg",
                duration: "10 min",
                category: "Flexibility",
                url: "https://www.youtube.com/embed/VaoV1PrYft4"
            },
            {
                title: "Quick Full Body HIIT",
                thumbnail: "https://img.youtube.com/vi/ml6cT4AZdqI/maxresdefault.jpg",
                duration: "15 min",
                category: "Cardio",
                url: "https://www.youtube.com/embed/ml6cT4AZdqI"
            },
            {
                title: "Meditation for Stress",
                thumbnail: "https://img.youtube.com/vi/inpok4MKVLM/maxresdefault.jpg",
                duration: "5 min",
                category: "Mental Health",
                url: "https://www.youtube.com/embed/inpok4MKVLM"
            }
        ];

        // Check if videos exist before inserting to avoid duplicates on restart
        const videoCount = await Wellness.countDocuments();
        if (videoCount === 0) {
            await Wellness.insertMany(videos);
            console.log('Wellness Videos seeded');
        }

        // Update Exercises with difficulty and muscleGroup
        const exerciseUpdates = [
            { name: 'Bench Press', difficulty: 'intermediate', muscleGroup: 'Chest' },
            { name: 'Squats', difficulty: 'intermediate', muscleGroup: 'Legs' },
            { name: 'Deadlift', difficulty: 'advanced', muscleGroup: 'Back' },
            { name: 'Pull-ups', difficulty: 'intermediate', muscleGroup: 'Back' },
            { name: 'Running', difficulty: 'beginner', muscleGroup: 'Legs' },
            { name: 'Push-ups', difficulty: 'beginner', muscleGroup: 'Chest' },
            { name: 'Plank', difficulty: 'beginner', muscleGroup: 'Core' },
            { name: 'Lunges', difficulty: 'beginner', muscleGroup: 'Legs' }
        ];

        for (const ex of exerciseUpdates) {
            await Exercise.updateOne(
                { name: ex.name },
                { $set: { difficulty: ex.difficulty, muscleGroup: ex.muscleGroup } },
                { upsert: true }
            );
        }
        console.log('Exercises updated with new fields');

        // Update Users with random points for leaderboard if not set
        const usersToUpdate = await User.find({ points: { $exists: false } });
        for (const u of usersToUpdate) {
            const points = Math.floor(Math.random() * 5000);
            await User.updateOne({ _id: u._id }, { $set: { points, streak: Math.floor(Math.random() * 10) } });
        }
        if (usersToUpdate.length > 0) console.log('Users updated with points');

        console.log('SeedInitialData: inserted users, plans, exercises, membership, assignment, wellness videos')
    } catch (err) {
        // ignore duplicate key errors during re-seed attempt
        if (err.code === 11000) {
            console.warn('Seed skipped duplicate keys:', err.keyValue)
            return
        }
        console.error('Error in seedInitialData:', err)
        throw err
    }
}

const models = {
    User,
    Membership,
    MembershipPlan,
    DietPlan,
    WorkoutPlan,
    Exercise,
    Progress,
    Payment,
    TrainerAssignment,
    Wellness
};

console.log('DEBUG: Exporting models from index.js:', Object.keys(models));
module.exports = { models, seedInitialData };
