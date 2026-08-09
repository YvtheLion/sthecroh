'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { authApi, usersApi, AuthUser, ApiError } from './api';

const TOKEN_KEY = 'sthecroh_token';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<{ requiresTwoFactor?: boolean }>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (t: string) => {
    try {
      const profile = await usersApi.me(t);
      setUser(profile);
      setToken(t);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      loadProfile(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadProfile]);

  const login = useCallback(
    async (email: string, password: string, twoFactorCode?: string) => {
      const result = await authApi.login({ email, password, twoFactorCode });
      if ('requiresTwoFactor' in result) {
        return { requiresTwoFactor: true };
      }
      localStorage.setItem(TOKEN_KEY, result.accessToken);
      await loadProfile(result.accessToken);
      return {};
    },
    [loadProfile],
  );

  const register = useCallback(
    async (data: { email: string; password: string; firstName: string; lastName: string }) => {
      await authApi.register(data);
      // Le compte est créé avec le statut PENDING (vérification e-mail) — on tente
      // ensuite une connexion directe pour les besoins de la démo locale.
      await login(data.email, data.password);
    },
    [login],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>');
  return ctx;
}

export { ApiError };
