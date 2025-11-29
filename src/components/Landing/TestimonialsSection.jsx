import React from 'react'
import { Container, Row, Col, Card, Badge } from 'react-bootstrap'
import { testimonialsService } from '../../services'

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true)
        const data = await testimonialsService.getAll()
        setTestimonials(data)
      } catch (error) {
        console.error('Error fetching testimonials:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  return (
    <section id="testimonials" className="testimonials-section">
      <Container>
        <div className="section-header">
          <h2>Testimonials</h2>
          <p>See what our members have to say about their experience</p>
        </div>
        {loading ? (
          <div className="text-center">
            <p>Loading testimonials...</p>
          </div>
        ) : (
          <Row className="g-4">
            {testimonials.map((testimonial) => (
              <Col md={4} key={testimonial._id}>
                <Card className="testimonial-card h-100">
                  <Card.Body>
                    <div className="testimonial-rating mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill text-warning"></i>
                      ))}
                    </div>
                    <Card.Text className="testimonial-text">"{testimonial.feedback}"</Card.Text>
                    <Card.Footer className="testimonial-footer bg-transparent border-0 pt-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <strong>{testimonial.name}</strong>
                        <Badge bg="primary" className="ms-2">{testimonial.role}</Badge>
                      </div>
                    </Card.Footer>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  )
}

export default TestimonialsSection

