import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('iris_token'));
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => localStorage.getItem('iris_demo') === 'true');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (localStorage.getItem('iris_token')) {
        const u = await api.auth.getMe();
        setUser(u);
      } else if (isDemoMode) {
        setUser({
          id: 0,
          email: 'demo@irislab.ai',
          full_name: 'Demo Reviewer',
          role: 'user',
          created_at: new Date().toISOString(),
          settings: { theme: 'dark', language: 'en' },
        });
      } else {
        setUser(null);
      }
    } catch (e) {
      console.warn('Session expired or offline:', e);
      localStorage.removeItem('iris_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token, isDemoMode]);

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const resp = await api.auth.login(email, password, rememberMe);
      localStorage.setItem('iris_token', resp.access_token);
      setToken(resp.access_token);
      setUser(resp.user);
      setIsDemoMode(false);
      localStorage.removeItem('iris_demo');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const resp = await api.auth.register(name, email, password);
      localStorage.setItem('iris_token', resp.access_token);
      setToken(resp.access_token);
      setUser(resp.user);
      setIsDemoMode(false);
      localStorage.removeItem('iris_demo');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('iris_token');
    localStorage.removeItem('iris_demo');
    setToken(null);
    setUser(null);
    setIsDemoMode(false);
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem('iris_demo', 'true');
    setUser({
      id: 0,
      email: 'demo@irislab.ai',
      full_name: 'Reviewer / Faculty (Demo Mode)',
      role: 'admin',
      created_at: new Date().toISOString(),
      settings: { theme: 'dark', language: 'en' },
    });
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    localStorage.removeItem('iris_demo');
    if (!token) setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user || isDemoMode,
        isDemoMode,
        isLoading,
        login,
        register,
        logout,
        enableDemoMode,
        disableDemoMode,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
