import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthResponse, UserRole } from '../types';

interface AuthUser {
  userId: number;
  username: string;
  email: string;
  role: UserRole;
  token: string;
  fullName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isMerchant: boolean;
  login: (authResponse: AuthResponse & { fullName?: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('eshop_token');
    const userStr = localStorage.getItem('eshop_user');
    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        localStorage.removeItem('eshop_token');
        localStorage.removeItem('eshop_user');
      }
    }
  }, []);

  const login = (authResponse: AuthResponse & { fullName?: string }) => {
    const authUser: AuthUser = {
      userId: authResponse.userId,
      username: authResponse.username,
      email: authResponse.email,
      role: authResponse.role,
      token: authResponse.token,
      fullName: authResponse.fullName,
    };
    localStorage.setItem('eshop_token', authResponse.token);
    localStorage.setItem('eshop_user', JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem('eshop_token');
    localStorage.removeItem('eshop_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isCustomer: user?.role === 'CUSTOMER',
      isMerchant: user?.role === 'MERCHANT',
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
