import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { label: "Gym Locator", href: "#" },
    { label: "About us", href: "#about" },
    { label: "Careers", href: "#" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Our Events", href: "#" },
    { label: "Group Program", href: "#programs" }
  ]

  const programs = [
    { label: "Corporate Wellness Program", href: "#programs" },
    { label: "Personal Training Program", href: "#programs" },
    { label: "Group Program", href: "#programs" },
    { label: "Buy Membership Now", href: "#" }
  ]

  return (
    <footer className="landing-footer">
      <Container>
        <Row className="footer-content">
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="footer-title">
              <i className="bi bi-dumbbell"></i> 360 Hub Gym
            </h5>
            <p className="footer-description">
              India's premier fitness destination. Join thousands of members achieving their fitness goals with world-class facilities and expert trainers.
            </p>
            <div className="footer-contact">
              <p><i className="bi bi-telephone"></i> +91 9763629356</p>
              <p><i className="bi bi-envelope"></i> customer.care@360hubgym.in</p>
            </div>
          </Col>

          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="footer-heading">Quick Links</h6>
            <ul className="footer-links">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </Col>

          <Col md={3} className="mb-4 mb-md-0">
            <h6 className="footer-heading">Programs</h6>
            <ul className="footer-links">
              {programs.map((program, index) => (
                <li key={index}>
                  <a href={program.href}>{program.label}</a>
                </li>
              ))}
            </ul>
          </Col>

          <Col md={3}>
            <h6 className="footer-heading">Newsletter</h6>
            <p className="footer-newsletter-text">Sign up for our mailing list to get latest updates and offers</p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
              />
              <button className="newsletter-button">
                <i className="bi bi-send"></i>
              </button>
            </div>
          </Col>
        </Row>

        <Row className="footer-bottom">
          <Col md={6}>
            <p className="mb-0">
              &copy; {currentYear} 360 Hub Gym. All Rights Reserved.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <a href="#" className="footer-link">Terms & Conditions</a>
            <span className="mx-2">|</span>
            <a href="#" className="footer-link">Privacy Policy</a>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer

