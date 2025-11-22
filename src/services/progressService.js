import apiClient from './api'

export const progressService = {
  list(params = {}) {
    return apiClient.get('/progress', { params }).then(r => r.data)
  },
  get(id) {
    return apiClient.get(`/progress/${id}`).then(r => r.data)
  },
  getByUser(userId) {
    return apiClient.get('/progress', { params: { userId } }).then(r => r.data)
  },
  create(doc) {
    return apiClient.post('/progress', doc).then(r => r.data)
  },
  update(id, doc) {
    return apiClient.put(`/progress/${id}`, doc).then(r => r.data)
  },
  remove(id) {
    return apiClient.delete(`/progress/${id}`).then(r => r.data)
  },
  query(field, value) {
    return apiClient.get('/progress/query', { params: { field, value } }).then(r => r.data)
  }
}


