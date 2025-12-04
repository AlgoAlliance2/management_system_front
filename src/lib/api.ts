import axios from 'axios';
import type { User } from '../types';

// 1. Create the Axios instance
const API_URL = import.meta.env.VITE_API_BACKEND_URL_LOCAL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor: Handle 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is expired or invalid, clear it and redirect
      localStorage.removeItem('authToken');
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

// 4. API Methods
export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    // Save token immediately upon success
    localStorage.setItem('authToken', response.data.token);
    return response.data.user;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post<{ token: string; user: User }>('/auth/register', {
      name,
      email,
      password,
    });
    localStorage.setItem('authToken', response.data.token);
    return response.data.user;
  },

  // Used to get current user data if token exists in localStorage on page reload
  getMe: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

export default api;