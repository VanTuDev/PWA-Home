import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'staff' | 'user';
  createdAt: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (user: UserSession) => void;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize mock users and load active session on startup
  useEffect(() => {
    // 1. Initialize default users in localStorage if empty
    const savedUsers = localStorage.getItem('paw_users');
    if (!savedUsers) {
      localStorage.setItem('paw_users', JSON.stringify([
        {
          id: 'admin_01',
          name: 'Super Admin',
          email: 'admin@pawhome.vn',
          password: 'admin123',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      ]));
    }

    // 2. Load current session
    const currentSession = localStorage.getItem('user');
    if (currentSession) {
      try {
        setUser(JSON.parse(currentSession));
      } catch (e) {
        console.error("Failed to parse user session", e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (newUser: UserSession) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isStaff = user?.role === 'staff';
  const isUser = user?.role === 'user' || !user;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAdmin,
      isManager,
      isStaff,
      isUser
    }}>
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
