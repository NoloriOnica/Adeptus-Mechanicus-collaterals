import { API_BASE_URL } from './constants';
import type {
  InputLockRequest,
  InputLockResponse,
  StatusResponse,
  SubmitRequest,
  SubmitResponse,
} from './types';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);

  if (options?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
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

  getStatus(sessionId: string, clientId?: string): Promise<StatusResponse> {
    const params = clientId ? `?clientId=${encodeURIComponent(clientId)}` : '';
    return apiFetch<StatusResponse>(`/api/session/${sessionId}/status${params}`);
  },

  claimInput(sessionId: string, body: InputLockRequest): Promise<InputLockResponse> {
    return apiFetch<InputLockResponse>(`/api/session/${sessionId}/claim-input`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  heartbeatInput(sessionId: string, body: InputLockRequest): Promise<InputLockResponse> {
    return apiFetch<InputLockResponse>(`/api/session/${sessionId}/heartbeat-input`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  resetSession(sessionId: string): Promise<{ ok: boolean }> {
    return apiFetch<{ ok: boolean }>(`/api/session/${sessionId}/reset`, {
      method: 'POST',
    });
  },
};
