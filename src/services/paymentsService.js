import apiClient from './api'

export const paymentsService = {
  // Get all payments
  getAll: (params = {}) => apiClient.get('/payments', params),

  // Get payment by ID
  getById: (id) => apiClient.get(`/payments/${id}`),

  // Create new payment
  create: (paymentData) => apiClient.post('/payments', paymentData),

  // Update payment
  update: (id, paymentData) => apiClient.put(`/payments/${id}`, paymentData),

  // Delete payment
  delete: (id) => apiClient.delete(`/payments/${id}`),

  // Query payments by field
  query: (field, value) => apiClient.get('/payments/query', { field, value }),
}

