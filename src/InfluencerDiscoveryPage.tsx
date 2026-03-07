import { useEffect, useMemo, useState } from 'react';
import { AuthError } from './useAuth';

export type Influencer = {
  id: number;
  name: string;
  username: string;
  nationality: string;
  flag?: string;
  platforms?: string[];
  bio?: string;
  hq?: string;
  hasEmail?: boolean;
  hasPhone?: boolean;
};

type Props = {
  authenticatedFetch: (path: string, init?: RequestInit) => Promise<Response>;
  onUnauthorized: () => void;
};

const COUNTRIES = [
  { value: '', label: 'All countries' },
  { value: 'Italy', label: 'Italy' },
  { value: 'United States', label: 'United States' },
  { value: 'Spain', label: 'Spain' },
  { value: 'France', label: 'France' },
  { value: 'Germany', label: 'Germany' },
  { value: 'United Kingdom', label: 'United Kingdom' }
];

export default function InfluencerDiscoveryPage({ authenticatedFetch, onUnauthorized }: Props) {
  const [search, setSearch] = useState('');
  const [nationality, setNationality] = useState('');
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set('username', search.trim());
    }
    if (nationality) {
      params.set('nationality', nationality);
    }
    const query = params.toString();
    return query ? `?${query}` : '';
  }, [nationality, search]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadInfluencers() {
      setLoading(true);
      setError('');

      try {
        const response = await authenticatedFetch(`/users_Upgrade${queryString}`, {
          method: 'GET',
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Failed to load creators.');
        }

        const payload = (await response.json()) as Influencer[];
        setInfluencers(Array.isArray(payload) ? payload : []);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        if (err instanceof AuthError) {
          onUnauthorized();
          setError(err.message);
          setInfluencers([]);
          return;
        }

        setError((err as Error).message || 'Unable to fetch creators.');
        setInfluencers([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadInfluencers();

    return () => controller.abort();
  }, [authenticatedFetch, onUnauthorized, queryString]);

  return (
    <main className="min-h-screen bg-neutral-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">Discovery</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Influencer Discovery</h1>
          </div>

          <div className="grid w-full gap-3 md:w-auto md:grid-cols-[1.2fr_220px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or @username"
              className="h-11 rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-900"
            />
            <select
              value={nationality}
              onChange={(event) => setNationality(event.target.value)}
              className="h-11 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 outline-none focus:border-neutral-900"
            >
              {COUNTRIES.map((country) => (
                <option key={country.label} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-sm text-neutral-500 shadow-sm ring-1 ring-black/5">Loading creators...</div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {influencers.map((creator) => (
              <article key={creator.id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">{creator.name}</h2>
                    <p className="text-sm text-neutral-500">@{creator.username}</p>
                  </div>
                  <span className="text-xl" title={creator.nationality}>
                    {creator.flag ?? '🌐'}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(creator.platforms ?? []).map((platform) => (
                    <span key={platform} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                      {platform}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-sm text-neutral-600">{creator.bio ?? 'No bio available.'}</p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-neutral-400">HQ: {creator.hq ?? 'N/A'}</p>

                <div className="mt-4 flex gap-2 text-xs">
                  {creator.hasEmail ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Email</span> : null}
                  {creator.hasPhone ? <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Phone</span> : null}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
