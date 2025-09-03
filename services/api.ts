import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LoginRequest, RegisterRequest, User, Chat, Message, AuthResponse, FileResponse, Publication, CreatePublicationRequest, Comment, CreateCommentRequest } from '@/types/chat';
import { Config } from '@/config/Config';

const API_BASE_URL = Config.API_BASE_URL;
console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('authToken');
  },

  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    const response = await api.get(`/auth/check-username?username=${username}`);
    return response.data;
  },
};

// User Management
export const userAPI = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/info');
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  getOnlineUsers: async (): Promise<string[]> => {
    const response = await api.get('/users/online');
    return response.data;
  },
  updateExpoToken: async (token: string): Promise<void> => {
    await api.post('/users/expo/token', { token });
  }
};

// Chat Management
export const chatAPI = {
  getChatById: async (id: number): Promise<Chat> => {
    const response = await api.get(`/chats/${id}`);
    return response.data;
  },

  getUserChats: async (page = 0, size = 20): Promise<{ content: Chat[]; totalPages: number; totalElements: number }> => {
    const response = await api.get(`/chats?page=${page}&size=${size}`);
    return response.data;
  },

  getChatMessages: async (chatId: number, page = 0, size = 50): Promise<{ content: Message[]; totalPages: number; totalElements: number }> => {
    const response = await api.get(`/chats/${chatId}/messages?page=${page}&size=${size}`);
    return response.data;
  },

  createPrivateChat: async (otherUsername: string): Promise<Chat> => {
    const response = await api.post(`/chats/private?otherUsername=${otherUsername}`);
    return response.data;
  },

  createGroupChat: async (chatName: string, usernames: string[]): Promise<Chat> => {
    const params = new URLSearchParams();
    params.append('chatName', chatName);
    usernames.forEach(username => params.append('usernames', username));
    const response = await api.post(`/chats/group?${params.toString()}`);
    return response.data;
  },
};

// Publications Management
export const publicationAPI = {
  getAllPublications: async (page = 0, size = 20): Promise<{ content: Publication[]; totalPages: number; totalElements: number }> => {
    const response = await api.get(`/publications?page=${page}&size=${size}`);
    return response.data;
  },

  getPublicationById: async (id: number): Promise<Publication> => {
    const response = await api.get(`/publications/${id}`);
    return response.data;
  },

  createPublication: async (data: CreatePublicationRequest): Promise<Publication> => {
    const response = await api.post('/publications', data);
    return response.data;
  },

  updatePublication: async (id: number, data: Partial<CreatePublicationRequest>): Promise<Publication> => {
    const response = await api.put(`/publications/${id}`, data);
    return response.data;
  },

  deletePublication: async (id: number): Promise<void> => {
    await api.delete(`/publications/${id}`);
  },

  likePublication: async (id: number): Promise<void> => {
    await api.post(`/publications/${id}/like`);
  },

  unlikePublication: async (id: number): Promise<void> => {
    await api.delete(`/publications/${id}/like`);
  },

  getPublicationComments: async (id: number, page = 0, size = 20): Promise<{ content: Comment[]; totalPages: number; totalElements: number }> => {
    const response = await api.get(`/publications/${id}/comments?page=${page}&size=${size}`);
    return response.data;
  },
};

// Comments Management
export const commentAPI = {
  createComment: async (data: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post('/comments', data);
    return response.data;
  },

  deleteComment: async (id: number): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },
};

// File Management
export const fileAPI = {
  uploadFile: async (formData: FormData): Promise<FileResponse> => {
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadChatFile: async (formData: FormData, chatId: number): Promise<FileResponse> => {
    formData.append('chatId', chatId.toString());
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadFile: async (fileName: string): Promise<Blob> => {
    const response = await api.get(`/files/download/${fileName}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// WebRTC Management
export const webrtcAPI = {
  getConfig: async (): Promise<any> => {
    const response = await api.get('/webrtc/config');
    return response.data;
  },
};

// Legacy compatibility - keeping the old apiService for existing code
class ApiService {
  async login(credentials: LoginRequest) {
    return authAPI.login(credentials);
  }

  async register(userData: RegisterRequest) {
    return authAPI.register(userData);
  }

  async logout() {
    return authAPI.logout();
  }

  async getCurrentUser() {
    return userAPI.getCurrentUser();
  }

  async getUserChats(page = 0, size = 20) {
    return chatAPI.getUserChats(page, size);
  }

  async getChatMessages(chatId: number, page = 0, size = 50) {
    return chatAPI.getChatMessages(chatId, page, size);
  }

  async createPrivateChat(otherUsername: string) {
    return chatAPI.createPrivateChat(otherUsername);
  }

  async createGroupChat(chatName: string, usernames: string[]) {
    return chatAPI.createGroupChat(chatName, usernames);
  }

  async getOnlineUsers() {
    return userAPI.getOnlineUsers();
  }

  async getAllUsers() {
    return userAPI.getAllUsers();
  }

  async checkUsername(username: string) {
    return authAPI.checkUsername(username);
  }

  async getAllPublications(page = 0, size = 20) {
    return publicationAPI.getAllPublications(page, size);
  }

  async getPublicationById(id: number) {
    return publicationAPI.getPublicationById(id);
  }

  async createPublication(data: CreatePublicationRequest) {
    return publicationAPI.createPublication(data);
  }

  async updatePublication(id: number, data: Partial<CreatePublicationRequest>) {
    return publicationAPI.updatePublication(id, data);
  }

  async deletePublication(id: number) {
    return publicationAPI.deletePublication(id);
  }

  async likePublication(id: number) {
    return publicationAPI.likePublication(id);
  }

  async unlikePublication(id: number) {
    return publicationAPI.unlikePublication(id);
  }

  async getPublicationComments(id: number, page = 0, size = 20) {
    return publicationAPI.getPublicationComments(id, page, size);
  }

  async createComment(data: CreateCommentRequest) {
    return commentAPI.createComment(data);
  }

  async deleteComment(id: number) {
    return commentAPI.deleteComment(id);
  }

  async uploadFile(formData: FormData) {
    return fileAPI.uploadFile(formData);
  }

  async getWebRTCConfig() {
    return webrtcAPI.getConfig();
  }
}

export const apiService = new ApiService();
export default api;