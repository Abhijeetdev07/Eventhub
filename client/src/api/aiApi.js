import api from './axios';

export async function enhanceDescription(payload) {
  const { data } = await api.post('/api/ai/enhance-description', payload);
  return data;
}
