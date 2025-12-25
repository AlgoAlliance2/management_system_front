import axios from 'axios';
import type { User, Event as AppEvent } from '../types';

// 1. Create the Axios instance
const API_URL = import.meta.env.VITE_API_BACKEND_URL_LOCAL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

  getMe: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};


// Clean Event API methods
export const eventsApi = {
  getAll: async () => {
    const response = await api.get<AppEvent[]>('/events');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post<AppEvent>('/events', data);
    return response.data;
  },

  // Returns the updated fields so we can update local state accurately
  toggleAttend: async (id: string) => {
    const response = await api.post<{ isAttending: boolean; attendees: number }>(`/events/${id}/attend`);
    return response.data;
  },

  toggleSave: async (id: string) => {
    const response = await api.post<{ isSaved: boolean }>(`/events/${id}/save`);
    return response.data;
  }
};

export default api;