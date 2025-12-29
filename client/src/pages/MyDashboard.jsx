import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getMyAttendingEvents, getMyCreatedEvents } from '../api/userApi';

export default function MyDashboard() {
  const [created, setCreated] = useState([]);
  const [attending, setAttending] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function load() {
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

    load();
    return () => {
      ignore = true;
    };
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-700">{error}</div>;

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-bold">My Dashboard</h2>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-bold">Events I created</h3>
        {created.length === 0 ? <div className="text-gray-700">No created events</div> : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {created.map((e) => (
            <div key={e._id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-lg font-semibold">{e.title}</div>
              <div className="mt-3 flex gap-4 text-sm">
                <Link to={`/events/${e._id}`} className="text-blue-600 hover:underline">
                  Open
                </Link>
                <Link to={`/events/${e._id}/edit`} className="text-blue-600 hover:underline">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-bold">Events I’m attending</h3>
        {attending.length === 0 ? <div className="text-gray-700">No attending events</div> : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {attending.map((e) => (
            <div key={e._id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-lg font-semibold">{e.title}</div>
              <div className="mt-3 text-sm">
                <Link to={`/events/${e._id}`} className="text-blue-600 hover:underline">
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
 }
