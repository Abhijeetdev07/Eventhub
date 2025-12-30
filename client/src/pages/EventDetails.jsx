import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { deleteEvent, getEventById } from '../api/eventApi';
import { rsvpJoin, rsvpLeave } from '../api/rsvpApi';
import { getMyAttendingEvents } from '../api/userApi';
import { useAuth } from '../hooks/useAuth';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAttending, setIsAttending] = useState(false);
  const [actionError, setActionError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isOwner = useMemo(() => {
    if (!auth?.user?.id || !event?.createdBy) return false;
    return String(event.createdBy) === String(auth.user.id);
  }, [auth?.user?.id, event?.createdBy]);

  const isFull = useMemo(() => {
    if (!event) return false;
    const cap = Number(event.capacity);
    const count = Number(event.rsvpCount);
    if (!Number.isFinite(cap) || !Number.isFinite(count)) return false;
    return count >= cap;
  }, [event]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setIsLoading(true);
      setError('');
      setActionError('');

      try {
        const data = await getEventById(id);
        if (!ignore) setEvent(data);

        if (auth?.isAuthenticated) {
          try {
            const attending = await getMyAttendingEvents();
            const attendingIds = new Set((attending || []).map((e) => String(e._id)));
            if (!ignore) setIsAttending(attendingIds.has(String(id)));
          } catch {
            if (!ignore) setIsAttending(false);
          }
        }
      } catch (err) {
        if (!ignore) setError(err?.response?.data?.message || 'Failed to load event');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [id, auth?.isAuthenticated]);

  async function handleJoin() {
    setIsActionLoading(true);
    setActionError('');
    try {
      const data = await rsvpJoin(id);
      setEvent(data.event);
      setIsAttending(true);
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to RSVP');

      try {
        const fresh = await getEventById(id);
        setEvent(fresh);
      } catch {
        // ignore
      }
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleLeave() {
    setIsActionLoading(true);
    setActionError('');
    try {
      const data = await rsvpLeave(id);
      setEvent(data.event);
      setIsAttending(false);
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to remove RSVP');

      try {
        const fresh = await getEventById(id);
        setEvent(fresh);
      } catch {
        // ignore
      }
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this event?')) return;

    setIsActionLoading(true);
    setActionError('');

    try {
      await deleteEvent(id);
      navigate('/', { replace: true });
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to delete event');
    } finally {
      setIsActionLoading(false);
    }
  }

  // Loading state with spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-4 text-sm text-gray-600">Loading event details...</p>
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

  // Not found state
  if (!event) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12 text-center">
        <p className="text-lg font-medium text-gray-900">Event not found</p>
        <p className="mt-1 text-sm text-gray-600">
          The event you're looking for doesn't exist or has been removed
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-2xl font-bold">{event.title}</h2>

        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="mt-4 w-full rounded-xl border border-gray-200"
          />
        ) : null}

        <div className="mt-2 text-gray-700">Location: {event.location}</div>
        <div className="mt-1 text-gray-700">Date: {event.dateTime ? new Date(event.dateTime).toLocaleString() : ''}</div>
        <div className="mt-1 text-gray-700">
          Capacity: {event.rsvpCount}/{event.capacity}
        </div>
        <div className='mt-1 text-gray-700'>Description :</div>
        <div className=" whitespace-pre-wrap text-gray-900">{event.description}</div>

        {actionError ? <div className="mt-3 text-sm text-red-700">{actionError}</div> : null}

        {auth?.isAuthenticated ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {!isAttending ? (
              <button
                type="button"
                disabled={isActionLoading || isFull}
                onClick={handleJoin}
                className="w-full rounded-lg bg-green-600 px-3 py-2 text-white disabled:opacity-60 sm:w-auto"
              >
                {isActionLoading ? 'Booking...' : isFull ? 'Event Full' : 'Book Event'}
              </button>
            ) : (
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleLeave}
                className="w-full rounded-lg bg-red-600 px-3 py-2 text-white disabled:opacity-60 sm:w-auto"
              >
                {isActionLoading ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            )}

            {isOwner ? (
              <>
                <Link to={`/events/${event._id}/edit`} className="text-blue-600 hover:underline">
                  Edit
                </Link>
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={handleDelete}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left disabled:opacity-60 sm:w-auto sm:text-center"
                >
                  Delete
                </button>
              </>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 text-sm text-gray-700">
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>{' '}
            to RSVP.
          </div>
        )}
      </div>
    </div>
  );
}
