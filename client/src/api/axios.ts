import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  }
);

// Response interceptor - Unpacks Standardized API Responses
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const body = response.data;
    
    // Check if the response follows the standardized backend response shape
    if (
      body &&
      typeof body === "object" &&
      "success" in body &&
      "data" in body
    ) {
      if (body.success) {
        // Unpack the data property onto response.data
        response.data = body.data;
      }
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
