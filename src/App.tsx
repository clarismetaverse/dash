import { FormEvent, useState } from 'react';
import InfluencerDiscoveryPage from './InfluencerDiscoveryPage';

const AUTH_TOKEN_STORAGE_KEY = 'vic_auth_token';
const XANO_AUTH_ENDPOINT =
  process.env.REACT_APP_XANO_AUTH_ENDPOINT ||
  'https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/auth_vic_login';

function SignInPage({ onSignIn }: { onSignIn: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(XANO_AUTH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Invalid email or password.');
      }

      const token = data?.authToken || data?.auth_token || data?.token || data?.access_token;

      if (!token || typeof token !== 'string') {
        throw new Error('Sign-in succeeded but no auth token was returned.');
      }

      onSignIn(token);
    } catch (err) {
      setError((err as Error).message || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-medium text-neutral-500">Access</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">Sign in</h1>
        <p className="mt-2 text-sm text-neutral-500">Sign in with your account to access Influencer Discovery.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
          />
          <label className="block text-sm font-medium text-neutral-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-2xl bg-neutral-900 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || '');

  function handleSignIn(token: string) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    setAuthToken(token);
  }

  function handleSignOut() {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setAuthToken('');
  }

  if (!authToken) {
    return <SignInPage onSignIn={handleSignIn} />;
  }

  return <InfluencerDiscoveryPage authToken={authToken} onSignOut={handleSignOut} />;
}
