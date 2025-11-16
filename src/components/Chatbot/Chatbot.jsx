import React, { useState, useRef, useEffect } from 'react'
import { Card, Button, Form, InputGroup } from 'react-bootstrap'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your Gym Assistant. How can I help you today? You can ask me about membership plans, programs, facilities, or anything else!",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // AI Response Generator
  const generateResponse = (userMessage) => {
    const message = userMessage.toLowerCase().trim()
    
    // Greetings
    if (message.match(/hi|hello|hey|good morning|good afternoon|good evening/)) {
      return "Hello! Welcome to Gold's Gym! I'm here to help you with any questions about our gym, membership plans, programs, or facilities. What would you like to know?"
    }

    // Membership Plans
    if (message.match(/membership|plan|price|cost|fee|subscription|join|sign up|register/)) {
      return "We offer flexible membership plans:\n\n💰 Basic Plan - $29.99/month\n• Gym Access\n• Basic Equipment\n\n💎 Premium Plan - $49.99/month\n• Gym Access\n• All Equipment\n• Group Classes\n\n👑 VIP Plan - $79.99/month\n• Gym Access\n• All Equipment\n• Group Classes\n• Personal Trainer\n• Nutrition Plan\n\nWould you like to know more about any specific plan?"
    }

    // Programs
    if (message.match(/program|training|workout|exercise|class|yoga|hiit|zumba|cardio/)) {
      return "We offer various programs:\n\n💪 Personal Training\n• One-on-one sessions with certified trainers\n• Customized workout plans\n• Goal-oriented fitness programs\n\n👥 Group Programs\n• Yoga classes\n• HIIT training\n• Dance fitness (Zumba)\n• Kickboxing\n\n🏢 Corporate Wellness\n• Workplace fitness programs\n• Health seminars\n• Team building activities\n\nWhich program interests you?"
    }

    // Facilities/Equipment
    if (message.match(/facility|equipment|machine|gym|locker|shower|amenity|feature/)) {
      return "Our facilities include:\n\n🏋️ State-of-the-art equipment\n• Life Fitness machines\n• Hammer Strength equipment\n• Cardio section with mood lighting\n• Spinning section\n\n🔒 Convenient amenities\n• Lockers for your belongings\n• Clean showers and changing rooms\n• High hygiene standards\n\n✨ Additional features\n• Multiple workout zones\n• Dedicated areas for different activities\n\nWould you like to schedule a visit?"
    }

    // Location/Hours
    if (message.match(/location|address|where|hours|time|open|close|when/)) {
      return "We have 156 gyms across 95 cities in 26 states! 🏋️\n\n📍 To find the nearest location:\n• Use our gym locator on the website\n• Contact us at +91 8976834832\n• Email: customer.care@goldsgym.in\n\n⏰ Operating Hours:\n• Monday - Friday: 6:00 AM - 11:00 PM\n• Saturday - Sunday: 7:00 AM - 10:00 PM\n\nWould you like help finding a specific location?"
    }

    // Personal Trainer
    if (message.match(/trainer|coach|instructor|personal training|pt|guidance/)) {
      return "Our personal trainers are:\n\n✅ Certified professionals\n✅ Experienced and knowledgeable\n✅ Goal-oriented\n✅ Motivating and supportive\n\nThey provide:\n• Personalized workout plans\n• One-on-one guidance\n• Nutrition advice\n• Progress tracking\n\nPersonal training is included in our VIP Plan, or available as an add-on. Would you like to know more?"
    }

    // Diet/Nutrition
    if (message.match(/diet|nutrition|food|meal|calorie|weight loss|weight gain|nutritionist/)) {
      return "We offer comprehensive nutrition support:\n\n🥗 Diet Plans\n• Personalized meal plans\n• Calorie tracking\n• Meal timing guidance\n\n📊 Nutrition Counseling\n• BMI screening\n• Dietary consultations\n• Healthy lifestyle seminars\n\n💪 Combined Approach\n• Workout + Nutrition plans\n• Progress tracking\n• Regular check-ins\n\nNutrition plans are included in VIP membership. Interested?"
    }

    // Payment
    if (message.match(/payment|pay|card|credit|debit|online|transaction|billing/)) {
      return "We offer easy payment options:\n\n💳 Online Payment\n• Credit/Debit cards\n• Secure transactions\n• Instant confirmation\n\n💰 Payment Plans\n• Monthly subscriptions\n• Flexible billing cycles\n• Auto-renewal options\n\n📱 Payment Methods\n• Credit/Debit cards\n• UPI (coming soon)\n• Net banking\n\nAll payments are secure and encrypted. Need help with payment?"
    }

    // Progress Tracking
    if (message.match(/progress|track|monitor|weight|body fat|muscle|measurement|stats/)) {
      return "Track your fitness journey with us:\n\n📊 Progress Tracking Features\n• Weight monitoring\n• Body fat percentage\n• Muscle mass tracking\n• Custom notes and goals\n\n📈 Visual Progress\n• Historical data\n• Trend analysis\n• Goal setting\n\n✅ Available for all members\n• Easy to use dashboard\n• Regular updates\n\nStart tracking your progress today!"
    }

    // Free Trial
    if (message.match(/trial|free|demo|visit|tour|try|test|sample/)) {
      return "Yes! We offer a FREE trial! 🎉\n\n✨ What's included:\n• Full gym access\n• All equipment\n• Group classes\n• No commitment required\n\n📅 How to get started:\n• Click 'Book Your Free Trial' on our website\n• Or call us at +91 8976834832\n• Visit any of our 156 locations\n\nCome experience Gold's Gym today!"
    }

    // Contact
    if (message.match(/contact|phone|email|call|reach|support|help|customer service/)) {
      return "Get in touch with us:\n\n📞 Phone: +91 8976834832\n📧 Email: customer.care@goldsgym.in\n🌐 Website: Visit our contact page\n📍 Locations: 156 gyms across India\n\n⏰ Support Hours:\n• Monday - Friday: 9:00 AM - 8:00 PM\n• Saturday: 10:00 AM - 6:00 PM\n\nWe're here to help! 😊"
    }

    // Hours/Timing
    if (message.match(/hours|timing|schedule|when|time|open|close/)) {
      return "Our gym hours:\n\n📅 Weekdays (Mon-Fri)\n• 6:00 AM - 11:00 PM\n\n📅 Weekends (Sat-Sun)\n• 7:00 AM - 10:00 PM\n\n⏰ Peak Hours:\n• Morning: 6:00 AM - 9:00 AM\n• Evening: 6:00 PM - 9:00 PM\n\n💡 Tip: Off-peak hours offer more space and equipment availability!"
    }

    // General Help
    if (message.match(/help|assist|support|what|how|why|can you|tell me|explain/)) {
      return "I'm here to help! I can assist you with:\n\n✅ Membership plans and pricing\n✅ Programs and classes\n✅ Facilities and equipment\n✅ Personal training\n✅ Nutrition and diet plans\n✅ Payment options\n✅ Progress tracking\n✅ Free trial information\n✅ Contact details\n\nWhat would you like to know more about?"
    }

    // Default response
    const defaultResponses = [
      "That's a great question! Let me help you with that. Could you provide a bit more detail?",
      "I understand you're asking about that. For more specific information, I'd recommend:\n• Checking our Programs section\n• Contacting our support team at +91 8976834832\n• Booking a free trial to see our facilities\n\nIs there anything else I can help you with?",
      "Thanks for your question! For detailed information, you can:\n• Visit our website sections\n• Call us at +91 8976834832\n• Email customer.care@goldsgym.in\n\nWhat else can I help you with today?",
      "I'm here to help! You can ask me about:\n• Membership plans\n• Programs and classes\n• Facilities\n• Personal training\n• Nutrition plans\n• Payment options\n\nWhat would you like to know?"
    ]
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI thinking
    setTimeout(() => {
      const botResponse = {
        text: generateResponse(input),
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000)
  }

  const handleQuickAction = (action) => {
    const quickMessages = {
      'membership': 'Tell me about membership plans',
      'programs': 'What programs do you offer?',
      'trial': 'How can I get a free trial?',
      'contact': 'What are your contact details?'
    }
    setInput(quickMessages[action])
    setTimeout(() => {
      handleSend({ preventDefault: () => {} })
    }, 100)
  }

  return (
    <>
      {/* Chat Button */}
      <Button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        variant="primary"
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
          <i className="bi bi-x-lg"></i>
        ) : (
          <i className="bi bi-chat-dots"></i>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="chatbot-window">
          <Card.Header className="chatbot-header">
            <div className="d-flex align-items-center">
              <div className="chatbot-avatar">
                <i className="bi bi-robot"></i>
              </div>
              <div className="ms-2">
                <h6 className="mb-0">Gym Assistant</h6>
                <small className="text-muted">Online</small>
              </div>
            </div>
            <Button
              variant="link"
              className="text-light p-0"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <i className="bi bi-x-lg"></i>
            </Button>
          </Card.Header>

          <Card.Body className="chatbot-body">
            <div className="chatbot-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender === 'user' ? 'message-user' : 'message-bot'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="message-avatar">
                      <i className="bi bi-robot"></i>
                    </div>
                  )}
                  <div className="message-content">
                    <div className="message-text">{msg.text}</div>
                    <div className="message-time">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message message-bot">
                  <div className="message-avatar">
                    <i className="bi bi-robot"></i>
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="chatbot-quick-actions">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleQuickAction('membership')}
              >
                Membership
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleQuickAction('programs')}
              >
                Programs
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleQuickAction('trial')}
              >
                Free Trial
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleQuickAction('contact')}
              >
                Contact
              </Button>
            </div>
          </Card.Body>

          <Card.Footer className="chatbot-footer">
            <Form onSubmit={handleSend}>
              <InputGroup>
                <Form.Control
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="chatbot-input"
                />
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!input.trim()}
                  className="chatbot-send"
                >
                  <i className="bi bi-send"></i>
                </Button>
              </InputGroup>
            </Form>
          </Card.Footer>
        </Card>
      )}
    </>
  )
}

export default Chatbot

