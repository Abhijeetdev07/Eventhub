import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiCalendar, HiTicket, HiPlus } from 'react-icons/hi';
import { getMyAttendingEvents, getMyCreatedEvents } from '../api/userApi';
import EventCard from '../components/EventCard';

export default function MyDashboard() {
  const [created, setCreated] = useState([]);
  const [attending, setAttending] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError('');
      try {
        const [createdEvents, attendingEvents] = await Promise.all([
          getMyCreatedEvents(),
          getMyAttendingEvents(),
        ]);
        if (ignore) return;
        setCreated(Array.isArray(createdEvents) ? createdEvents : []);
        setAttending(Array.isArray(attendingEvents) ? attendingEvents : []);
      } catch (err) {
        if (!ignore) setError(err?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-4 text-sm text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Events you have joined</p>
      </div>

      {/* Events I'm Attending */}
      <div>
        {attending.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12 text-center">
            <HiTicket className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">No events joined yet</p>
            <p className="mt-1 text-sm text-gray-600">
              Browse events and RSVP to join amazing experiences
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {attending.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>


    </div>
  );
}
