'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '@/types';
import { api }             from '@/lib/api';

interface AuthContextValue extends AuthState {
  login:  (controlNumber: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null });

  useEffect(() => {
    const token = localStorage.getItem('sissep_token');
    const user  = localStorage.getItem('sissep_user');
    if (token && user) setState({ token, user: JSON.parse(user) });
  }, []);

  async function login(controlNumber: string, password: string) {
    const data = await api.post<{ token: string; user: User }>('/auth/login', { controlNumber, password });
    localStorage.setItem('sissep_token', data.token);
    localStorage.setItem('sissep_user',  JSON.stringify(data.user));
    setState({ token: data.token, user: data.user });
  }

  function logout() {
    localStorage.removeItem('sissep_token');
    localStorage.removeItem('sissep_user');
    setState({ user: null, token: null });
  }

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
