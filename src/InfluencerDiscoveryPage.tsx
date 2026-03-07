// file: InfluencerDiscoveryPage.tsx
import { useState, useEffect } from "react";

export default function InfluencerDiscoveryPage() {
  const countries = [
    { code: "", name: "All countries", flag: "🌍" },
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "IT", name: "Italy", flag: "🇮🇹" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "ES", name: "Spain", flag: "🇪🇸" },
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "DE", name: "Germany", flag: "🇩🇪" },
  ];

  const [creators, setCreators] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔑 1. Login function
  async function login() {
    try {
      const res = await fetch("https://xano-backend.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "your-email@example.com",
          password: "your-password",
        }),
      });

      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem("authToken", data.token);
    } catch (err) {
      console.error(err);
    }
  }

  // 🔑 2. Fetch creators using token
  async function fetchCreators() {
    if (!token) return; // wait for token
    setLoading(true);
    try {
      const query = new URLSearchParams({ username: search, nationality: country });
      const res = await fetch(`https://xano-backend.com/users?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setCreators(data);
    } catch (err) {
      console.error(err);
      setCreators([]);
    } finally {
      setLoading(false);
    }
  }

  // 🔑 3. Login on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      setToken(savedToken);
    } else {
      login();
    }
  }, []);

  // 🔑 4. Fetch creators whenever token, search, or country changes
  useEffect(() => {
    if (token) fetchCreators();
  }, [token, search, country]);

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
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
                <option key={c.code || "all"} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {creators
