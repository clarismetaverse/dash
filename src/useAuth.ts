import { useCallback, useMemo, useState } from 'react';

const STORAGE_TOKEN_KEY = 'xano_jwt_token';
const XANO_BASE_URL = import.meta.env.VITE_XANO_BASE_URL ?? 'https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3';
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
  access_token?: string;
  auth?: {
    token?: string;
  };
};

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const data = payload as LoginPayload;
  return data.token ?? data.authToken ?? data.access_token ?? data.auth?.token ?? null;
}

export function useAuth() {
  const [token, setToken] = useState<string>(() => localStorage.getItem(STORAGE_TOKEN_KEY) ?? '');

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    setToken('');
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    let response: Response;

    try {
      response = await fetch(`${XANO_BASE_URL}${XANO_LOGIN_PATH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
    } catch {
      throw new AuthError('Unable to reach the login service. This may be a network or CORS/origin issue.');
    }

    const data = await safeJson(response);
    const jwtToken = extractToken(data);

    if (response.status === 401) {
      throw new AuthError('Invalid email or password.');
    }

    if (response.status === 403) {
      throw new AuthError('Login blocked by origin or permissions. Check Xano CORS Allowed Origins.');
    }

    if (!response.ok) {
      throw new AuthError('Login failed.');
    }

    if (!jwtToken) {
      throw new AuthError('Login succeeded but no auth token was returned.');
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

      let response: Response;

      try {
        response = await fetch(`${XANO_BASE_URL}${path}`, {
          ...init,
          headers
        });
      } catch {
        throw new AuthError('Unable to reach the API. Please check your network connection and try again.');
      }

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
