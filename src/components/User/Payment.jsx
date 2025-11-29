
const Payment = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [payments, setPayments] = useState([])
  const [pendingMemberships, setPendingMemberships] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedMembership, setSelectedMembership] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cards')
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const userId = user?.id || user?._id
      if (!userId) return

      const userPayments = await paymentsService.query('userId', userId)
      const normalizedPayments = normalizeItem(userPayments)
      setPayments(normalizedPayments.sort((a, b) => new Date(b.date) - new Date(a.date)))

      const memberships = await membershipsService.query('userId', userId)
      const normalizedMemberships = normalizeItem(memberships)

      // Get all plans to fetch price if missing from membership
      const allPlans = await membershipPlansService.getAll()
      const normalizedPlans = normalizeItem(allPlans)

      // Get memberships that are pending payment (status: 'pending' and no payment record)
      const pending = normalizedMemberships
        .filter(m => {
          if (m.status !== 'pending') return false
          // Check if payment exists for this membership
          return !normalizedPayments.some(p => {
            const pMembershipId = p.membershipId || p.membershipId
            const mId = m.id || m._id
            return String(pMembershipId) === String(mId)
          })
        })
        .map(m => {
          // If price is missing, fetch it from the plan
          if (!m.price && m.planId) {
            const plan = normalizedPlans.find(p => {
              const planId = p.id || p._id
              const membershipPlanId = m.planId
              return String(planId) === String(membershipPlanId)
            })
            if (plan) {
              m.price = plan.price
            }
          }
          // If planName is missing, fetch it from the plan
          if (!m.planName && m.planId) {
            const plan = normalizedPlans.find(p => {
              const planId = p.id || p._id
              const membershipPlanId = m.planId
              return String(planId) === String(membershipPlanId)
            })
            if (plan) {
              m.planName = plan.name
            }
          }
          return m
        })

      setPendingMemberships(pending)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }



  const handlePay = (membership) => {
    setSelectedMembership(membership)
    setPaymentData({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: ''
    })
    setShowModal(true)
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value)
    setPaymentData({ ...paymentData, cardNumber: formatted })
  }

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value)
    setPaymentData({ ...paymentData, expiryDate: formatted })
  }

  const handlePaymentSubmit = async () => {
    if (paymentMethod === 'cards') {
      if (!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiryDate || !paymentData.cvv) {
        addToast('Please fill in all payment details', 'warning')
        return
      }
    }

    // Simulate payment processing
    try {
      const transactionId = `TXN${Date.now()}`
      const paymentMethodName = {
        'cards': 'Credit/Debit Card',
        'upi': 'UPI',
        'netbanking': 'Net Banking',
        'wallets': 'Mobile Wallet'
      }[paymentMethod] || 'Online'

      // Create payment record
      await paymentsService.create({
        userId: user.id,
        membershipId: selectedMembership.id || selectedMembership._id,
        amount: selectedMembership.price,
        planName: selectedMembership.planName,
        date: new Date().toISOString(),
        status: 'completed',
        method: paymentMethodName,
        transactionId: transactionId,
        createdAt: new Date().toISOString()
      })

      // Activate membership - set status to active and calculate dates
      const startDate = new Date()
      const endDate = new Date()
      // Get plan duration from membership plan
      const allPlans = await membershipPlansService.getAll()
      const normalizedPlans = normalizeItem(allPlans)
      const plan = normalizedPlans.find(p => p.id === selectedMembership.planId || p._id === selectedMembership.planId)
      const duration = plan ? plan.duration : 30 // Default 30 days
      endDate.setDate(endDate.getDate() + duration)

      // Update membership to active status
      const membershipId = selectedMembership.id || selectedMembership._id
      await membershipsService.update(membershipId, {
        ...selectedMembership,
        status: 'active',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        activatedAt: new Date().toISOString()
      })

      setTransactionDetails({
        transactionId,
        amount: selectedMembership.price,
        planName: selectedMembership.planName,
        method: paymentMethodName
      })
      setShowModal(false)
      setShowSuccessModal(true)
      loadData()
    } catch (error) {
      addToast('Payment failed. Please try again.', 'danger')
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      'completed': 'success',
      'pending': 'warning',
      'failed': 'danger'
    }
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>
  }

  return (
    <div>
      <Card className="mb-4">
        <Card.Header>
          <h4 className="mb-0">Pending Payments</h4>
        </Card.Header>
        <Card.Body>
          {pendingMemberships.length === 0 ? (
            <p className="text-muted">No pending payments</p>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingMemberships.map(membership => (
                    <tr key={membership.id}>
                      <td>
                        <strong>{membership.planName}</strong>
                        <Badge bg="warning" className="ms-2">Pending Payment</Badge>
                      </td>
                      <td>
                        {membership.price !== undefined && membership.price !== null
                          ? `₹${Number(membership.price).toFixed(2)}`
                          : '₹0.00'}
                      </td>
                      <td>
                        {membership.startDate ? new Date(membership.startDate).toLocaleDateString() : 'After Payment'}
                      </td>
                      <td>
                        {membership.endDate ? new Date(membership.endDate).toLocaleDateString() : 'After Payment'}
                      </td>
                      <td>
                        <Button variant="primary" size="sm" onClick={() => handlePay(membership)}>
                          <i className="bi bi-credit-card"></i> Pay Now
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h4 className="mb-0">Payment History</h4>
        </Card.Header>
        <Card.Body>
          {payments.length === 0 ? (
            <p className="text-muted">No payment history</p>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id}>
                      <td>#{payment.transactionId || payment.id}</td>
                      <td>{payment.planName || '-'}</td>
                      <td>
                        {payment.amount !== undefined && payment.amount !== null
                          ? `₹${Number(payment.amount).toFixed(2)}`
                          : '₹0.00'}
                      </td>
                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                      <td>{getStatusBadge(payment.status || 'completed')}</td>
                      <td>{payment.method || 'Online'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Payment Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        className="payment-modal"
      >
        <Modal.Body className="p-0">
          <div className="payment-modal-content">
            {/* Header */}
            <div className="payment-header">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Payment method</h4>
                <div className="d-flex align-items-center text-muted">
                  <i className="bi bi-shield-lock me-2"></i>
                  <small>Secure and encrypted</small>
                </div>
              </div>
            </div>

            {/* Payment Amount Summary */}
            {selectedMembership && (
              <div className="payment-summary">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">{selectedMembership.planName}</h6>
                    <small className="text-muted">Membership Plan</small>
                  </div>
                  <div className="text-end">
                    <h5 className="mb-0 text-primary">
                      {selectedMembership.price !== undefined && selectedMembership.price !== null
                        ? `₹${Number(selectedMembership.price).toFixed(2)}`
                        : '₹0.00'}
                    </h5>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            <div className="payment-methods">
              {/* Cards Option */}
              <div className="payment-option">
                <Form.Check
                  type="radio"
                  id="payment-cards"
                  name="paymentMethod"
                  checked={paymentMethod === 'cards'}
                  onChange={() => setPaymentMethod('cards')}
                  label={
                    <div className="d-flex align-items-center">
                      <i className="bi bi-credit-card-2-front payment-icon"></i>
                      <span>Cards</span>
                    </div>
                  }
                />

                {paymentMethod === 'cards' && (
                  <div className="payment-form">
                    <Form.Group className="mb-3">
                      <Form.Label>Card number</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={handleCardNumberChange}
                          maxLength={19}
                          className="payment-input"
                        />
                        <i className="bi bi-credit-card payment-input-icon"></i>
                      </div>
                      <div className="card-logos mt-2">
                        <span className="card-logo-badge">AM EX</span>
                        <span className="card-logo-badge">DC</span>
                        <span className="card-logo-badge mastercard">MC</span>
                        <span className="card-logo-badge">RuPay</span>
                        <span className="card-logo-badge visa">VISA</span>
                      </div>
                    </Form.Group>

                    <div className="row">
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>Expiry date</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="MM/YY"
                            value={paymentData.expiryDate}
                            onChange={handleExpiryChange}
                            maxLength={5}
                            className="payment-input"
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-6">
                        <Form.Group className="mb-3">
                          <Form.Label>CVC / CVV</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="CVC"
                            value={paymentData.cvv}
                            onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, '') })}
                            maxLength={4}
                            className="payment-input"
                          />
                        </Form.Group>
                      </div>
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label>Name on card</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Name on card"
                        value={paymentData.cardName}
                        onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                        className="payment-input"
                      />
                    </Form.Group>

                    <Form.Check
                      type="checkbox"
                      id="save-card"
                      label="Securely save this card for my later purchase"
                      checked={paymentData.saveCard}
                      onChange={(e) => setPaymentData({ ...paymentData, saveCard: e.target.checked })}
                      className="save-card-checkbox"
                    />
                  </div>
                )}
              </div>

              {/* UPI Option */}
              <div className="payment-option">
                <Form.Check
                  type="radio"
                  id="payment-upi"
                  name="paymentMethod"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  label={
                    <div className="d-flex align-items-center">
                      <i className="bi bi-phone payment-icon"></i>
                      <span>UPI</span>
                    </div>
                  }
                />
                {paymentMethod === 'upi' && (
                  <div className="payment-form">
                    <Form.Group className="mb-3">
                      <Form.Label>UPI ID</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="yourname@upi"
                        className="payment-input"
                      />
                    </Form.Group>
                  </div>
                )}
              </div>

              {/* Net Banking Option */}
              <div className="payment-option">
                <Form.Check
                  type="radio"
                  id="payment-netbanking"
                  name="paymentMethod"
                  checked={paymentMethod === 'netbanking'}
                  onChange={() => setPaymentMethod('netbanking')}
                  label={
                    <div className="d-flex align-items-center">
                      <i className="bi bi-bank payment-icon"></i>
                      <span>Net Banking</span>
                    </div>
                  }
                />
                {paymentMethod === 'netbanking' && (
                  <div className="payment-form">
                    <Form.Group className="mb-3">
                      <Form.Label>Select Bank</Form.Label>
                      <Form.Select className="payment-input">
                        <option>Select your bank</option>
                        <option>State Bank of India</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                )}
              </div>

              {/* Mobile Wallets Option */}
              <div className="payment-option">
                <Form.Check
                  type="radio"
                  id="payment-wallets"
                  name="paymentMethod"
                  checked={paymentMethod === 'wallets'}
                  onChange={() => setPaymentMethod('wallets')}
                  label={
                    <div className="d-flex align-items-center">
                      <i className="bi bi-wallet2 payment-icon"></i>
                      <span>Mobile Wallets</span>
                    </div>
                  }
                />
                {paymentMethod === 'wallets' && (
                  <div className="payment-form">
                    <Form.Group className="mb-3">
                      <Form.Label>Select Wallet</Form.Label>
                      <Form.Select className="payment-input">
                        <option>Select wallet</option>
                        <option>Paytm</option>
                        <option>PhonePe</option>
                        <option>Google Pay</option>
                        <option>Amazon Pay</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="payment-footer">
              <Button variant="outline-secondary" onClick={() => setShowModal(false)} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" onClick={handlePaymentSubmit} className="payment-submit-btn">
                Pay {selectedMembership?.price !== undefined && selectedMembership?.price !== null
                  ? `$${Number(selectedMembership.price).toFixed(2)}`
                  : '$0.00'}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Success Modal */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
        className="payment-success-modal"
      >
        <Modal.Body className="text-center p-5">
          <div className="success-icon mb-4">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <h3 className="mb-3">Payment Successful!</h3>
          {transactionDetails && (
            <div className="transaction-details">
              <p className="text-muted mb-2">Transaction ID: <strong>{transactionDetails.transactionId}</strong></p>
              <p className="text-muted mb-2">Amount: <strong>₹{transactionDetails.amount !== undefined && transactionDetails.amount !== null ? Number(transactionDetails.amount).toFixed(2) : '0.00'}</strong></p>
              <p className="text-muted mb-4">Plan: <strong>{transactionDetails.planName}</strong></p>
            </div>
          )}
          <p className="text-success mb-4">
            <i className="bi bi-check-circle"></i> Your membership has been activated successfully!
          </p>
          <Button variant="primary" onClick={() => {
            setShowSuccessModal(false)
            navigate('/user/membership')
          }}>
            View Membership
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default Payment



