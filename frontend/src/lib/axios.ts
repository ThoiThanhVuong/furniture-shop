import { useAuthStore } from "@/store/useStore";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== "undefined") {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          useAuthStore.getState().logout();
          window.location.href = "/auth/login";
        }
      }

      // Handle other errors
      const message = error.response.data?.message || "Đã xảy ra lỗi";
      return Promise.reject(new Error(message));
    }

    return Promise.reject(error);
  }
);

export default api;
