import { useEffect, useMemo, useState } from 'react';
import { HiSearch, HiFilter, HiChevronDown, HiChevronUp } from 'react-icons/hi';
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
  const [showFilters, setShowFilters] = useState(false);

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


      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2">
            <HiFilter className="h-4 w-4" />
            <span>Filter Events</span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 sm:hidden"
          >
            {showFilters ? (
              <HiChevronUp className="h-5 w-5" />
            ) : (
              <HiChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className={`space-y-3 ${showFilters ? 'block' : 'hidden'} sm:block`}>
          {/* Row 1: Category and Search */}
          <div className="flex flex-col gap-3 sm:flex-row">
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 w-10 sm:w-auto">From</label>
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                type="date"
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:flex-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 w-10 sm:w-auto">To</label>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                type="date"
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:flex-none"
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
        <div className="rounded-lg bg-gray-50 py-12 text-center">
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
