import apiClient from './api'

export const progressService = {
  list: (params = {}) => apiClient.get('/progress', { params }).then(r => r.data),

  get: (id) => apiClient.get(`/progress/${id}`).then(r => r.data),

  getByUser: (userId) => apiClient.get('/progress', { params: { userId } }).then(r => r.data),

  create: (doc) => apiClient.post('/progress', doc).then(r => r.data),

  update: (id, doc) => apiClient.put(`/progress/${id}`, doc).then(r => r.data),

  remove: (id) => apiClient.delete(`/progress/${id}`).then(r => r.data),

  query: (field, value) => apiClient.get('/progress/query', { field, value }),
}


