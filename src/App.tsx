import { FormEvent, useState } from 'react';
import InfluencerDiscoveryPage from './InfluencerDiscoveryPage';
import { useAuth } from './useAuth';

function SignInPage({ onSignIn }: { onSignIn: (email: string, password: string) => Promise<void> }) {
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
      await onSignIn(trimmedEmail, password);
    } catch (err) {
      setError((err as Error).message || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
import InfluencerDiscoveryPage from "./InfluencerDiscoveryPage";

export default function App() {
  return <InfluencerDiscoveryPage />;
}
