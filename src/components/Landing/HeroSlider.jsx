import React, { useState, useEffect } from 'react'
import { Container, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const HeroSlider = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Transform Your Body, Transform Your Life",
      subtitle: "Join India's Premier Fitness Destination",
      description: "Experience world-class facilities, expert trainers, and a supportive community",
      bgImage: "linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.9) 100%), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920')"
    },
    {
      title: "Personal Training That Gets Results",
      subtitle: "Expert Guidance for Your Fitness Goals",
      description: "Work with certified trainers to achieve your personal best",
      bgImage: "linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.9) 100%), url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920')"
    },
    {
      title: "Group Programs for Every Fitness Level",
      subtitle: "Yoga, HIIT, Dance & More",
      description: "Join fun, energetic group classes designed to keep you motivated",
      bgImage: "linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.9) 100%), url('https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920')"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  return (
    <div className="hero-slider">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          style={{
            backgroundImage: slide.bgImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <Container className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">{slide.title}</h1>
              <h2 className="hero-subtitle">{slide.subtitle}</h2>
              <p className="hero-description">{slide.description}</p>
              <div className="hero-buttons">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="me-3"
                  onClick={() => navigate('/signup')}
                >
                  Get Started Today
                </Button>
                <Button 
                  variant="outline-light" 
                  size="lg"
                  onClick={() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Programs
                </Button>
              </div>
            </div>
          </Container>
        </div>
      ))}
      
      {/* Slider Indicators */}
      <div className="slider-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        className="slider-nav prev"
        onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
        aria-label="Previous slide"
      >
        <i className="bi bi-chevron-left"></i>
      </button>
      <button 
        className="slider-nav next"
        onClick={() => goToSlide((currentSlide + 1) % slides.length)}
        aria-label="Next slide"
      >
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  )
}

export default HeroSlider

