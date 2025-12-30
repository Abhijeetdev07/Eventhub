import { useEffect, useMemo, useState } from 'react';
import { HiSearch, HiFilter } from 'react-icons/hi';
import { listEvents } from '../api/eventApi';
import { useDebounce } from '../hooks/useDebounce';
import EventCard from '../components/EventCard';

export default function Dashboard() {
  // State for events data
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State for filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500);

  // Filter events to show only upcoming ones
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((event) => (event?.dateTime ? new Date(event.dateTime) >= now : true))
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  }, [events]);

  // Get unique categories from all events
  const uniqueCategories = useMemo(() => {
    const categories = events
      .map((event) => event.category)
      .filter((cat) => cat && cat.trim() !== '');
    return [...new Set(categories)].sort();
  }, [events]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: upcomingEvents.length,
      categories: uniqueCategories.length,
    };
  }, [upcomingEvents, uniqueCategories]);

  // Load events from API
  useEffect(() => {
    let ignore = false;

    async function loadEvents() {
      setIsLoading(true);
      setError('');

      try {
        // Build query parameters
        const params = {};
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (category.trim()) params.category = category.trim();
        if (from) params.from = new Date(from).toISOString();
        if (to) params.to = new Date(to).toISOString();

        // Fetch events from API
        const data = await listEvents(params);
        if (!ignore) setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!ignore) setError(err?.response?.data?.message || 'Failed to load events');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadEvents();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      ignore = true;
    };
  }, [debouncedSearch, category, from, to]);

  // Clear all filters
  function clearAllFilters() {
    setSearch('');
    setCategory('');
    setFrom('');
    setTo('');
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discover Events</h1>
          <p className="mt-1 text-sm text-gray-600">
            Find and join amazing events in your community
          </p>
        </div>

        {/* Stats */}
        {!isLoading && (
          <div className="hidden sm:flex gap-4">
            <div className="rounded-lg bg-indigo-50 px-4 py-2 text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
              <div className="text-xs text-gray-600">Events</div>
            </div>
            <div className="rounded-lg bg-purple-50 px-4 py-2 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
              <div className="text-xs text-gray-600">Categories</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <HiFilter className="h-4 w-4" />
          <span>Filter Events</span>
        </div>

        <div className="space-y-3">
          {/* Row 1: Category and Search */}
          <div className="flex gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by title..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {/* Row 2: Date Filters and Clear */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">From</label>
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                type="date"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">To</label>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                type="date"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto text-sm text-gray-600 underline transition-colors hover:text-indigo-600"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
            <p className="mt-4 text-sm text-gray-600">Loading events...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && upcomingEvents.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <p className="text-lg font-medium text-gray-900">No events found</p>
          <p className="mt-1 text-sm text-gray-600">
            Try adjusting your filters or check back later for new events
          </p>
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && !error && upcomingEvents.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Upcoming Events ({upcomingEvents.length})
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
