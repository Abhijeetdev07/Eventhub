import { Link } from 'react-router-dom';
import { HiCalendar, HiLocationMarker, HiUserGroup } from 'react-icons/hi';

export default function EventSidebar({
    event,
    isFull,
    isAttending,
    isOwner,
    actionError,
    isActionLoading,
    auth,
    handleJoin,
    handleLeave,
    handleDelete,
    navigate,
}) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <div className="space-y-6">
                {/* Date & Time */}
                <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <HiCalendar className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Date & Time</h3>
                        <p className="text-sm text-gray-600 text-pretty">
                            {event.dateTime
                                ? new Date(event.dateTime).toLocaleString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                })
                                : 'TBD'}
                        </p>
                    </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <HiLocationMarker className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Location</h3>
                        <p className="text-sm text-gray-600 text-pretty">{event.location}</p>
                    </div>
                </div>

                {/* Capacity */}
                <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <HiUserGroup className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Capacity</h3>
                        <div className="mt-1 flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                                {event.rsvpCount} / {event.capacity} Attendees
                            </span>
                            <span
                                className={`font-medium ${isFull ? 'text-red-600' : 'text-green-600'}`}
                            >
                                {isFull ? 'Full' : 'Available'}
                            </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-green-500'
                                    }`}
                                style={{
                                    width: `${Math.min((event.rsvpCount / event.capacity) * 100, 100)}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 border-t border-gray-100 pt-6">
                {actionError ? (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {actionError}
                    </div>
                ) : null}

                {auth?.isAuthenticated ? (
                    <div className="space-y-3">
                        {!isAttending ? (
                            <button
                                type="button"
                                disabled={isActionLoading || isFull}
                                onClick={handleJoin}
                                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isActionLoading ? 'Processing...' : isFull ? 'Event Full' : 'Book My Spot'}
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={handleLeave}
                                className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                {isActionLoading ? 'Processing...' : 'Cancel Booking'}
                            </button>
                        )}

                        {isOwner && (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => navigate('/my-events')}
                                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Manage
                                </button>

                                <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={handleDelete}
                                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rounded-xl bg-gray-50 p-4 text-center">
                        <p className="text-sm text-gray-600">
                            <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
                                Log in
                            </Link>{' '}
                            to book your spot for this event.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
