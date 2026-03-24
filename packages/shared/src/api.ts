import { API_BASE_URL } from './constants';
import type { StatusResponse, SubmitRequest, SubmitResponse } from './types';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  submitConfession(sessionId: string, body: SubmitRequest): Promise<SubmitResponse> {
    return apiFetch<SubmitResponse>(`/api/session/${sessionId}/submit`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  getStatus(sessionId: string): Promise<StatusResponse> {
    return apiFetch<StatusResponse>(`/api/session/${sessionId}/status`);
  },

  resetSession(sessionId: string): Promise<{ ok: boolean }> {
    return apiFetch<{ ok: boolean }>(`/api/session/${sessionId}/reset`, {
      method: 'POST',
    });
  },
};
