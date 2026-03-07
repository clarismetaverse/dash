import { useCallback, useMemo, useState } from 'react';

const STORAGE_TOKEN_KEY = 'xano_jwt_token';
const XANO_BASE_URL = 'https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3';
const XANO_LOGIN_PATH = '/auth/login';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

type LoginPayload = {
  token?: string;
  authToken?: string;
};

export function useAuth() {
  const [token, setToken] = useState<string>(() => localStorage.getItem(STORAGE_TOKEN_KEY) ?? '');

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    setToken('');
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${XANO_BASE_URL}${XANO_LOGIN_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = (await response.json().catch(() => ({}))) as LoginPayload;
    const jwtToken = data.token ?? data.authToken;

    if (!response.ok || !jwtToken) {
      const fallback = response.status === 401 || response.status === 403 ? 'Invalid credentials or blocked origin (check Xano CORS Allowed Origins).' : 'Login failed.';
      throw new AuthError(fallback);
    }

    localStorage.setItem(STORAGE_TOKEN_KEY, jwtToken);
    setToken(jwtToken);
  }, []);

  const authenticatedFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      if (!token) {
        throw new AuthError('Missing auth token. Please sign in.');
      }

      const headers = new Headers(init?.headers ?? {});
      headers.set('Authorization', `Bearer ${token}`);

      const response = await fetch(`${XANO_BASE_URL}${path}`, {
        ...init,
        headers
      });

      if (response.status === 401 || response.status === 403) {
        signOut();
        throw new AuthError('Session expired. Please sign in again.');
      }

      return response;
    },
    [signOut, token]
  );

  return {
    token,
    isAuthenticated,
    login,
    signOut,
    authenticatedFetch
  };
}
