// API Configuration
// For physical devices, replace 'localhost' with your computer's IP address
// Example: 'http://192.168.1.100:3000/api'

export const API_BASE_URL = 'http://10.56.198.34:3000/api';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  QUESTIONS: {
    LIST: '/questions',
    BY_ID: (id: number) => `/questions/${id}`,
  },
  QUIZ: {
    SUBMIT: '/quiz/submit',
  },
  CATEGORIES: '/categories',
  HEALTH: '/health',
};

