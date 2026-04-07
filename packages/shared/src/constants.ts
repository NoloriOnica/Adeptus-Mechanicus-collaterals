export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001').replace(/\/$/, '');

export const MAX_CONFESSION_LENGTH = 500;

/** Tablet polls backend every 800ms when waiting for a result */
export const POLL_INTERVAL_MS = 800;

/** Phone input lock expires unless heartbeats keep it alive */
export const INPUT_LOCK_TTL_MS = 10 * 1000;

/** Active phone heartbeats often enough to keep its input lock alive */
export const INPUT_LOCK_HEARTBEAT_MS = 3 * 1000;

/** Sessions are cleaned up after 30 minutes of inactivity */
export const SESSION_TTL_MS = 30 * 60 * 1000;

/** Tablet auto-resets after 60 seconds on the result screen */
export const RESULT_AUTO_RESET_MS = 60 * 1000;
