import React, { createContext, useContext, useState } from 'react';
import { UserProfile } from '../types';
import { currentUser } from '../data/mockData';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, role: 'Admin' | 'Accountant') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('urban_furniture_user');
    return saved ? JSON.parse(saved) : currentUser;
  });

  const login = (email: string, role: 'Admin' | 'Accountant') => {
    const loggedUser: UserProfile = {
      id: `u-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      role,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    };
    setUser(loggedUser);
    localStorage.setItem('urban_furniture_user', JSON.stringify(loggedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('urban_furniture_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
