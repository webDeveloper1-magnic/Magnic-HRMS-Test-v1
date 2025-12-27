import axios, { type AxiosError, type AxiosRequestConfig } from "axios"
import * as SecureStore from "expo-secure-store"
import { API_CONFIG } from "@/constants/api"

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken")
        if (!refreshToken) {
          throw new Error("No refresh token")
        }

        const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken } = response.data.data
        await SecureStore.setItemAsync("accessToken", accessToken)

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await SecureStore.deleteItemAsync("accessToken")
        await SecureStore.deleteItemAsync("refreshToken")
        // Navigation will be handled by AuthContext
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api

// Helper function to handle API errors
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || "An error occurred"
  }
  if (error instanceof Error) {
    return error.message
  }
  return "An unexpected error occurred"
}
