import { useCallback, useState } from 'react';

const AUTH_TOKEN_STORAGE_KEY = 'vic_auth_token';
const XANO_AUTH_ENDPOINT =
  process.env.REACT_APP_XANO_AUTH_ENDPOINT ||
  'https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/auth_vic_login';

type LoginResponse = {
  authToken?: string;
  auth_token?: string;
  token?: string;
  access_token?: string;
  auth?: {
    token?: string;
  };
  data?: {
    auth_token?: string;
  };
  message?: string;
  error?: string;
};

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

function extractToken(data: unknown): string | null {
  if (typeof data === 'string') {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return null;
  }

  const payload = data as LoginResponse;
  return (
    payload.authToken ||
    payload.auth_token ||
    payload.token ||
    payload.access_token ||
    payload.auth?.token ||
    payload.data?.auth_token ||
    null
  );
}

export function useAuth() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || '');

  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setAuthToken('');
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(XANO_AUTH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const rawBody = await response.text();
    let data: unknown = null;

    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        data = rawBody;
      }
    }

    if (!response.ok) {
      const message =
        (typeof data === 'object' && data && ('message' in data || 'error' in data)
          ? ((data as LoginResponse).message || (data as LoginResponse).error)
          : null) ||
        (typeof data === 'string' ? data : null) ||
        'Invalid email or password.';
      throw new Error(message);
    }

    const token = extractToken(data);

    if (!token) {
      throw new Error('Sign-in succeeded but no auth token was returned.');
    }

    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    setAuthToken(token);
    return token;
  }, []);

  const authenticatedFetch = useCallback(
    async (input: RequestInfo | URL, init: RequestInit = {}) => {
      if (!authToken) {
        throw new AuthError('Please sign in to continue.');
      }

      const headers = new Headers(init.headers || {});
      if (!headers.has('Authorization')) {
        const authorizationHeader = authToken.toLowerCase().startsWith('bearer ') ? authToken : `Bearer ${authToken}`;
        headers.set('Authorization', authorizationHeader);
      }

      const response = await fetch(input, {
        ...init,
        headers
      });

      if (response.status === 401 || response.status === 403) {
        signOut();
        throw new AuthError('Your session expired. Please sign in again.');
      }

      return response;
    },
    [authToken, signOut]
  );

  return {
    authToken,
    login,
    signOut,
    authenticatedFetch
  };
}
