const BASE = '/api';

function getToken() {
  return localStorage.getItem('poker_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    register: (data: { username: string; email: string; password: string }) =>
      request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<any>('/auth/me'),
    users: () => request<any[]>('/auth/users'),
  },
  sessions: {
    list: () => request<any[]>('/sessions'),
    get: (id: number) => request<any>(`/sessions/${id}`),
    create: (data: any) => request<any>('/sessions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/sessions/${id}`, { method: 'DELETE' }),
  },
  stats: {
    player: (userId: number) => request<any>(`/stats/player/${userId}`),
    leaderboard: () => request<any[]>('/stats/leaderboard'),
    settlements: () => request<any>('/stats/settlements'),
    sessionSettlements: (sessionId: number) => request<any>(`/stats/settlements/session/${sessionId}`),
  },
};
