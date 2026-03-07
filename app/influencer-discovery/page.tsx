"use client";

import { useEffect, useMemo, useState } from "react";

type CountryOption = {
  code: string;
  name: string;
  flag: string;
};

type ApiCreator = Record<string, unknown>;

type CreatorCard = {
  id: number | string;
  name: string;
  username: string;
  nationality: string;
  flag: string;
  platforms: string[];
  hasEmail: boolean;
  hasPhone: boolean;
  bio: string;
  hq: string;
};

const countries: CountryOption[] = [
  { code: "", name: "All countries", flag: "🌍" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
];

const TOKEN =
  "eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwiemlwIjoiREVGIn0.Emw8jRfiVQu2NeyztJmzltPxi2OYNZEO_yzd6wmylnfCGL4nP49xleyo8hdudnlVYzG-j1mQXluAo7cMa5bLCxJcdwoZIup5.zpLAka13aA4FYioz0Hfezw.LUVA0iCOcg6CWALVh1bRSlkssfttnK9Vp-AT7fv1V7zpP-5WoqA6Bj5OFpDTuxsrsbi6ZeXvK2gs0Lh-YIkj2wYAPwRqmTxv-SDZUKv4rhn7yuRd0bTKSeaRef-O6LIMPtBpvNDa7U6D3EpjrDtADQ.NBp5rEDoc6R2PvPrSik6buXy-Om2rvF1eLe0PnXqXbI";

const ENDPOINT =
  "https://xbut-eryu-hhsg.f2.xano.io/workspace/1-0/api/32/query/1812";

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getPlatforms(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  return [];
}

function mapCreator(item: ApiCreator, index: number): CreatorCard {
  const firstName = getString(item.first_name);
  const lastName = getString(item.last_name);
  const fullNameFromParts = `${firstName} ${lastName}`.trim();
  const name =
    getString(item.name) ||
    fullNameFromParts ||
    getString(item.display_name) ||
    `Creator ${index + 1}`;
  const usernameSource =
    getString(item.username) || getString(item.handle) || getString(item.user_name);
  const username = usernameSource
    ? usernameSource.startsWith("@")
      ? usernameSource
      : `@${usernameSource}`
    : "@unknown";

  const nationality =
    getString(item.nationality).toUpperCase() || getString(item.country_code).toUpperCase();
  const country = countries.find((c) => c.code === nationality);

  return {
    id: (item.id as number | string | undefined) ?? `${name}-${index}`,
    name,
    username,
    nationality,
    flag: country?.flag || "🌍",
    platforms: getPlatforms(item.platforms || item.social_platforms),
    hasEmail: Boolean(item.email),
    hasPhone: Boolean(item.phone),
    bio: getString(item.bio) || getString(item.description) || "No bio available",
    hq: getString(item.hq) || getString(item.location) || "Unknown",
  };
}

export default function InfluencerDiscoveryPage() {
  const [q, setQ] = useState("");
  const [nationality, setNationality] = useState("");
  const [creators, setCreators] = useState<CreatorCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchCreators = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({
            q,
            user_interest_topics_turbo_id: [],
            nationality,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch creators (${response.status})`);
        }

        const payload = (await response.json()) as
          | ApiCreator[]
          | { items?: ApiCreator[]; data?: ApiCreator[]; result?: ApiCreator[] };

        const list = Array.isArray(payload)
          ? payload
          : payload.items || payload.data || payload.result || [];

        setCreators(list.map((item, index) => mapCreator(item, index)));
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err instanceof Error ? err.message : "Unexpected error");
          setCreators([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCreators();

    return () => {
      abortController.abort();
    };
  }, [q, nationality]);

  const creatorsContent = useMemo(() => {
    if (loading) {
      return (
        <div className="rounded-3xl bg-white p-6 text-sm text-neutral-500 shadow-sm ring-1 ring-black/5 sm:col-span-2 xl:col-span-3">
          Loading creators...
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-3xl bg-white p-6 text-sm text-red-500 shadow-sm ring-1 ring-black/5 sm:col-span-2 xl:col-span-3">
          {error}
        </div>
      );
    }

    if (creators.length === 0) {
      return (
        <div className="rounded-3xl bg-white p-6 text-sm text-neutral-500 shadow-sm ring-1 ring-black/5 sm:col-span-2 xl:col-span-3">
          No creators found.
        </div>
      );
    }

    return creators.map((creator) => (
      <div
        key={creator.id}
        className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-lg font-semibold text-neutral-600">
            {creator.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-semibold text-neutral-900">{creator.name}</h2>
            </div>
            <p className="text-sm text-neutral-500">{creator.username}</p>
            <p className="mt-2 text-sm text-neutral-700">
              {creator.flag} {countries.find((c) => c.code === creator.nationality)?.name || "Unknown"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {creator.platforms.map((platform) => (
            <span
              key={platform}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
            >
              {platform}
            </span>
          ))}
          {creator.platforms.length === 0 && (
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-400">
              No social linked
            </span>
          )}
        </div>

        <div className="mt-4 space-y-2 text-sm text-neutral-600">
          <p>{creator.bio}</p>
          <p>HQ: {creator.hq}</p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500">
          <span>Email: {creator.hasEmail ? "Available" : "Not available"}</span>
          <span>Phone: {creator.hasPhone ? "Available" : "Not available"}</span>
        </div>
      </div>
    ));
  }, [creators, error, loading]);

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">Discovery</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
              Influencer Discovery
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Search creators by name, username and nationality.
            </p>
          </div>
          <div className="grid w-full gap-3 md:w-auto md:grid-cols-[1.2fr_220px]">
            <input
              placeholder="Search name or @username"
              className="h-11 rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-neutral-900"
              value={q}
              onChange={(event) => setQ(event.target.value)}
            />
            <select
              className="h-11 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 outline-none focus:border-neutral-900"
              value={nationality}
              onChange={(event) => setNationality(event.target.value)}
            >
              {countries.map((country) => (
                <option key={country.code || "all"} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{creatorsContent}</div>
      </div>
    </div>
  );
}
