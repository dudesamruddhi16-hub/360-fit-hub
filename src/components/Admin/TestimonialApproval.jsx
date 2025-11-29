import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Alert } from 'react-bootstrap';
import { testimonialsService } from '../../services';

const TestimonialApproval = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadPendingTestimonials();
    }, []);

    const loadPendingTestimonials = async () => {
        try {
            setLoading(true);
            const data = await testimonialsService.getPending();
            setTestimonials(data);
        } catch (error) {
            console.error('Error loading pending testimonials:', error);
            setMessage({ type: 'danger', text: 'Failed to load testimonials' });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await testimonialsService.approve(id);
            setMessage({ type: 'success', text: 'Testimonial approved successfully!' });
            loadPendingTestimonials();
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to approve testimonial' });
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject and delete this testimonial?')) {
            return;
        }
        try {
            await testimonialsService.reject(id);
            setMessage({ type: 'warning', text: 'Testimonial rejected and deleted' });
            loadPendingTestimonials();
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to reject testimonial' });
        }
    };

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                    <i className="bi bi-chat-quote me-2"></i>
                    Testimonial Approval
                    {testimonials.length > 0 && (
                        <Badge bg="warning" text="dark" className="ms-2">
                            {testimonials.length} Pending
                        </Badge>
                    )}
                </h5>
            </Card.Header>
            <Card.Body>
                {message.text && (
                    <Alert
                        variant={message.type}
                        dismissible
                        onClose={() => setMessage({ type: '', text: '' })}
                    >
                        {message.text}
                    </Alert>
                )}

                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : testimonials.length === 0 ? (
                    <div className="text-center text-muted py-4">
                        <i className="bi bi-check-circle display-1"></i>
                        <p className="mt-3">No pending testimonials to review</p>
                    </div>
                ) : (
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Rating</th>
                                <th>Feedback</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testimonials.map((testimonial) => (
                                <tr key={testimonial._id}>
                                    <td>
                                        <strong>{testimonial.name}</strong>
                                        <br />
                                        <small className="text-muted">{testimonial.role}</small>
                                    </td>
                                    <td>
                                        <div>
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <i key={i} className="bi bi-star-fill text-warning"></i>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ maxWidth: '400px' }}>
                                        <small>"{testimonial.feedback}"</small>
                                    </td>
                                    <td>
                                        <small>{new Date(testimonial.createdAt).toLocaleDateString()}</small>
                                    </td>
                                    <td>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleApprove(testimonial._id)}
                                        >
                                            <i className="bi bi-check-lg"></i> Approve
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleReject(testimonial._id)}
                                        >
                                            <i className="bi bi-x-lg"></i> Reject
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );
};

export default TestimonialApproval;
