
'use client';
import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  username: string;
  apiKey?: string;
  phoneNumber?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, apikey?: string, phone?: string) => void;
  logout: () => void;
  updateUserSettings: (settings: { apiKey?: string; phoneNumber?: string }) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('isAuthenticated');
      const storedUser = localStorage.getItem('user');
      if (storedAuth === 'true' && storedUser) {
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to access local storage:", error);
      // Handle environments where localStorage is not available or restricted
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((username: string, apiKey?: string, phoneNumber?: string) => {
    const newUser: User = { username, apiKey, phoneNumber };
    setIsAuthenticated(true);
    setUser(newUser);
    try {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error("Failed to access local storage:", error);
    }
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Failed to access local storage:", error);
    }
    router.push('/login');
  }, [router]);

  const updateUserSettings = useCallback((settings: { apiKey?: string; phoneNumber?: string }) => {
    if (user) {
      const updatedUser = { ...user, ...settings };
      setUser(updatedUser);
      try {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Failed to access local storage:", error);
      }
    }
  }, [user]);
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUserSettings, isLoading }}>
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
