import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { testimonialsService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const TestimonialForm = ({ onSubmitSuccess }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!feedback.trim()) {
            addToast('Please provide your feedback', 'warning');
            return;
        }

        try {
            setLoading(true);
            await testimonialsService.create({
                name: user.name,
                role: user.role === 'user' ? 'Member' : 'Trainer',
                rating,
                feedback,
                isApproved: false
            });
            addToast('Thank you! Your testimonial has been submitted and is pending approval.', 'success');
            setFeedback('');
            setRating(5);

            // Call parent callback if provided
            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
        } catch (err) {
            console.error('Testimonial submission error:', err);
            addToast(err.response?.data?.error || err.message || 'Failed to submit testimonial', 'danger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-0 shadow-sm">
            <Card.Body>
                <h5 className="mb-4">Share Your Experience</h5>

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Rating</Form.Label>
                        <div className="d-flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                    key={star}
                                    className={`bi bi-star${star <= rating ? '-fill' : ''} text-warning`}
                                    style={{ fontSize: '2rem', cursor: 'pointer' }}
                                    onClick={() => setRating(star)}
                                ></i>
                            ))}
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Your Feedback</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="Tell us about your experience..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Testimonial'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default TestimonialForm;
