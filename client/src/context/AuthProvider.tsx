import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, setUnauthorizedHandler } from '../lib/api';
import type { User } from '../lib/types';
import { AuthContext, type AuthValue } from './authContext';
import { useToast } from './toastContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const toast = useToast();
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Restore the session from the httpOnly cookie.
  useEffect(() => {
    let active = true;
    api
      .get<{ user: User }>('/auth/me')
      .then((res) => active && setUser(res.user))
      .catch(() => active && setUser(null))
      .finally(() => active && setInitializing(false));
    return () => {
      active = false;
    };
  }, []);

  // Any 401 from a protected call: drop the user; ProtectedRoute then redirects to /login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (userRef.current) toast.error('Your session has ended. Please log in again.');
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, [toast]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ user: User }>('/auth/login', { email, password });
    setUser(res.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post<{ user: User }>('/auth/register', { name, email, password });
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, initializing, login, register, logout }),
    [user, initializing, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
