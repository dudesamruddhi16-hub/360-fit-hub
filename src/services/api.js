import axios from 'axios'

// Base API URL from environment variable or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
})

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get user token from localStorage if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Legacy support for gymUser (optional, can be removed if not used anymore)
    const user = localStorage.getItem('gymUser')
    if (user) {
      try {
        const userData = JSON.parse(user)
        if (userData.token && !token) {
          config.headers.Authorization = `Bearer ${userData.token}`
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      })
    }

    return config
  },
  (error) => {
    // Handle request error
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      })
    }

    // Return response data directly
    return response.data
  },
  (error) => {
    // Handle response error
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      const errorMessage = data?.error || data?.message || `HTTP Error ${status}`

      // Log error in development
      if (import.meta.env.DEV) {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status,
          error: errorMessage,
          data: data,
        })
      }

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear user data
          // We don't force redirect here to allow AuthContext to handle it
          // localStorage.removeItem('gymUser') // We are using cookies now
          break
        case 403:
          // Forbidden
          console.error('Access forbidden')
          break
        case 404:
          // Not found
          console.error('Resource not found')
          break
        case 500:
          // Server error
          console.error('Server error occurred')
          break
        default:
          break
      }

      // Create a more user-friendly error
      const apiError = new Error(errorMessage)
      apiError.status = status
      apiError.data = data
      return Promise.reject(apiError)
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ Network Error: No response received', error.request)
      const networkError = new Error('Network error. Please check your internet connection.')
      networkError.isNetworkError = true
      return Promise.reject(networkError)
    } else {
      // Something else happened
      console.error('❌ Request Setup Error:', error.message)
      return Promise.reject(error)
    }
  }
)

// API Client class wrapper for backward compatibility
class ApiClient {
  constructor() {
    this.axios = apiClient
  }

  async request(endpoint, options = {}) {
    try {
      const response = await apiClient({
        url: endpoint,
        method: options.method || 'GET',
        params: options.params,
        data: options.body || options.data,
        headers: options.headers,
      })
      return response
    } catch (error) {
      throw error
    }
  }

  get(endpoint, params = {}) {
    return apiClient.get(endpoint, { params })
  }

  post(endpoint, data) {
    return apiClient.post(endpoint, data)
  }

  put(endpoint, data) {
    return apiClient.put(endpoint, data)
  }

  delete(endpoint) {
    return apiClient.delete(endpoint)
  }
}

// Export both the axios instance and the wrapper class
export default new ApiClient()
export { apiClient }
