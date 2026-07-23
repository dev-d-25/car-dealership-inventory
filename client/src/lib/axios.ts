import axios from "axios"
import type { AxiosInstance, AxiosResponse, AxiosError } from "axios"

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Session expired or unauthorized - clear user state
      window.dispatchEvent(new Event("auth:unauthorized"))
    }
    return Promise.reject(error)
  }
)

export default api
