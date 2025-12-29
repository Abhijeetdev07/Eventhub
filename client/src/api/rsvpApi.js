import api from './axios';

export async function rsvpJoin(eventId) {
  const { data } = await api.post(`/api/events/${eventId}/rsvp`);
  return data;
}

export async function rsvpLeave(eventId) {
  const { data } = await api.delete(`/api/events/${eventId}/rsvp`);
  return data;
}
