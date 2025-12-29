import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { createEvent, getEventById, updateEvent } from '../api/eventApi';
import { enhanceDescription } from '../api/aiApi';
import { useAuth } from '../hooks/useAuth';

export default function CreateEditEvent() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const auth = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(1);
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const canEdit = useMemo(() => {
    if (!isEdit) return true;
    if (!auth?.user?.id) return false;
    return true;
  }, [auth?.user?.id, isEdit]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!isEdit) return;
      setIsLoading(true);
      setError('');

      try {
        const e = await getEventById(id);

        if (!auth?.user?.id || String(e.createdBy) !== String(auth.user.id)) {
          if (!ignore) setError('Forbidden: you can only edit events you created');
          return;
        }

        if (ignore) return;
        setTitle(e.title || '');
        setDescription(e.description || '');
        setDateTime(e.dateTime ? new Date(e.dateTime).toISOString().slice(0, 16) : '');
        setLocation(e.location || '');
        setCapacity(e.capacity || 1);
        setCategory(e.category || '');
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
  }, [auth?.user?.id, id, isEdit]);

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
      if (imageFile) fd.append('image', imageFile);

      const saved = isEdit ? await updateEvent(id, fd) : await createEvent(fd);
      navigate(`/events/${saved._id}`, { replace: true });
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

  if (isLoading) return <div>Loading...</div>;
  if (!canEdit) return <div>Forbidden</div>;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-2xl font-bold">{isEdit ? 'Edit Event' : 'Create Event'}</h2>

        {error ? <div className="mb-3 text-sm text-red-700">{error}</div> : null}

        <form onSubmit={onSubmit} className="grid gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={5}
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2"
        />

        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            type="datetime-local"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
          />

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 md:col-span-1"
          />

          <input
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            placeholder="Capacity"
            type="number"
            min={1}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
          />
        </div>

        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional)"
          className="w-full rounded-lg border border-gray-200 px-3 py-2"
        />

        <div className="grid gap-2">
          <label className="text-sm font-semibold">{isEdit ? 'Replace image (optional)' : 'Image (required)'}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-gray-900 px-3 py-2 text-white disabled:opacity-60 sm:w-auto"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>

          <button
            type="button"
            disabled={aiLoading}
            onClick={onEnhanceDescription}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 disabled:opacity-60 sm:w-auto"
          >
            {aiLoading ? 'Enhancing...' : 'Enhance description'}
          </button>

          {aiError ? <div className="text-sm text-red-700">{aiError}</div> : null}
        </div>
        </form>
      </div>
    </div>
  );
}
