import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts'
import { progressService } from '../../services/progressService' // added

const API_BASE = (import.meta.env.VITE_API_URL).replace(/\/$/, '')

const COLORS_COMPOSITION = ['#36A2EB', '#FF6384', '#FFCE56']
const COLORS_PROGRESS = ['#4BC0C0', '#E7E9ED']

export default function MyProgressGraph({ userId: propUserId }) {
  const { user } = useAuth()
  const loggedUserId = String(user?.id || user?._id || '')
  const allowedUserId = loggedUserId

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [goalWeight, setGoalWeight] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!allowedUserId) {
        setEntries([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const data = await progressService.getByUser(allowedUserId) // use service
        if (cancelled) return
        const sorted = Array.isArray(data) ? data.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) : []
        setEntries(sorted)
        if (sorted.length) {
          const init = Number(sorted[0].weight) || 0
          if (init) setGoalWeight((init * 0.95).toFixed(1))
        } else {
          setGoalWeight('')
        }
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err?.response?.data?.error || err.message || 'Failed to load progress')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    setEntries([])
    setError(null)
    load()
    return () => { cancelled = true }
  }, [allowedUserId])

  if (!loggedUserId) return <div>Please sign in to view your progress.</div>
  if (loading) return <div>Loading progress...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!entries.length) return <div>No progress entries found.</div>

  const latest = entries[entries.length - 1]
  const hasComposition = typeof latest.muscleMass === 'number' || typeof latest.bodyFat === 'number'

  let chartData = []
  let subtitle = ''
  if (hasComposition) {
    const muscle = Number(latest.muscleMass) || 0
    const bodyFat = Number(latest.bodyFat) || 0
    const other = Math.max(0, 100 - muscle - bodyFat)
    chartData = [
      { name: 'Muscle %', value: muscle },
      { name: 'Body Fat %', value: bodyFat },
      { name: 'Other %', value: other }
    ]
    subtitle = `Date: ${new Date(latest.date || latest.createdAt).toLocaleDateString()}`
  } else {
    const initial = Number(entries[0].weight) || 0
    const current = Number(latest.weight) || 0
    const goal = Number(goalWeight) || initial || current
    const denom = initial - goal || 1
    const progressFraction = ((initial - current) / denom)
    const clamped = Math.max(0, Math.min(1, progressFraction))
    chartData = [
      { name: 'Progress', value: clamped * 100 },
      { name: 'Remaining', value: (1 - clamped) * 100 }
    ]
    subtitle = `Initial: ${initial} kg • Current: ${current} kg • Goal: ${goal} kg`
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h5>Progress Overview</h5>
      <p style={{ color: '#666' }}>{subtitle}</p>
      <div style={{ height: 320 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={4}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {(chartData || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={hasComposition ? COLORS_COMPOSITION[index % COLORS_COMPOSITION.length] : COLORS_PROGRESS[index % COLORS_PROGRESS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {!hasComposition && (
        <div style={{ marginTop: 12 }}>
          <label>
            Set Goal Weight (kg):
            <input
              type="number"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              style={{ marginLeft: 8, padding: 6, width: 120 }}
            />
          </label>
          <button
            onClick={() => setEntries((s) => s.slice())}
            style={{ marginLeft: 12, padding: '6px 10px' }}
          >
            Update
          </button>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <h6>Recent entries</h6>
        <ul>
          {entries.slice().reverse().slice(0, 6).map((e) => (
            <li key={e.id || e._id}>
              {new Date(e.date || e.createdAt).toLocaleDateString()} — weight: {e.weight ?? '—'} kg
              {e.bodyFat ? ` • bodyFat: ${e.bodyFat}%` : ''}{e.muscleMass ? ` • muscle: ${e.muscleMass}%` : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}