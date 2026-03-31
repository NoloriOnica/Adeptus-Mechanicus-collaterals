export type SessionStatus = 'idle' | 'pending' | 'done' | 'error';

export interface Session {
  confession?: string;
  status: SessionStatus;
  result?: string;
  activeEditorId?: string;
  editorHeartbeatAt?: number;
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

function clearExpiredInputLock(session: Session): void {
  if (!session.activeEditorId || !session.editorHeartbeatAt) return;
  if (Date.now() - session.editorHeartbeatAt > INPUT_LOCK_TTL_MS) {
    session.activeEditorId = undefined;
    session.editorHeartbeatAt = undefined;
  }
}

export function updateSession(sessionId: string, updates: Partial<Session>): void {
  const session = getOrCreateSession(sessionId);
  clearExpiredInputLock(session);
  Object.assign(session, { ...updates, updatedAt: Date.now() });
}

export function resetSession(sessionId: string): void {
  const now = Date.now();
  sessions.set(sessionId, { status: 'idle', updatedAt: now, createdAt: now });
}

export function incrementSubmissionCount(): number {
  return ++submissionCount;
}

export function isInputLocked(sessionId: string): boolean {
  const session = getOrCreateSession(sessionId);
  clearExpiredInputLock(session);
  return Boolean(session.activeEditorId);
}

export function isInputOwnedByClient(sessionId: string, clientId?: string): boolean {
  if (!clientId) return false;
  const session = getOrCreateSession(sessionId);
  clearExpiredInputLock(session);
  return session.activeEditorId === clientId;
}

export function claimInput(sessionId: string, clientId: string): boolean {
  const session = getOrCreateSession(sessionId);
  clearExpiredInputLock(session);

  if (session.status !== 'idle') {
    return false;
  }

  if (!session.activeEditorId || session.activeEditorId === clientId) {
    session.activeEditorId = clientId;
    session.editorHeartbeatAt = Date.now();
    session.updatedAt = Date.now();
    return true;
  }

  return false;
}

export function heartbeatInput(sessionId: string, clientId: string): boolean {
  const session = getOrCreateSession(sessionId);
  clearExpiredInputLock(session);

  if (session.activeEditorId !== clientId) {
    return false;
  }

  session.editorHeartbeatAt = Date.now();
  session.updatedAt = Date.now();
  return true;
}

export function canSubmitInput(sessionId: string, clientId: string): boolean {
  const session = getOrCreateSession(sessionId);
  clearExpiredInputLock(session);
  return session.activeEditorId === clientId && session.status === 'idle';
}

// Purge sessions older than SESSION_TTL_MS (30 minutes)
const SESSION_TTL_MS = 30 * 60 * 1000;
const INPUT_LOCK_TTL_MS = 10 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    clearExpiredInputLock(session);
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}, 60_000);
