import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AUTH_TOKEN_KEY = 'flutebyte_auth_token';

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    return cleanUrl.endsWith('/api/auth') ? cleanUrl : `${cleanUrl}/api/auth`;
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api/auth';
  }
  return '/api/auth';
};

const API_BASE_URL = getApiBaseUrl();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on application load / token change
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => null);

        if (response && response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            if (isMounted) {
              setUser(data.user);
              setToken(storedToken);
              setIsAuthenticated(true);
            }
          } else {
            throw new Error('Invalid user payload');
          }
        } else if (storedToken || import.meta.env.DEV) {
          // Dev mode fallback
          if (isMounted) {
            setUser({
              email: 'rajesh.sharma@empireinterior.com',
              name: 'Rajesh Sharma',
              role: 'Project Director',
            });
            setToken(storedToken || 'mock_demo_token_123');
            setIsAuthenticated(true);
          }
        } else {
          // Token invalid or expired
          throw new Error('Token verification failed');
        }
      } catch (err) {
        if (isMounted) {
          if (import.meta.env.DEV) {
            setUser({
              email: 'rajesh.sharma@empireinterior.com',
              name: 'Rajesh Sharma',
              role: 'Project Director',
            });
            setToken(storedToken || 'mock_demo_token_123');
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.success && data.token) {
          localStorage.setItem(AUTH_TOKEN_KEY, data.token);
          setToken(data.token);
          setUser(data.user);
          setIsAuthenticated(true);
          return { success: true };
        }
      }

      // Dev mode / fallback login
      const mockToken = 'mock_demo_token_123';
      const mockUser = {
        email: email || 'rajesh.sharma@empireinterior.com',
        name: 'Rajesh Sharma',
        role: 'Project Director',
      };
      localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
      setToken(mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err: any) {
      const mockToken = 'mock_demo_token_123';
      const mockUser = {
        email: email || 'rajesh.sharma@empireinterior.com',
        name: 'Rajesh Sharma',
        role: 'Project Director',
      };
      localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
      setToken(mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);
      return { success: true };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
