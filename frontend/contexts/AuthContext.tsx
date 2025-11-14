import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI, tokenService } from '../services/api';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load stored auth and validate token on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await tokenService.getToken();
      const storedUser = await tokenService.getUser();

      if (storedToken && storedUser) {
        // Validate token by fetching current user
        const response = await authAPI.getCurrentUser();
        
        if (response.data) {
          // Token is valid, set user and token
          setToken(storedToken);
          setUser(response.data.user);
          // Update stored user in case it changed
          await tokenService.saveUser(response.data.user);
        } else {
          // Token is invalid, clear storage
          await tokenService.removeToken();
          setToken(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      // Clear invalid data
      await tokenService.removeToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.data) {
        setUser(response.data.user);
        await tokenService.saveUser(response.data.user);
      } else if (response.error) {
        // Token expired, logout
        await logout();
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    
    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await authAPI.register(email, password, name);
    
    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      // Clear local state even if API call fails
      setToken(null);
      setUser(null);
    }
  };

  // Auto-refresh token periodically (every 6 days, before 7-day expiry)
  useEffect(() => {
    if (!token) return;

    const refreshToken = async () => {
      try {
        const response = await authAPI.refreshToken();
        if (response.data) {
          setToken(response.data.token);
          setUser(response.data.user);
        } else if (response.error) {
          // Token refresh failed, logout
          await logout();
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    };

    // Refresh token every 6 days (before 7-day expiry)
    const interval = setInterval(refreshToken, 6 * 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

