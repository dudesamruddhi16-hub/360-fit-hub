import apiClient from "./api";

export const testimonialsService = {
    // Get all approved testimonials
    getAll: (params = {}) => apiClient.get('/testimonials', params),

    // Get current user's testimonials
    getMyTestimonials: () => apiClient.get('/testimonials/my'),

    // Submit new testimonial
    create: (data) => apiClient.post('/testimonials', data),

    // Admin: Get pending testimonials
    getPending: () => apiClient.get('/testimonials/pending'),

    // Admin: Approve testimonial
    approve: (id) => apiClient.patch(`/testimonials/${id}/approve`),

    // Admin: Reject testimonial
    reject: (id) => apiClient.delete(`/testimonials/${id}/reject`)
}
