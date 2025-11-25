import apiClient from './api'

export const progressService = {
  list: (params = {}) => apiClient.get('/progress', params),

  get: (id) => apiClient.get(`/progress/${id}`),

  getByUser: (userId) => apiClient.get('/progress/query', { field: 'userId', value: userId }),

  create: (doc) => apiClient.post('/progress', doc),

  update: (id, doc) => apiClient.put(`/progress/${id}`, doc),

  remove: (id) => apiClient.delete(`/progress/${id}`),

  query: (field, value) => apiClient.get('/progress/query', { field, value }),
}






