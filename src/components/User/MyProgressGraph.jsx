import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { progressService } from '../../services/progressService';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';

const COLORS_COMPOSITION = ['#36A2EB', '#FF6384', '#FFCE56'];

export default function MyProgressGraph({ userId: propUserId }) {
  const { user } = useAuth();
  const loggedUserId = String(user?.id || user?._id || '');
  const allowedUserId = loggedUserId;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!allowedUserId) {
        setEntries([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await progressService.getByUser(allowedUserId);
        console.log(data);
        if (cancelled) return;
        const sorted = Array.isArray(data)
          ? data.slice().sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))
          : [];
        setEntries(sorted);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.error || err.message || 'Failed to load progress');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    setEntries([]);
    setError(null);
    load();
    return () => { cancelled = true };
  }, [allowedUserId]);

  if (!loggedUserId) {
    return (
      <Alert variant="warning">
        Please sign in to view your progress.
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading progress data...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!entries.length) {
    return (
      <Alert variant="info">
        No progress entries found. Start tracking your progress by adding entries above!
      </Alert>
    );
  }

  // Prepare data for charts
  const chartData = entries.map(entry => ({
    date: new Date(entry.date || entry.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
    weight: entry.weight || null,
    bodyFat: entry.bodyFat || null,
    muscleMass: entry.muscleMass || null
  }));

  // Latest entry for composition pie chart
  const latest = entries[entries.length - 1];
  const hasComposition = typeof latest.muscleMass === 'number' || typeof latest.bodyFat === 'number';

  let compositionData = [];
  if (hasComposition) {
    const muscle = Number(latest.muscleMass) || 0;
    const bodyFat = Number(latest.bodyFat) || 0;
    const other = Math.max(0, 100 - muscle - bodyFat);
    compositionData = [
      { name: 'Muscle Mass', value: muscle },
      { name: 'Body Fat', value: bodyFat },
      { name: 'Other', value: other }
    ];
  }

  // Calculate progress stats
  const firstEntry = entries[0];
  const latestEntry = entries[entries.length - 1];
  const weightChange = latestEntry.weight && firstEntry.weight
    ? (latestEntry.weight - firstEntry.weight).toFixed(1)
    : null;

  return (
    <div>
      {/* Stats Summary */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted mb-2">Current Weight</h6>
              <h3 className="mb-0">{latestEntry.weight || '-'} <small>kg</small></h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted mb-2">Weight Change</h6>
              <h3 className="mb-0" style={{ color: weightChange < 0 ? '#28a745' : weightChange > 0 ? '#dc3545' : '#6c757d' }}>
                {weightChange ? `${weightChange > 0 ? '+' : ''}${weightChange}` : '-'} <small>kg</small>
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted mb-2">Total Entries</h6>
              <h3 className="mb-0">{entries.length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Weight Trend Chart */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Weight Trend</h5>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorWeight)"
                name="Weight (kg)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* Body Composition Line Chart */}
      {hasComposition && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Body Composition Trend</h5>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bodyFat"
                  stroke="#FF6384"
                  strokeWidth={2}
                  name="Body Fat (%)"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="muscleMass"
                  stroke="#36A2EB"
                  strokeWidth={2}
                  name="Muscle Mass (%)"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      )}

      {/* Current Body Composition Pie Chart */}
      {hasComposition && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Current Body Composition</h5>
            <small className="text-muted">
              As of {new Date(latest.date || latest.createdAt).toLocaleDateString()}
            </small>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={compositionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_COMPOSITION[index % COLORS_COMPOSITION.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      )}

      {/* Recent Entries List */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Recent Entries</h5>
        </Card.Header>
        <Card.Body>
          <ul className="list-unstyled mb-0">
            {entries.slice().reverse().slice(0, 5).map((e) => (
              <li key={e.id || e._id} className="mb-2 pb-2 border-bottom">
                <div className="d-flex justify-content-between">
                  <strong>{new Date(e.date || e.createdAt).toLocaleDateString()}</strong>
                  <div>
                    <span className="badge bg-primary me-2">Weight: {e.weight ?? '—'} kg</span>
                    {e.bodyFat && <span className="badge bg-danger me-2">BF: {e.bodyFat}%</span>}
                    {e.muscleMass && <span className="badge bg-info">MM: {e.muscleMass}%</span>}
                  </div>
                </div>
                {e.notes && <small className="text-muted d-block mt-1">{e.notes}</small>}
              </li>
            ))}
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
}