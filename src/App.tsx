import { FormEvent, useState } from 'react';
import InfluencerDiscoveryPage from './InfluencerDiscoveryPage';

const AUTH_TOKEN_STORAGE_KEY = 'vic_auth_token';

function SignInPage({ onSignIn }: { onSignIn: (token: string) => void }) {
  const [tokenInput, setTokenInput] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedToken = tokenInput.trim();
    if (!trimmedToken) {
      return;
    }

    onSignIn(trimmedToken);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-medium text-neutral-500">Access</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">Sign in</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Enter your VIC auth token to load the Influencer Discovery dashboard.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="token">
            Bearer token
          </label>
          <textarea
            id="token"
            rows={4}
            placeholder="Paste token here"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
          />
          <button
            type="submit"
            className="h-11 w-full rounded-2xl bg-neutral-900 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Sign in
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
