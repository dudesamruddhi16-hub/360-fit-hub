import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';

const LeaderboardPreview = () => {
    const [leaders, setLeaders] = React.useState([]);

    React.useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { apiClient } = await import('../../services/api');
                const data = await apiClient.get('/users/leaderboard');
                // Add rank to data
                const rankedData = data.map((user, index) => ({
                    ...user,
                    rank: index + 1
                }));
                setLeaders(rankedData);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white border-0 pt-3">
                <h5 className="mb-0">
                    <i className="bi bi-trophy-fill text-warning me-2"></i>
                    Leaderboard
                </h5>
            </Card.Header>
            <ListGroup variant="flush">
                {leaders.map((leader) => (
                    <ListGroup.Item key={leader.id} className="d-flex justify-content-between align-items-center border-0">
                        <div className="d-flex align-items-center">
                            <span className={`badge rounded-circle me-3 ${leader.rank === 1 ? 'bg-warning' : leader.rank === 2 ? 'bg-secondary' : 'bg-info'}`} style={{ width: '25px', height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {leader.rank}
                            </span>
                            <span className={leader.name === 'You' ? 'fw-bold' : ''}>{leader.name}</span>
                        </div>
                        <Badge bg="light" text="dark" className="border">
                            {leader.points} pts
                        </Badge>
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <Card.Footer className="bg-white border-0 text-center pb-3">
                <a href="#" className="text-decoration-none small">View Full Leaderboard</a>
            </Card.Footer>
        </Card>
    );
};

export default LeaderboardPreview;
