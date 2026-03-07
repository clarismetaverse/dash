import { useEffect, useMemo, useState } from 'react';

type Creator = {
  id: number | string;
  name: string;
  username: string;
  nationality: string;
  flag?: string;
};

type XanoCreator = {
  id?: number | string;
  full_name?: string;
  name?: string;
  username?: string;
  handle?: string;
  nationality?: string;
  country_code?: string;
  country?: string;
};

const XANO_SEARCH_ENDPOINT =
  process.env.REACT_APP_XANO_INFLUENCER_SEARCH_ENDPOINT ||
  'https://xbut-eryu-hhsg.f2.xano.io/workspace/1-0/api/32/query/1812';

function normalizeCreator(creator: XanoCreator): Creator {
  const name = creator.full_name || creator.name || creator.username || 'Unknown creator';
  const username = creator.username || creator.handle || '';
  const nationality = creator.nationality || creator.country_code || creator.country || '';

  return {
    id: creator.id || `${name}-${username}`,
    name,
    username: username.startsWith('@') || username.length === 0 ? username : `@${username}`,
    nationality
  };
}

export default function InfluencerDiscoveryPage({
  authToken,
  onSignOut
}: {
  authToken: string;
  onSignOut: () => void;
}) {
  const countries = [
    { code: '', name: 'All countries', flag: '🌍' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' }
  ];

  const [creators, setCreators] = useState<Creator[]>([]);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trimmedSearch = useMemo(() => search.trim(), [search]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCreators() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(XANO_SEARCH_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({
            q: trimmedSearch,
            user_interest_topics_turbo_id: [],
            nationality: country
          }),
          signal: controller.signal
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error('Your token is invalid or expired. Please sign in again.');
          }
          throw new Error('Failed to fetch creators');
        }

        const data = await res.json();
        const creatorsList = Array.isArray(data) ? data : [];
        setCreators(creatorsList.map((creator) => normalizeCreator(creator)));
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          const message = (err as Error).message || 'Unable to load creators right now.';
          setError(message);
          setCreators([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCreators();

    return () => {
      controller.abort();
    };
  }, [trimmedSearch, country, authToken]);

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">Discovery</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Influencer Discovery</h1>
            <p className="mt-1 text-sm text-neutral-500">Search creators by name, username and nationality.</p>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
            <button
              type="button"
              onClick={onSignOut}
              className="h-10 rounded-2xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
            >
              Sign out
            </button>
            <div className="grid w-full gap-3 md:w-auto md:grid-cols-[1.2fr_220px]">
              <input
                placeholder="Search name or @username"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-neutral-900"
              />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-11 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 outline-none focus:border-neutral-900"
              >
                {countries.map((c) => (
                  <option key={c.code || 'all'} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-neutral-500">Loading...</p>
        ) : creators.length === 0 ? (
          <p className="text-sm text-neutral-500">No creators found for the current filters.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {creators.map((creator) => (
              <div
                key={creator.id}
                className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-lg font-semibold text-neutral-600">
                    {creator.name
                      .split(' ')
                      .map((part: string) => part[0])
                      .join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-base font-semibold text-neutral-900">{creator.name}</h2>
                    </div>
                    <p className="text-sm text-neutral-500">{creator.username}</p>
                    <p className="mt-2 text-sm text-neutral-700">
                      {creator.flag || countries.find((c) => c.code === creator.nationality)?.flag || '🌍'}{' '}
                      {countries.find((c) => c.code === creator.nationality)?.name || creator.nationality || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
