import { useEffect, useState } from 'react';

type Creator = {
  id: number | string;
  name: string;
  username: string;
  nationality: string;
  flag?: string;
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend.com';

export default function InfluencerDiscoveryPage() {
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

  useEffect(() => {
    async function fetchCreators() {
      setLoading(true);
      try {
        const query = new URLSearchParams({ username: search, nationality: country });
        const res = await fetch(`${API_BASE_URL}/users?${query.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch users');
        const data: Creator[] = await res.json();
        setCreators(data);
      } catch (err) {
        console.error(err);
        setCreators([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCreators();
  }, [search, country]);

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">Discovery</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Influencer Discovery</h1>
            <p className="mt-1 text-sm text-neutral-500">Search creators by name, username and nationality.</p>
          </div>

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

        {loading ? (
          <p className="text-sm text-neutral-500">Loading...</p>
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
                      {countries.find((c) => c.code === creator.nationality)?.name || creator.nationality}
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
