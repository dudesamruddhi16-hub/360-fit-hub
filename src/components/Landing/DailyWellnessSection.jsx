import React from 'react';
import { Container, Row, Col, Card, Badge, Modal, Button } from 'react-bootstrap';
import { wellnessService } from '../../services';

const DailyWellnessSection = () => {
    const [videos, setVideos] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showModal, setShowModal] = React.useState(false);
    const [selectedVideo, setSelectedVideo] = React.useState(null);

    React.useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                const data = await wellnessService.getAll();
                setVideos(data);
            } catch (error) {
                console.error('Error fetching wellness videos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

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
            <section className="py-5 bg-light">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-bold mb-3">Daily Wellness</h2>
                        <p className="lead text-muted">Stay healthy with minimal exercise. Perfect for your busy schedule.</p>
                    </div>
                    <Row>
                        {videos.map(video => (
                            <Col key={video._id} md={4} className="mb-4">
                                <Card
                                    className="h-100 shadow-sm border-0 hover-lift"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleVideoClick(video)}
                                >
                                    <div className="position-relative">
                                        <Card.Img variant="top" src={video.thumbnail} alt={video.title} />
                                        <Badge bg="primary" className="position-absolute bottom-0 end-0 m-2">
                                            {video.duration}
                                        </Badge>
                                        <div className="position-absolute top-50 start-50 translate-middle">
                                            <div
                                                className="bg-dark bg-opacity-75 rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ width: '60px', height: '60px' }}
                                            >
                                                <i className="bi bi-play-fill text-white" style={{ fontSize: '2rem' }}></i>
                                            </div>
                                        </div>
                                    </div>
                                    <Card.Body>
                                        <Badge bg="info" className="mb-2">{video.category}</Badge>
                                        <Card.Title>{video.title}</Card.Title>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Video Player Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedVideo?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedVideo && (
                        <div className="ratio ratio-16x9">
                            <iframe
                                src={selectedVideo.url}
                                title={selectedVideo.title}
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            ></iframe>
                        </div>
                    )}
                    <div className="mt-3">
                        <Badge bg="info" className="me-2">{selectedVideo?.category}</Badge>
                        <Badge bg="primary">{selectedVideo?.duration}</Badge>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default DailyWellnessSection;
