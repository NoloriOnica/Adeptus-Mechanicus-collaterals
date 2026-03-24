export const API_BASE_URL = 'http://localhost:3001';

export const MAX_CONFESSION_LENGTH = 500;

/** Tablet polls backend every 800ms when waiting for a result */
export const POLL_INTERVAL_MS = 800;

/** Sessions are cleaned up after 30 minutes of inactivity */
export const SESSION_TTL_MS = 30 * 60 * 1000;

/** Tablet auto-resets after 60 seconds on the result screen */
export const RESULT_AUTO_RESET_MS = 60 * 1000;
