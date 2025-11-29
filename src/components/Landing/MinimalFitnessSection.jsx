import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const MinimalFitnessSection = () => {
    return (
        <section className="py-5">
            <Container>
                <Row className="align-items-center">
                    <Col lg={6} className="mb-4 mb-lg-0">
                        <img
                            src="https://placehold.co/600x400/212529/ffffff?text=Minimal+Fitness"
                            alt="Minimal Fitness"
                            className="img-fluid rounded-3 shadow-lg"
                        />
                    </Col>
                    <Col lg={6}>
                        <h2 className="display-5 fw-bold mb-4">Minimalist Fitness</h2>
                        <p className="lead mb-4">
                            No gym? No problem. Discover our scientifically designed workouts that require zero equipment and just 15 minutes of your day.
                        </p>
                        <ul className="list-unstyled mb-4">
                            <li className="mb-2">
                                <i className="bi bi-check-circle-fill text-primary me-2"></i>
                                Bodyweight only exercises
                            </li>
                            <li className="mb-2">
                                <i className="bi bi-check-circle-fill text-primary me-2"></i>
                                High Intensity Interval Training (HIIT)
                            </li>
                            <li className="mb-2">
                                <i className="bi bi-check-circle-fill text-primary me-2"></i>
                                Progress tracking without the hassle
                            </li>
                        </ul>
                        <Button variant="outline-primary" size="lg">Start Your Journey</Button>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default MinimalFitnessSection;
