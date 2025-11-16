import React from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'

const ProgramsSection = () => {
  const programs = [
    {
      title: "Personal Training",
      description: "Work one-on-one with certified trainers to achieve your fitness goals. Get personalized guidance, motivation, and specialized workout plans tailored to your needs.",
      icon: "bi-person-check",
      features: ["Customized Workouts", "Expert Guidance", "Goal-Oriented Plans"]
    },
    {
      title: "Group Programs",
      description: "Join fun and energetic group fitness classes including yoga, HIIT, dance fitness, and more. Build a supportive community while staying fit.",
      icon: "bi-people",
      features: ["Yoga Classes", "HIIT Training", "Dance Fitness"]
    },
    {
      title: "Corporate Wellness",
      description: "Promote employee wellness with our corporate membership programs. We bring fitness to your workplace with BMI screening, nutrition counseling, and fitness seminars.",
      icon: "bi-briefcase",
      features: ["Workplace Programs", "Health Seminars", "Team Building"]
    }
  ]

  return (
    <section id="programs" className="programs-section">
      <Container>
        <div className="section-header">
          <h2>Our Programs</h2>
          <p>Choose from our diverse range of fitness programs designed to meet your goals</p>
        </div>
        <Row className="g-4">
          {programs.map((program, index) => (
            <Col md={4} key={index}>
              <Card className="program-card">
                <Card.Body>
                  <div className="program-icon">
                    <i className={`bi ${program.icon}`}></i>
                  </div>
                  <Card.Title>{program.title}</Card.Title>
                  <Card.Text>{program.description}</Card.Text>
                  <ul className="program-features">
                    {program.features.map((feature, idx) => (
                      <li key={idx}>
                        <i className="bi bi-check-circle"></i> {feature}
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default ProgramsSection

