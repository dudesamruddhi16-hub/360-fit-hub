import React from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Mayur Abnave",
      text: "It's a very nice gym with world top class equipment of Life fitness and Hammer Strength, and people surrounding is also good, and staff of this branch is very kind, they help members very well and all the trainers are certified with good knowledge of teaching as well. Good place to achieve your goals.",
      rating: 5
    },
    {
      name: "Utkrisht Kaushik",
      text: "So this place is more than just a gym. You can walk in and make friends that will guide you and help you out each time. They have great programs such as kickboxing, yoga, Zumba etc that you can opt for to change the routine once in a while.",
      rating: 5
    },
    {
      name: "Natasha Mondegari",
      text: "Amazing staff.!!! Hygiene is always a priority here. There are lockers to keep our bags. The personal trainers are extremely helpful. I have been training under Pranay Bane and sir has been most motivating.",
      rating: 5
    }
  ]

  return (
    <section id="testimonials" className="testimonials-section">
      <Container>
        <div className="section-header">
          <h2>Testimonials</h2>
          <p>See what our members have to say about their experience</p>
        </div>
        <Row className="g-4">
          {testimonials.map((testimonial, index) => (
            <Col md={4} key={index}>
              <Card className="testimonial-card">
                <Card.Body>
                  <div className="testimonial-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <i key={i} className="bi bi-star-fill"></i>
                    ))}
                  </div>
                  <Card.Text className="testimonial-text">"{testimonial.text}"</Card.Text>
                  <Card.Footer className="testimonial-footer">
                    <strong>{testimonial.name}</strong>
                  </Card.Footer>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default TestimonialsSection

