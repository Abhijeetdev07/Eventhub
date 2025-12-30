import { useEffect, useState } from 'react';
import { createEvent, updateEvent } from '../api/eventApi';
import { enhanceDescription } from '../api/aiApi';
import { useAuth } from '../hooks/useAuth';

export default function EventForm({ event = null, onClose, onSuccess }) {
    const isEdit = Boolean(event);
    const auth = useAuth();

    const [title, setTitle] = useState(event?.title || '');
    const [description, setDescription] = useState(event?.description || '');
    const [dateTime, setDateTime] = useState(
        event?.dateTime ? new Date(event.dateTime).toISOString().slice(0, 16) : ''
    );
    const [location, setLocation] = useState(event?.location || '');
    const [capacity, setCapacity] = useState(event?.capacity || 1);
    const [category, setCategory] = useState(event?.category || '');
    const [imageFile, setImageFile] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    // Reset form when event prop changes
    useEffect(() => {
        if (event) {
            setTitle(event.title || '');
            setDescription(event.description || '');
            setDateTime(event.dateTime ? new Date(event.dateTime).toISOString().slice(0, 16) : '');
            setLocation(event.location || '');
            setCapacity(event.capacity || 1);
            setCategory(event.category || '');
        } else {
            // Reset for create mode
            setTitle('');
            setDescription('');
            setDateTime('');
            setLocation('');
            setCapacity(1);
            setCategory('');
            setImageFile(null);
        }
    }, [event]);

    async function onSubmit(e) {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!title.trim() || !description.trim() || !location.trim() || !dateTime) {
            setIsLoading(false);
            setError('title, description, dateTime, location are required');
            return;
        }

        if (!Number.isFinite(Number(capacity)) || Number(capacity) <= 0) {
            setIsLoading(false);
            setError('capacity must be a positive number');
            return;
        }

        const selectedDate = new Date(dateTime);
        if (Number.isNaN(selectedDate.getTime())) {
            setIsLoading(false);
            setError('dateTime is invalid');
            return;
        }

        if (selectedDate.getTime() < Date.now()) {
            setIsLoading(false);
            setError('dateTime must be in the future');
            return;
        }

        if (!isEdit && !imageFile) {
            setIsLoading(false);
            setError('Image is required');
            return;
        }

        try {
            const fd = new FormData();
            fd.append('title', title);
            fd.append('description', description);
            fd.append('dateTime', new Date(dateTime).toISOString());
            fd.append('location', location);
            fd.append('capacity', String(capacity));
            if (category) fd.append('category', category);

            if (imageFile && imageFile.length > 0) {
                Array.from(imageFile).forEach((file) => {
                    fd.append('images', file);
                });
            }

            await (isEdit ? updateEvent(event._id, fd) : createEvent(fd));
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err?.response?.data?.message || 'Save failed');
        } finally {
            setIsLoading(false);
        }
    }

    async function onEnhanceDescription() {
        if (!title.trim()) {
            setAiError('title is required to enhance description');
            return;
        }

        setAiLoading(true);
        setAiError('');

        try {
            const data = await enhanceDescription({
                title,
                location,
                dateTime: dateTime ? new Date(dateTime).toISOString() : '',
                notes: description,
            });

            if (!data?.description) {
                setAiError('AI did not return a description');
                return;
            }

            setDescription(data.description);
        } catch (err) {
            setAiError(err?.response?.data?.message || 'AI enhance failed');
        } finally {
            setAiLoading(false);
        }
    }

    return (
        <div className="flex max-h-[90vh] flex-col overflow-y-auto rounded-xl bg-white p-6 shadow-xl w-full max-w-2xl">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Event' : 'Create Event'}</h2>
                <button
                    onClick={onClose}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {error ? <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Event Title"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                <div className="relative">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your event..."
                        rows={5}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 pb-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                        type="button"
                        disabled={aiLoading || !title.trim()}
                        onClick={onEnhanceDescription}
                        className="absolute bottom-2 right-2 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                    >
                        {aiLoading ? 'Enhancing...' : '✨ Enhance with AI'}
                    </button>
                </div>
                {aiError ? <div className="text-xs text-red-600 mt-1">{aiError}</div> : null}

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Date & Time</label>
                        <input
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            type="datetime-local"
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Event Location"
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Capacity</label>
                        <input
                            value={capacity}
                            onChange={(e) => setCapacity(Number(e.target.value))}
                            placeholder="Max Attendees"
                            type="number"
                            min={1}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                        <input
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g. Workshop, Party"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {isEdit ? 'Replace Images (optional)' : 'Event Images (Max 5, 3MB ea)'}
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 5) {
                                alert('You can upload a maximum of 5 images');
                                e.target.value = '';
                                setImageFile([]);
                                return;
                            }

                            const oversized = files.filter(f => f.size > 3 * 1024 * 1024);
                            if (oversized.length > 0) {
                                alert('Each image must be less than 3MB');
                                e.target.value = '';
                                setImageFile([]);
                                return;
                            }

                            setImageFile(files);
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {imageFile && imageFile.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                            {imageFile.length} image(s) selected
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
                    >
                        {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}
