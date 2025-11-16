import React, { useState, useEffect } from 'react'
import { Card, Table, Badge, Alert } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { getAllItems, queryByIndex, STORES } from '../../db/indexedDB'

const MyWorkouts = () => {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [exercises, setExercises] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const userWorkouts = await queryByIndex(STORES.WORKOUT_PLANS, 'userId', user.id)
      setWorkouts(userWorkouts)

      const allExercises = await getAllItems(STORES.EXERCISES)
      setExercises(allExercises)
    } catch (error) {
      console.error('Error loading workouts:', error)
    }
  }

  const getExerciseName = (exerciseId) => {
    const exercise = exercises.find(e => e.id === exerciseId)
    return exercise ? exercise.name : 'Unknown'
  }

  const getExerciseDetails = (exerciseId) => {
    const exercise = exercises.find(e => e.id === exerciseId)
    return exercise || null
  }

  return (
    <div>
      <Card>
        <Card.Header>
          <h4 className="mb-0">My Workout Plans</h4>
        </Card.Header>
        <Card.Body>
          {workouts.length === 0 ? (
            <Alert variant="info">
              <i className="bi bi-info-circle"></i> No workout plans assigned yet. Your trainer will create a personalized workout plan for you.
            </Alert>
          ) : (
            workouts.map(workout => (
              <Card key={workout.id} className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">{workout.name}</h5>
                </Card.Header>
                <Card.Body>
                  {workout.description && (
                    <p className="text-muted">{workout.description}</p>
                  )}
                  {workout.exercises && workout.exercises.length > 0 ? (
                    <Table striped bordered>
                      <thead>
                        <tr>
                          <th>Exercise</th>
                          <th>Sets</th>
                          <th>Reps</th>
                          <th>Duration (min)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workout.exercises.map((ex, index) => {
                          const exercise = getExerciseDetails(ex.exerciseId)
                          return (
                            <tr key={index}>
                              <td>
                                <strong>{getExerciseName(ex.exerciseId)}</strong>
                                {exercise && (
                                  <div>
                                    <Badge bg="secondary">{exercise.category}</Badge>
                                    {exercise.description && (
                                      <small className="d-block text-muted">{exercise.description}</small>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td>{ex.sets || '-'}</td>
                              <td>{ex.reps || '-'}</td>
                              <td>{ex.duration || '-'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-muted">No exercises in this plan yet.</p>
                  )}
                </Card.Body>
              </Card>
            ))
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default MyWorkouts



