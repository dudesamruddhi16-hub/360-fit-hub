import React, { useState, useEffect } from 'react'
import { Card, Table, Alert, Badge } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { dietPlansService } from '../../services'
import { normalizeItem } from '../../utils/helpers'

const MyDiet = () => {
  const { user } = useAuth()
  const [diets, setDiets] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const userDiets = await dietPlansService.query('userId', user.id)
      setDiets(normalizeItem(userDiets))
    } catch (error) {
      console.error('Error loading diets:', error)
    }
  }

  return (
    <div>
      <Card>
        <Card.Header>
          <h4 className="mb-0">My Diet Plans</h4>
        </Card.Header>
        <Card.Body>
          {diets.length === 0 ? (
            <Alert variant="info">
              <i className="bi bi-info-circle"></i> No diet plans assigned yet. Your trainer will create a personalized diet plan for you.
            </Alert>
          ) : (
            diets.map(diet => (
              <Card key={diet.id} className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">{diet.name}</h5>
                </Card.Header>
                <Card.Body>
                  {diet.description && (
                    <p className="text-muted mb-3">{diet.description}</p>
                  )}
                  {diet.meals && diet.meals.length > 0 ? (
                    <Table striped bordered>
                      <thead>
                        <tr>
                          <th>Meal Type</th>
                          <th>Food</th>
                          <th>Calories</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diet.meals.map((meal, index) => (
                          <tr key={index}>
                            <td>
                              <Badge bg="primary">{meal.mealType}</Badge>
                            </td>
                            <td>{meal.food}</td>
                            <td>{meal.calories ? `${meal.calories} cal` : '-'}</td>
                            <td>{meal.time || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-muted">No meals in this plan yet.</p>
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

export default MyDiet



