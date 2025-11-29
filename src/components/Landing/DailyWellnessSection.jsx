import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { wellnessService } from '../../services';

const DailyWellnessSection = () => {
    const [videos, setVideos] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

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

    return (
        <section className="py-5 bg-light">
            <Container>
                <div className="text-center mb-5">
                    <h2 className="display-5 fw-bold mb-3">Daily Wellness</h2>
                    <p className="lead text-muted">Stay healthy with minimal exercise. Perfect for your busy schedule.</p>
                </div>
                <Row>
                    {videos.map(video => (
                        <Col key={video.id} md={4} className="mb-4">
                            <Card className="h-100 shadow-sm border-0 hover-lift">
                                <div className="position-relative">
                                    <Card.Img variant="top" src={video.thumbnail} alt={video.title} />
                                    <Badge bg="primary" className="position-absolute bottom-0 end-0 m-2">
                                        {video.duration}
                                    </Badge>
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
    );
};

export default DailyWellnessSection;
