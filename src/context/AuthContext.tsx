import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'staff' | 'user';
  address?: string;
  job?: string;
  salary?: string;
  bio?: string;
  avatar?: string;
  coverPhoto?: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  loading: boolean;
  login: (user: UserSession, token?: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<UserSession>) => void;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Phục hồi session
    const savedSession = localStorage.getItem('user');
    const savedToken = localStorage.getItem('paw_token');

    if (savedSession) {
      try {
        setUser(JSON.parse(savedSession));
      } catch {
        localStorage.removeItem('user');
      }
    }
    if (savedToken) setToken(savedToken);

    setLoading(false);
  }, []);

  const login = (newUser: UserSession, newToken?: string) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    if (newToken) {
      setToken(newToken);
      localStorage.setItem('paw_token', newToken);
    }
  };

  const updateUser = (partial: Partial<UserSession>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('paw_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      isAdmin: user?.role === 'admin',
      isManager: user?.role === 'manager',
      isStaff: user?.role === 'staff',
      isUser: user?.role === 'user' || !user
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
