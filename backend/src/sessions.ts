export type SessionStatus = 'idle' | 'pending' | 'done' | 'error';

export interface Session {
  confession?: string;
  status: SessionStatus;
  result?: string;
  updatedAt: number;
  createdAt: number;
}

const sessions = new Map<string, Session>();

/** Global submission counter — returned to the phone app on submit */
let submissionCount = 0;

export function getOrCreateSession(sessionId: string): Session {
  if (!sessions.has(sessionId)) {
    const now = Date.now();
    sessions.set(sessionId, { status: 'idle', updatedAt: now, createdAt: now });
  }
  return sessions.get(sessionId)!;
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

export function updateSession(sessionId: string, updates: Partial<Session>): void {
  const session = getOrCreateSession(sessionId);
  Object.assign(session, { ...updates, updatedAt: Date.now() });
}

export function resetSession(sessionId: string): void {
  const now = Date.now();
  sessions.set(sessionId, { status: 'idle', updatedAt: now, createdAt: now });
}

export function incrementSubmissionCount(): number {
  return ++submissionCount;
}

// Purge sessions older than SESSION_TTL_MS (30 minutes)
const SESSION_TTL_MS = 30 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}, 60_000);
