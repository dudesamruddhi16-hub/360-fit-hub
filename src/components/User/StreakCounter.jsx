import { useAuth } from '../../context/AuthContext';
import { Card, ProgressBar } from 'react-bootstrap';

const StreakCounter = () => {
    const { user } = useAuth();

    const currentStreak = user?.streak || 0;
    const points = user?.points || 0;
    const nextMilestone = Math.ceil((currentStreak + 1) / 7) * 7; // Next multiple of 7
    const maxStreak = currentStreak; // Placeholder as we don't track max streak yet

    return (
        <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">
                        <i className="bi bi-fire text-danger me-2"></i>
                        Streak
                    </h5>
                    <span className="badge bg-danger rounded-pill">{currentStreak} Days</span>
                </div>
                <p className="text-muted small mb-2">You're on fire! Keep it up to reach {nextMilestone} days.</p>
                <ProgressBar now={(currentStreak / nextMilestone) * 100} variant="danger" style={{ height: '8px' }} />
                <div className="mt-3 d-flex justify-content-between text-muted small">
                    <span>Best: {maxStreak} days</span>
                    <span>Next Goal: {nextMilestone} days</span>
                </div>
            </Card.Body>
        </Card>
    );
};

export default StreakCounter;
