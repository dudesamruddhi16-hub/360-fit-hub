import apiClient from './api'

export const membershipsService = {
  // Get all memberships
  getAll: (params = {}) => apiClient.get('/memberships', params),

  // Get membership by ID
  getById: (id) => apiClient.get(`/memberships/${id}`),

  // Create new membership
  create: (membershipData) => apiClient.post('/memberships', membershipData),

  // Update membership
  update: (id, membershipData) => apiClient.put(`/memberships/${id}`, membershipData),

  // Delete membership
  delete: (id) => apiClient.delete(`/memberships/${id}`),

  // Query memberships by field
  query: (field, value) => apiClient.get('/memberships/query', { field, value }),
}

