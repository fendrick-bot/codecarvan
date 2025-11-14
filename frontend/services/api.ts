import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Token storage key
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// API Response types
interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
  message?: string;
}

interface RegisterResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
  message?: string;
}

interface User {
  id: number;
  email: string;
  name: string;
}

// Token management
export const tokenService = {
  // Get token from storage
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Save token to storage
  saveToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  },

  // Remove token from storage
  removeToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // Get user from storage
  getUser: async (): Promise<User | null> => {
    try {
      const userStr = await AsyncStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Save user to storage
  saveUser: async (user: User): Promise<void> => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },
};

// API request function with automatic token handling
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const token = await tokenService.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    // If token is expired or invalid, try to refresh
    if (response.status === 403 || response.status === 401) {
      const currentToken = await tokenService.getToken();
      if (currentToken) {
        // Try to refresh the token
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`,
            },
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            await tokenService.saveToken(refreshData.token);
            await tokenService.saveUser(refreshData.user);
            
            // Retry the original request with new token
            headers['Authorization'] = `Bearer ${refreshData.token}`;
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers,
            });
            const retryData = await retryResponse.json();
            
            if (retryResponse.ok) {
              return { data: retryData };
            }
          }
        } catch (refreshError) {
          // Refresh failed, token is invalid
          await tokenService.removeToken();
          return { error: 'Session expired. Please login again.' };
        }
        
        // Token is invalid, clear it
        await tokenService.removeToken();
        return { error: 'Session expired. Please login again.' };
      }
    }

    if (!response.ok) {
      return { error: data.error || 'Request failed' };
    }

    return { data };
  } catch (error: any) {
    console.error('API request error:', error);
    return { error: error.message || 'Network error' };
  }
};

// Auth API
export const authAPI = {
  // Login
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiRequest<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      await tokenService.saveToken(response.data.token);
      await tokenService.saveUser(response.data.user);
    }

    return response;
  },

  // Register
  register: async (
    email: string,
    password: string,
    name: string
  ): Promise<ApiResponse<RegisterResponse>> => {
    const response = await apiRequest<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    if (response.data) {
      await tokenService.saveToken(response.data.token);
      await tokenService.saveUser(response.data.user);
    }

    return response;
  },

  // Get current user (validates token)
  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    return await apiRequest<{ user: User }>(API_ENDPOINTS.AUTH.ME);
  },

  // Refresh token (direct call to avoid recursion)
  refreshToken: async (): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      const token = await tokenService.getToken();
      if (!token) {
        return { error: 'No token available' };
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Token refresh failed' };
      }

      await tokenService.saveToken(data.token);
      await tokenService.saveUser(data.user);

      return { data };
    } catch (error: any) {
      console.error('Token refresh error:', error);
      return { error: error.message || 'Token refresh failed' };
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    await tokenService.removeToken();
  },
};

// Questions API
export const questionsAPI = {
  // Get all questions
  getAll: async (category?: string): Promise<ApiResponse<any[]>> => {
    const endpoint = category
      ? `${API_ENDPOINTS.QUESTIONS.LIST}?category=${category}`
      : API_ENDPOINTS.QUESTIONS.LIST;
    return await apiRequest<any[]>(endpoint);
  },

  // Get question by ID
  getById: async (id: number): Promise<ApiResponse<any>> => {
    return await apiRequest<any>(API_ENDPOINTS.QUESTIONS.BY_ID(id));
  },
};

// Categories API
export const categoriesAPI = {
  // Get all categories
  getAll: async (): Promise<ApiResponse<string[]>> => {
    return await apiRequest<string[]>(API_ENDPOINTS.CATEGORIES);
  },
};

// Quiz API
export const quizAPI = {
  // Submit quiz
  submit: async (answers: Array<{ questionId: number; selectedAnswer: number }>): Promise<ApiResponse<any>> => {
    return await apiRequest<any>(API_ENDPOINTS.QUIZ.SUBMIT, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
};

// Health API
export const healthAPI = {
  // Check health
  check: async (): Promise<ApiResponse<{ status: string; message: string }>> => {
    return await apiRequest<{ status: string; message: string }>(API_ENDPOINTS.HEALTH);
  },
};

// Resources API
export const resourcesAPI = {
  // Upload resource PDF
  uploadPDF: async (formData: FormData): Promise<ApiResponse<any>> => {
    try {
      const token = await tokenService.getToken();
      
      const headers: HeadersInit = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RESOURCES.UPLOAD}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Upload failed' };
      }

      return { data };
    } catch (error: any) {
      console.error('Resource upload error:', error);
      return { error: error.message || 'Network error' };
    }
  },

  // Get all resources
  getAll: async (subject?: string): Promise<ApiResponse<any[]>> => {
    const endpoint = subject
      ? `${API_ENDPOINTS.RESOURCES.LIST}?subject=${subject}`
      : API_ENDPOINTS.RESOURCES.LIST;
    return await apiRequest<any[]>(endpoint);
  },

  // Get resource by ID
  getById: async (id: number): Promise<ApiResponse<any>> => {
    return await apiRequest<any>(API_ENDPOINTS.RESOURCES.BY_ID(id));
  },

  // Delete resource
  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return await apiRequest<{ message: string }>(API_ENDPOINTS.RESOURCES.DELETE(id), {
      method: 'DELETE',
    });
  },
};

