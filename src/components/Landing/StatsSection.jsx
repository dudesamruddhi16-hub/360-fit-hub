import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'

const StatsSection = () => {
  const stats = [
    {
      number: "156",
      label: "Gyms",
      icon: "bi-building"
    },
    {
      number: "95",
      label: "Cities",
      icon: "bi-geo-alt"
    },
    {
      number: "26",
      label: "States",
      icon: "bi-map"
    },
    {
      number: "50K+",
      label: "Active Members",
      icon: "bi-people"
    }
  ]

  return (
    <section className="stats-section">
      <Container>
        <div className="section-header">
          <h2>What Makes Us <span className="gold-text">Different Than Others</span></h2>
        </div>
        <Row className="g-4">
          {stats.map((stat, index) => (
            <Col md={3} sm={6} key={index}>
              <div className="stat-card">
                <i className={`bi ${stat.icon}`}></i>
                <h3>{stat.number}</h3>
                <p>{stat.label}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default StatsSection

