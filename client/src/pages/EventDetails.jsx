import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EventSidebar from '../components/EventSidebar';

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Hero Section */}
      {/* Hero Section (Image Slider) */}
      <div className="relative h-[500px] w-full overflow-hidden rounded-2xl bg-gray-100 md:h-[500px] group">
        {(() => {
          // Normalize images to array
          const images = event.images && event.images.length > 0
            ? event.images
            : event.imageUrl
              ? [{ url: event.imageUrl }]
              : [];

          if (images.length === 0) {
            return (
              <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                <span className="text-lg">No Image Available</span>
              </div>
            );
          }

          return (
            <>
              {/* Main Image */}
              <img
                src={images[activeImageIndex]?.url || images[0].url}
                alt={event.title}
                className="h-full w-full object-cover transition-opacity duration-500"
              />

              {/* Slider Controls (only if > 1 image) */}
              {images.length > 1 && (
                <>
                  {/* Left Arrow */}
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md backdrop-blur-sm transition-all hover:bg-white focus:outline-none opacity-0 group-hover:opacity-100"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md backdrop-blur-sm transition-all hover:bg-white focus:outline-none opacity-0 group-hover:opacity-100"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`h-2 w-2 rounded-full transition-all ${idx === activeImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          );
        })()}

        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm backdrop-blur-sm">
            {event.category}
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{event.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <span>Posted on {new Date(event.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Mobile Sidebar (Visible only on mobile/tablet) */}
          <div className="lg:hidden">
            <EventSidebar
              event={event}
              isFull={isFull}
              isAttending={isAttending}
              isOwner={isOwner}
              actionError={actionError}
              isActionLoading={isActionLoading}
              auth={auth}
              handleJoin={handleJoin}
              handleLeave={handleLeave}
              handleDelete={handleDelete}
              navigate={navigate}
            />
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About this Event</h3>
            <div className="whitespace-pre-wrap text-gray-600 leading-relaxed">
              {event.description}
            </div>
          </div>
        </div>

        {/* Desktop Sidebar (Visible only on large screens) */}
        <div className="hidden lg:block space-y-6">
          <EventSidebar
            event={event}
            isFull={isFull}
            isAttending={isAttending}
            isOwner={isOwner}
            actionError={actionError}
            isActionLoading={isActionLoading}
            auth={auth}
            handleJoin={handleJoin}
            handleLeave={handleLeave}
            handleDelete={handleDelete}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}
