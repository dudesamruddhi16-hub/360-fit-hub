import apiClient from "./api";

export const wellnessService = {
    // Get all wellness
    getAll: (params = {}) => apiClient.get('/wellness', params),
}

