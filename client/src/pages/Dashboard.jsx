import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { listEvents } from '../api/eventApi';
import { useDebounce } from '../hooks/useDebounce';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => (e?.dateTime ? new Date(e.dateTime) >= now : true))
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  }, [events]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const params = {};
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (category.trim()) params.category = category.trim();
        if (from) params.from = new Date(from).toISOString();
        if (to) params.to = new Date(to).toISOString();

        const data = await listEvents(params);
        if (!ignore) setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!ignore) setError(err?.response?.data?.message || 'Failed to load events');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [debouncedSearch, category, from, to]);

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Events Dashboard</h2>

      <div className="mb-4 grid gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2"
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2"
          />

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From</label>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              type="date"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To</label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              type="date"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategory('');
              setFrom('');
              setTo('');
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {isLoading ? <div>Loading...</div> : null}
      {error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}

      {!isLoading && !error && upcomingEvents.length === 0 ? <div>No upcoming events</div> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upcomingEvents.map((e) => (
          <div key={e._id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-lg font-semibold">{e.title}</div>
            <div className="text-gray-700">{e.location}</div>
            <div className="text-sm text-gray-500">
              {e.dateTime ? new Date(e.dateTime).toLocaleString() : ''}
            </div>
            <div className="mt-3">
              <Link to={`/events/${e._id}`} className="text-blue-600 hover:underline">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
