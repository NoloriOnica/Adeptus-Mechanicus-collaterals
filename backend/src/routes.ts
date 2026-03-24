import { Router, Request, Response } from 'express';
import {
  getOrCreateSession,
  getSession,
  updateSession,
  resetSession,
  incrementSubmissionCount,
} from './sessions';
import { interpretConfession } from './ai';

const MAX_CONFESSION_LENGTH = 500;

export const router = Router();

// POST /api/session/:sessionId/submit
router.post('/session/:sessionId/submit', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { confession } = req.body as { confession?: string };

  if (!confession || confession.trim().length === 0) {
    res.status(400).json({ error: 'Confession cannot be empty.' });
    return;
  }

  if (confession.length > MAX_CONFESSION_LENGTH) {
    res.status(400).json({
      error: `Confession must be ${MAX_CONFESSION_LENGTH} characters or fewer.`,
    });
    return;
  }

  const session = getOrCreateSession(sessionId);

  // Reject if a processing job is already running for this session
  if (session.status === 'pending') {
    res.status(409).json({ error: 'Session is already processing a confession.' });
    return;
  }

  const count = incrementSubmissionCount();

  updateSession(sessionId, { status: 'pending', confession: confession.trim(), result: undefined });

  // Fire-and-forget async processing
  interpretConfession(confession.trim())
    .then((result) => {
      updateSession(sessionId, { status: 'done', result });
    })
    .catch(() => {
      updateSession(sessionId, { status: 'error', result: undefined });
    });

  res.json({ ok: true, submissionCount: count });
});

// GET /api/session/:sessionId/status
router.get('/session/:sessionId/status', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = getSession(sessionId);

  if (!session) {
    // Auto-create idle session on first poll so tablet can start fresh
    const created = getOrCreateSession(sessionId);
    res.json({ status: created.status, updatedAt: created.updatedAt });
    return;
  }

  const { status, result, updatedAt } = session;
  res.json({ status, result, updatedAt });
});

// POST /api/session/:sessionId/reset
router.post('/session/:sessionId/reset', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  resetSession(sessionId);
  res.json({ ok: true });
});
