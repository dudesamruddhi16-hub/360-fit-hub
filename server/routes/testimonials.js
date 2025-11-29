const express = require('express');
const router = express.Router();
const { getAll, create } = require('../controllers/genericController');
const { models } = require('../models');
const { isAuthenticated: authenticate } = require('../middleware/auth');

// Get all approved testimonials (public)
router.get('/', async (req, res) => {
    try {
        const testimonials = await models.Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get current user's testimonials (authenticated)
router.get('/my', authenticate, async (req, res) => {
    try {
        const testimonials = await models.Testimonial.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new testimonial (authenticated)
router.post('/', authenticate, async (req, res) => {
    try {
        const { rating, feedback } = req.body;

        if (!rating || !feedback) {
            return res.status(400).json({ error: 'Rating and feedback are required' });
        }

        const testimonial = await models.Testimonial.create({
            userId: req.user._id,
            name: req.user.name,
            role: req.user.role === 'user' ? 'Member' : req.user.role === 'trainer' ? 'Trainer' : 'Member',
            rating,
            feedback,
            isApproved: false // Requires admin approval
        });

        res.status(201).json(testimonial);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get pending testimonials (admin only)
router.get('/pending', authenticate, async (req, res) => {
    try {
        console.log('GET /pending called by user:', req.user._id, 'Role:', req.user.role);
        if (req.user.role !== 'admin') {
            console.log('Access denied: User is not admin');
            return res.status(403).json({ error: 'Admin access required' });
        }
        const testimonials = await models.Testimonial.find({ isApproved: false }).sort({ createdAt: -1 });
        console.log('Found pending testimonials:', testimonials.length);
        res.json(testimonials);
    } catch (err) {
        console.error('Error in GET /pending:', err);
        res.status(500).json({ error: err.message });
    }
});

// Approve testimonial (admin only)
router.patch('/:id/approve', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Find the testimonial to be approved
        const testimonialToApprove = await models.Testimonial.findById(req.params.id);
        if (!testimonialToApprove) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }

        // Delete all other testimonials by this user (approved or pending)
        // This ensures only the latest approved one remains
        await models.Testimonial.deleteMany({
            userId: testimonialToApprove.userId,
            _id: { $ne: testimonialToApprove._id }
        });

        // Approve the current one
        testimonialToApprove.isApproved = true;
        await testimonialToApprove.save();

        res.json(testimonialToApprove);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reject/Delete testimonial (admin only)
router.delete('/:id/reject', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const testimonial = await models.Testimonial.findByIdAndDelete(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }
        res.json({ message: 'Testimonial rejected and deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
