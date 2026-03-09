import { getApiBaseUrl } from './capacitor';
const API_BASE = getApiBaseUrl() + '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('pawmatch_token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string; emirate: string }) =>
      request<{ token: string; user: Record<string, unknown> }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: Record<string, unknown> }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<Record<string, unknown>>('/auth/me'),
  },
  pets: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<Record<string, unknown>[]>(`/pets${qs}`);
    },
    get: (id: string) => request<Record<string, unknown>>(`/pets/${id}`),
    create: (data: Record<string, unknown>) => request<Record<string, unknown>>('/pets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) => request<Record<string, unknown>>(`/pets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<Record<string, unknown>>(`/pets/${id}`, { method: 'DELETE' }),
  },
  matches: {
    analyze: (petAId: string, petBId: string) =>
      request<Record<string, unknown>>('/matches/analyze', { method: 'POST', body: JSON.stringify({ petAId, petBId }) }),
    list: () => request<Record<string, unknown>[]>('/matches'),
    get: (id: string) => request<Record<string, unknown>>(`/matches/${id}`),
    respond: (id: string, status: string) =>
      request<Record<string, unknown>>(`/matches/${id}/respond`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },
  messages: {
    list: (matchId: string) => request<Record<string, unknown>[]>(`/messages/${matchId}`),
    send: (matchId: string, content: string) =>
      request<Record<string, unknown>>(`/messages/${matchId}`, { method: 'POST', body: JSON.stringify({ content }) }),
  },
  tools: {
    breedDetect: (data: Record<string, unknown>) => request<Record<string, unknown>>('/breed-detect', { method: 'POST', body: JSON.stringify(data) }),
    translate: (data: Record<string, unknown>) => request<Record<string, unknown>>('/translate', { method: 'POST', body: JSON.stringify(data) }),
    profileReview: (petId: string, data?: Record<string, unknown>) =>
      request<Record<string, unknown>>(`/profile-review/${petId}`, { method: 'POST', body: JSON.stringify(data || {}) }),
    vetAdvisor: (petId: string, data?: Record<string, unknown>) =>
      request<Record<string, unknown>>(`/vet-advisor/${petId}`, { method: 'POST', body: JSON.stringify(data || {}) }),
    analyzePetPhoto: (petId: string, imageUrl: string, symptoms?: string) =>
      request<Record<string, unknown>>(`/diagnostic/${petId}`, {
        method: 'POST',
        body: JSON.stringify({ imageUrl, symptoms }),
      }),
    getDiagnosticHistory: (petId: string) =>
      request<Record<string, unknown>[]>(`/diagnostic/${petId}`),
    scanDocument: (petId: string, imageUrl: string, documentType: string) =>
      request<Record<string, unknown>>(`/documents/${petId}/scan`, {
        method: 'POST',
        body: JSON.stringify({ imageUrl, documentType }),
      }),
    getDocumentHistory: (petId: string) =>
      request<Record<string, unknown>[]>(`/documents/${petId}`),
  },
  contracts: {
    create: (data: Record<string, unknown>) => request<Record<string, unknown>>('/contracts', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => request<Record<string, unknown>>(`/contracts/${id}`),
    update: (id: string, status: string) =>
      request<Record<string, unknown>>(`/contracts/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },
  resources: {
    breeds: () => request<Record<string, unknown>>('/resources/breeds'),
    vets: () => request<Record<string, unknown>>('/resources/vets'),
  },
};
