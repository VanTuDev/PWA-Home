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
  token: string | null;
  loading: boolean;
  login: (user: UserSession, token?: string) => void;
  logout: () => void;
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
    // Khởi tạo admin mặc định trong localStorage (fallback offline)
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
