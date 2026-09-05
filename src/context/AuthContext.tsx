import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api, getToken, setToken, removeToken } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; user?: UserProfile; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('urban_furniture_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) {
          return {
            ...parsed,
            role: parsed.role.toUpperCase(),
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Restore authenticated session on start
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        if (data && data.user) {
          const formattedUser: UserProfile = {
            id: data.user.id || data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role?.toUpperCase() || 'ACCOUNTANT',
            contactId: data.user.contactId,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
            isActive: data.user.isActive,
          };
          setUser(formattedUser);
          localStorage.setItem('urban_furniture_user', JSON.stringify(formattedUser));
        }
      } catch (error) {
        console.warn('[AuthContext] Session restore note:', error);
        removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password = 'password123') => {
    try {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();

      // 1. Attempt Real Backend API Login
      let res: any;
      try {
        res = await api.login({ email: cleanEmail, password });
      } catch (networkErr) {
        console.warn('[AuthContext] Backend API unreachable or connecting, checking credentials fallback:', networkErr);
        // Fallback for seamless demo offline mode
        if (cleanEmail === 'admin@urbanfurniture.com' && (password === 'Admin@123' || password === 'password123')) {
          res = {
            success: true,
            token: 'demo-jwt-token-admin',
            user: {
              id: 'u-admin-01',
              name: 'Business Owner (Admin)',
              email: cleanEmail,
              role: 'ADMIN',
              contactId: null,
              isActive: true,
            },
          };
        } else if (cleanEmail === 'accountant@urbanfurniture.com' && (password === 'Accountant@123' || password === 'password123')) {
          res = {
            success: true,
            token: 'demo-jwt-token-accountant',
            user: {
              id: 'u-accountant-02',
              name: 'Senior Accountant',
              email: cleanEmail,
              role: 'ACCOUNTANT',
              contactId: null,
              isActive: true,
            },
          };
        } else if (cleanEmail === 'customer@urbanfurniture.com' && (password === 'Customer@123' || password === 'password123')) {
          res = {
            success: true,
            token: 'demo-jwt-token-contact',
            user: {
              id: 'u-contact-03',
              name: 'Royal Oak Interiors (Demo Customer)',
              email: cleanEmail,
              role: 'CONTACT',
              contactId: 'cnt-1',
              isActive: true,
            },
          };
        } else {
          throw networkErr;
        }
      }

      if (res && res.success && res.user) {
        if (res.token) {
          setToken(res.token);
        }
        const loggedUser: UserProfile = {
          id: res.user.id || res.user._id,
          name: res.user.name,
          email: res.user.email,
          role: (res.user.role || 'ACCOUNTANT').toUpperCase(),
          contactId: res.user.contactId || (res.user.role?.toUpperCase() === 'CONTACT' ? 'cnt-1' : null),
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
          isActive: res.user.isActive !== false,
        };
        setUser(loggedUser);
        localStorage.setItem('urban_furniture_user', JSON.stringify(loggedUser));
        return { success: true, user: loggedUser };
      }
      return { success: false, message: res?.message || 'Invalid email or password' };
    } catch (err: any) {
      console.error('[AuthContext] Login error:', err);
      return { success: false, message: err.message || 'Login failed. Please check credentials.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout().catch(() => {});
    } finally {
      removeToken();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      if (data && data.user) {
        const formattedUser: UserProfile = {
          id: data.user.id || data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: (data.user.role || 'ACCOUNTANT').toUpperCase(),
          contactId: data.user.contactId,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
          isActive: data.user.isActive,
        };
        setUser(formattedUser);
        localStorage.setItem('urban_furniture_user', JSON.stringify(formattedUser));
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
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
