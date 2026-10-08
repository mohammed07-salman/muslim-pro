import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; city?: string; country?: string; latitude?: number; longitude?: number }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  updatePreferences: (data: Partial<User>) => Promise<boolean>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'forgot';
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot') => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mp_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('mp_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${savedToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('mp_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      localStorage.setItem('mp_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const register = async (userData: { name: string; email: string; password: string; city?: string; country?: string; latitude?: number; longitude?: number }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      localStorage.setItem('mp_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('mp_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        setUser(result.user);
        return true;
      }
    } catch (err) {
      console.error('Update profile error:', err);
    }
    return false;
  };

  const updatePreferences = async (data: Partial<User>): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        setUser(result.user);
        return true;
      }
    } catch (err) {
      console.error('Update preferences error:', err);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        refreshUser
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
