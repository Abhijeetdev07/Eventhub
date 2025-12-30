import { Link } from 'react-router-dom';
import { HiLocationMarker, HiCalendar, HiPencil } from 'react-icons/hi';

export default function EventCard({ event, isOwner, onEdit }) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-indigo-200">
            {/* Event Image */}
            {event.imageUrl && (
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Category Badge */}
                    {event.category && (
                        <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white shadow-lg">
                                {event.category}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Card Content */}
            <div className="p-5">
                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                    {event.title}
                </h3>

                {/* Location */}
                <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                    <HiLocationMarker className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                </div>

                {/* Date & Time */}
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                    <HiCalendar className="h-4 w-4 flex-shrink-0" />
                    <span>
                        {event.dateTime ? new Date(event.dateTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }) : 'Date TBD'}
                    </span>
                </div>

                {/* Capacity Info */}
                {event.capacity && (
                    <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                        <span className="text-xs font-medium text-gray-600">Capacity</span>
                        <span className="text-sm font-semibold text-gray-900">
                            {event.rsvpCount || 0} / {event.capacity}
                        </span>
                    </div>
                )}

                {/* View Details Button */}
                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Link
                        to={`/events/${event._id}`}
                        className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        View Details
                    </Link>
                    {isOwner && (
                        onEdit ? (
                            <button
                                onClick={() => onEdit(event)}
                                className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <HiPencil className="h-5 w-5" />
                            </button>
                        ) : (
                            <Link
                                to={`/events/${event._id}/edit`}
                                className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <HiPencil className="h-5 w-5" />
                            </Link>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
