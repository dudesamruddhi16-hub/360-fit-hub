import React from 'react';
import { Container, Row, Col, Card, Badge, Modal, Button } from 'react-bootstrap';

const MinimalFitnessSection = () => {
    const [showModal, setShowModal] = React.useState(false);
    const [selectedVideo, setSelectedVideo] = React.useState(null);

    // Sample workout videos - can be replaced with API data
    const workoutVideos = [
        {
            id: 1,
            title: "15-Min Full Body HIIT",
            thumbnail: "https://img.youtube.com/vi/ml6cT4AZdqI/maxresdefault.jpg",
            duration: "15 min",
            category: "HIIT",
            level: "Intermediate",
            url: "https://www.youtube.com/embed/ml6cT4AZdqI"
        },
        {
            id: 2,
            title: "No Equipment Home Workout",
            thumbnail: "https://img.youtube.com/vi/vc1E5CfRfos/maxresdefault.jpg",
            duration: "20 min",
            category: "Bodyweight",
            level: "Beginner",
            url: "https://www.youtube.com/embed/vc1E5CfRfos"
        },
        {
            id: 3,
            title: "Quick Morning Stretch",
            thumbnail: "https://img.youtube.com/vi/g_tea8ZNk5A/maxresdefault.jpg",
            duration: "10 min",
            category: "Flexibility",
            level: "All Levels",
            url: "https://www.youtube.com/embed/g_tea8ZNk5A"
        }
    ];

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedVideo(null);
    };

    return (
        <>
            <section className="py-5 bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Container>
                    <div className="text-center text-white mb-5">
                        <h2 className="display-4 fw-bold mb-3 text-dark">Minimalist Fitness Revolution</h2>
                        <p className="lead fs-5">
                            Transform your body with zero equipment. Just 15 minutes a day.
                        </p>
                    </div>

                    <Row className="g-4 mb-5">
                        {workoutVideos.map(video => (
                            <Col key={video.id} md={4}>
                                <Card
                                    className="h-100 border-0 shadow-lg overflow-hidden workout-card"
                                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                    onClick={() => handleVideoClick(video)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-10px)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                                    }}
                                >
                                    <div className="position-relative">
                                        <Card.Img
                                            variant="top"
                                            src={video.thumbnail}
                                            alt={video.title}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                            style={{ background: 'rgba(0,0,0,0.3)' }}>
                                            <div
                                                className="bg-white bg-opacity-90 rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ width: '70px', height: '70px' }}
                                            >
                                                <i className="bi bi-play-fill text-primary" style={{ fontSize: '2.5rem' }}></i>
                                            </div>
                                        </div>
                                        <Badge bg="dark" className="position-absolute top-0 end-0 m-2">
                                            {video.duration}
                                        </Badge>
                                        <Badge bg="warning" text="dark" className="position-absolute top-0 start-0 m-2">
                                            {video.level}
                                        </Badge>
                                    </div>
                                    <Card.Body className="bg-white">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <Badge bg="primary" className="mb-2">{video.category}</Badge>
                                        </div>
                                        <Card.Title className="fw-bold">{video.title}</Card.Title>
                                        <div className="d-flex align-items-center text-muted small mt-3">
                                            <i className="bi bi-fire me-2"></i>
                                            <span>High intensity workout</span>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <div className="text-center">
                        <Row className="justify-content-center text-dark">
                            <Col md={4} className="mb-3">
                                <div className="p-4">
                                    <i className="bi bi-clock-fill display-4 mb-3"></i>
                                    <h5 className="fw-bold">15 Minutes Daily</h5>
                                    <p className="small">Science-backed workouts</p>
                                </div>
                            </Col>
                            <Col md={4} className="mb-3">
                                <div className="p-4">
                                    <i className="bi bi-house-fill display-4 mb-3"></i>
                                    <h5 className="fw-bold">No Equipment</h5>
                                    <p className="small">Train anywhere, anytime</p>
                                </div>
                            </Col>
                            <Col md={4} className="mb-3">
                                <div className="p-4">
                                    <i className="bi bi-graph-up-arrow display-4 mb-3"></i>
                                    <h5 className="fw-bold">Track Progress</h5>
                                    <p className="small">See real results</p>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </section>

            {/* Video Player Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title>{selectedVideo?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    {selectedVideo && (
                        <>
                            <div className="ratio ratio-16x9">
                                <iframe
                                    src={selectedVideo.url}
                                    title={selectedVideo.title}
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                ></iframe>
                            </div>
                            <div className="p-4">
                                <div className="d-flex gap-2 mb-3">
                                    <Badge bg="primary">{selectedVideo?.category}</Badge>
                                    <Badge bg="dark">{selectedVideo?.duration}</Badge>
                                    <Badge bg="warning" text="dark">{selectedVideo?.level}</Badge>
                                </div>
                                <p className="text-muted mb-0">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Follow along with the instructor and maintain proper form throughout the workout.
                                </p>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="primary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MinimalFitnessSection;
