import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from './api';

interface User {
  id: string;
  email: string;
  name: string;
  emirate: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; emirate: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pawmatch_token');
    if (token) {
      api.auth
        .me()
        .then((data) => setUser(data as unknown as User))
        .catch(() => localStorage.removeItem('pawmatch_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user: userData } = await api.auth.login({ email, password });
    localStorage.setItem('pawmatch_token', token);
    setUser(userData as unknown as User);
  };

  const register = async (data: { email: string; password: string; name: string; emirate: string }) => {
    const { token, user: userData } = await api.auth.register(data);
    localStorage.setItem('pawmatch_token', token);
    setUser(userData as unknown as User);
  };

  const logout = () => {
    localStorage.removeItem('pawmatch_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
