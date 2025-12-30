import { useEffect, useState } from 'react';
import { HiCalendar, HiPlus } from 'react-icons/hi';
import { getMyCreatedEvents } from '../api/userApi';
import EventCard from '../components/EventCard';
import EventForm from '../components/EventForm';

export default function MyEvents() {
    const [created, setCreated] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    async function loadEvents() {
        setIsLoading(true);
        setError('');
        try {
            const data = await getMyCreatedEvents();
            setCreated(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load events');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadEvents();
    }, []);

    function handleCreate() {
        setSelectedEvent(null);
        setIsModalOpen(true);
    }

    function handleEdit(event) {
        setSelectedEvent(event);
        setIsModalOpen(true);
    }

    function handleModalClose() {
        setIsModalOpen(false);
        setSelectedEvent(null);
    }

    function handleSuccess() {
        handleModalClose();
        loadEvents(); // Refresh list
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
                    <p className="mt-4 text-sm text-gray-600">Loading your events...</p>
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
                    <p className="mt-1 text-sm text-gray-600">Manage events you created</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <HiPlus className="h-5 w-5" />
                    Create Event
                </button>
            </div>

            {/* Events List */}
            <div>
                {created.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12 text-center">
                        <HiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm font-medium text-gray-900">No events created yet</p>
                        <p className="mt-1 text-sm text-gray-600">
                            Start creating events to share with your community
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {created.map((event) => (
                            <EventCard
                                key={event._id}
                                event={event}
                                isOwner={true}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <EventForm
                        event={selectedEvent}
                        onClose={handleModalClose}
                        onSuccess={handleSuccess}
                    />
                </div>
            )}
        </div>
    );
}
