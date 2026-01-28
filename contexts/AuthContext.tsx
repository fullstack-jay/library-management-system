'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { LoginRequest } from '@/lib/viewmodels/requests/AuthRequest';
import { authService } from '@/lib/services';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    if (typeof window !== 'undefined') {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // Validate JSON before parsing
          if (storedUser === 'undefined' || storedUser === 'null') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } else {
            const parsedUser = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(parsedUser);
          }
        }
      } catch (error) {
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // REAL LOGIN - Menghubungkan ke backend Java
  const login = async (data: LoginRequest) => {
    try {
      const response = await authService.login(data);
      setToken(response.token);
      setUser(response.user);

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (error: any) {
      // Extract error message from backend response
      const message = error.response?.data?.message;
      const data = error.response?.data?.data;

      // Prioritize data field for more specific error message
      let errorMessage = error.message || 'Login failed. Please try again.';

      if (data) {
        // Use data field as primary error message (more specific)
        errorMessage = data;
      } else if (message) {
        // Fallback to message field if data is not available
        errorMessage = message;
      }

      throw new Error(errorMessage);
    }
  };

  // MOCK LOGIN - Untuk demo tanpa backend (COMMENT jika menggunakan backend)
  // const login = async (data: LoginRequest) => {
  //   try {
  //     await new Promise(resolve => setTimeout(resolve, 500));
  //     const mockUsers = {
  //       admin: { username: 'admin', password: 'admin123', id: 1, email: 'admin@library.com', role: 'ADMIN' as const, nama: 'Admin Perpustakaan' },
  //       user: { username: 'user', password: 'user123', id: 2, email: 'mahasiswa@library.com', role: 'USER' as const, nama: 'Mahasiswa Demo', nim: '12345678', jurusan: 'Teknik Informatika' }
  //     };
  //     const mockUser = Object.values(mockUsers).find(u => u.username === data.username && u.password === data.password);
  //     if (!mockUser) throw new Error('Username atau password salah!');
  //     const mockToken = `mock-token-${mockUser.username}-${Date.now()}`;
  //     const user: User = { id: mockUser.id, username: mockUser.username, email: mockUser.email, role: mockUser.role, nama: mockUser.nama, nim: mockUser.nim, jurusan: mockUser.jurusan };
  //     setToken(mockToken); setUser(user);
  //     if (typeof window !== 'undefined') {
  //       localStorage.setItem('token', mockToken);
  //       localStorage.setItem('user', JSON.stringify(user));
  //     }
  //   } catch (error: any) {
  //     throw error;
  //   }
  // };
  //
  // const register = async (data: RegisterRequest) => {
  //   try {
  //     await new Promise(resolve => setTimeout(resolve, 500));
  //     const mockToken = `mock-token-${data.username}-${Date.now()}`;
  //     const user: User = { id: Date.now(), username: data.username, email: data.email, role: 'USER', nama: data.nama, nim: data.nim, jurusan: data.jurusan };
  //     setToken(mockToken); setUser(user);
  //     if (typeof window !== 'undefined') {
  //       localStorage.setItem('token', mockToken);
  //       localStorage.setItem('user', JSON.stringify(user));
  //     }
  //   } catch (error: any) {
  //     throw error;
  //   }
  // };

  const logout = () => {
    setUser(null);
    setToken(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
