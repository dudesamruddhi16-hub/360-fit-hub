import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

const AIWorkoutGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState(null);
    const [formData, setFormData] = useState({
        goal: 'weight_loss',
        level: 'beginner',
        duration: '15'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPlan(null);

        try {
            const { apiClient } = await import('../../services/api');
            const data = await apiClient.post('/workoutPlans/generate', formData);
            setPlan(data);
        } catch (error) {
            console.error('Error generating workout:', error);
            // Fallback or error handling could be added here
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                    <i className="bi bi-robot me-2"></i>
                    AI Workout Generator
                </h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Fitness Goal</Form.Label>
                        <Form.Select
                            value={formData.goal}
                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                        >
                            <option value="weight_loss">Weight Loss</option>
                            <option value="muscle_gain">Muscle Gain</option>
                            <option value="endurance">Endurance</option>
                            <option value="flexibility">Flexibility</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Fitness Level</Form.Label>
                        <Form.Select
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Duration (minutes)</Form.Label>
                        <Form.Select
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        >
                            <option value="10">10 Minutes</option>
                            <option value="15">15 Minutes</option>
                            <option value="30">30 Minutes</option>
                            <option value="45">45 Minutes</option>
                        </Form.Select>
                    </Form.Group>
                    <div className="d-grid">
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Generating Plan...
                                </>
                            ) : (
                                'Generate Workout'
                            )}
                        </Button>
                    </div>
                </Form>

                {plan && (
                    <div className="mt-4 fade-in">
                        <Alert variant="success">
                            <Alert.Heading className="h6">{plan.title}</Alert.Heading>
                            <hr />
                            <ul className="mb-0 list-unstyled">
                                {plan.exercises.map((ex, idx) => (
                                    <li key={idx} className="mb-2">
                                        <strong>{ex.name}:</strong> {ex.sets} sets x {ex.reps}
                                    </li>
                                ))}
                            </ul>
                        </Alert>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default AIWorkoutGenerator;
