import axios from 'axios';
import type { User, Event as AppEvent, Comment, UserRole, CreateEventInput, Notification as AppNotification } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
      localStorage.removeItem('authToken');
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

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

export const usersApi = {
  getAll: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  updateRole: async (userId: string, role: UserRole) => {
    const response = await api.patch<User>(`/users/${userId}/role`, { role });
    return response.data;
  }
};

export const eventsApi = {
  getAll: async () => {
    const response = await api.get<AppEvent[]>('/events');
    return response.data;
  },

  getApproved: async () => {
    const response = await api.get<AppEvent[]>('/events/approved');
    return response.data;
  },

  create: async (data: CreateEventInput) => {
    const response = await api.post<AppEvent>('/events', data);
    return response.data;
  },

  update: async (id: string, data: Partial<AppEvent>) => {
    const response = await api.patch<AppEvent>(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/events/${id}`);
    return response.data;
  },

  addComment: async (eventId: string, text: string) => {
    const response = await api.post<Comment>(`/events/${eventId}/comments`, { text });
    return response.data;
  },

  toggleAttend: async (id: string) => {
    const response = await api.post<{ isAttending: boolean; attendees: number }>(`/events/${id}/attend`);
    return response.data;
  },

  toggleSave: async (id: string) => {
    const response = await api.post<{ isSaved: boolean }>(`/events/${id}/save`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.post<AppEvent>(`/events/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, reason: string) => {
    const response = await api.post<AppEvent>(`/events/${id}/reject`, { reason });
    return response.data;
  },

  resubmit: async (id: string) => {
    // Backend should set status to 'pending' and clear rejectionReason
    const response = await api.post<AppEvent>(`/events/${id}/resubmit`);
    return response.data;
  }
};

export const notificationsApi = {
  getAll: async () => {
    const response = await api.get<AppNotification[]>('/notifications');
    return response.data;
  },

  markRead: async (id: string) => {
    const response = await api.patch<{ success: boolean }>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.patch<{ success: boolean }>('/notifications/read-all');
    return response.data;
  }
};

export default api;