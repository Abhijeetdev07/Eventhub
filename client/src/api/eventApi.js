import api from './axios';

export async function listEvents(params) {
  const { data } = await api.get('/api/events', { params });
  return data;
}

export async function getEventById(eventId) {
  const { data } = await api.get(`/api/events/${eventId}`);
  return data;
}

export async function createEvent(formData) {
  const { data } = await api.post('/api/events', formData);
  return data;
}

export async function updateEvent(eventId, formData) {
  const { data } = await api.patch(`/api/events/${eventId}`, formData);
  return data;
}

export async function deleteEvent(eventId) {
  const { data } = await api.delete(`/api/events/${eventId}`);
  return data;
}
