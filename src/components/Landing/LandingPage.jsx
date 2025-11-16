import React from 'react'
import Header from './Header'
import HeroSlider from './HeroSlider'
import StatsSection from './StatsSection'
import ProgramsSection from './ProgramsSection'
import TestimonialsSection from './TestimonialsSection'
import Footer from './Footer'
import Chatbot from '../Chatbot/Chatbot'

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      <HeroSlider />
      <StatsSection />
      <ProgramsSection />
      <TestimonialsSection />
      <Footer />
      <Chatbot />
    </div>
  )
}

export default LandingPage

