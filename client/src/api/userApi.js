import api from './axios';

export async function getMyCreatedEvents() {
  const { data } = await api.get('/api/users/me/created-events');
  return data;
}

export async function getMyAttendingEvents() {
  const { data } = await api.get('/api/users/me/attending-events');
  return data;
}
