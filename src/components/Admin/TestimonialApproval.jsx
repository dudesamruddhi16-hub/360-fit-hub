import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import { testimonialsService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { SkeletonTable } from '../Common/Skeleton';

const TestimonialApproval = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

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
            addToast('Failed to load testimonials', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await testimonialsService.approve(id);
            addToast('Testimonial approved successfully!', 'success');
            loadPendingTestimonials();
        } catch (error) {
            addToast('Failed to approve testimonial', 'danger');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject and delete this testimonial?')) {
            return;
        }
        try {
            await testimonialsService.reject(id);
            addToast('Testimonial rejected and deleted', 'warning');
            loadPendingTestimonials();
        } catch (error) {
            addToast('Failed to reject testimonial', 'danger');
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
                {loading ? (
                    <SkeletonTable rows={3} />
                ) : testimonials.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-check-circle empty-state-icon text-success"></i>
                        <div className="empty-state-title">All Clear!</div>
                        <p className="empty-state-text">No pending testimonials to review at the moment.</p>
                    </div>
                ) : (
                    <Table responsive hover className="fade-in-up">
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
