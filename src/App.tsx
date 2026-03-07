import { FormEvent, useState } from 'react';
import InfluencerDiscoveryPage from './InfluencerDiscoveryPage';
import { AuthError, useAuth } from './useAuth';

function LoginView({ onSubmit }: { onSubmit: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(email, password);
    } catch (err) {
      const message = err instanceof AuthError ? err.message : 'Unable to sign in.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-semibold text-neutral-900">Sign in</h1>
        <p className="text-sm text-neutral-500">Use your Xano credentials to access the discovery dashboard.</p>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-neutral-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-neutral-900"
            required
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-neutral-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-neutral-900"
            required
          />
        </label>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-neutral-900 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

export default function App() {
  const { isAuthenticated, login, signOut, authenticatedFetch } = useAuth();

  if (!isAuthenticated) {
    return <LoginView onSubmit={login} />;
  }

  return <InfluencerDiscoveryPage authenticatedFetch={authenticatedFetch} onUnauthorized={signOut} />;
}
