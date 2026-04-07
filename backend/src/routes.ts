import { Router, Request, Response } from 'express';
import {
  canSubmitInput,
  claimInput,
  getOrCreateSession,
  getSession,
  heartbeatInput,
  isInputLocked,
  isInputOwnedByClient,
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
  const { confession, clientId } = req.body as { confession?: string; clientId?: string };

  if (!confession || confession.trim().length === 0) {
    res.status(400).json({ error: 'Confession cannot be empty.' });
    return;
  }

  if (!clientId) {
    res.status(400).json({ error: 'Client ID is required.' });
    return;
  }

  if (confession.length > MAX_CONFESSION_LENGTH) {
    res.status(400).json({
      error: `Confession must be ${MAX_CONFESSION_LENGTH} characters or fewer.`,
    });
    return;
  }

  const session = getOrCreateSession(sessionId);

  if (session.status !== 'idle') {
    res.status(409).json({ error: 'The system is currently busy.' });
    return;
  }

  if (!canSubmitInput(sessionId, clientId)) {
    res.status(409).json({ error: 'Another device is currently using this session.' });
    return;
  }

  const count = incrementSubmissionCount();

  updateSession(sessionId, {
    status: 'pending',
    confession: confession.trim(),
    result: undefined,
    activeEditorId: undefined,
    editorHeartbeatAt: undefined,
  });

  // Fire-and-forget async processing
  interpretConfession(confession.trim())
    .then((result) => {
      updateSession(sessionId, { status: 'done', result });
    })
    .catch((error) => {
      console.error('interpretConfession failed for session %s:', sessionId, error);
      updateSession(sessionId, { status: 'error', result: undefined });
    });

  res.json({ ok: true, submissionCount: count });
});

// POST /api/session/:sessionId/claim-input
router.post('/session/:sessionId/claim-input', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { clientId } = req.body as { clientId?: string };

  if (!clientId) {
    res.status(400).json({ error: 'Client ID is required.' });
    return;
  }

  res.json({ ok: true, claimed: claimInput(sessionId, clientId) });
});

// POST /api/session/:sessionId/heartbeat-input
router.post('/session/:sessionId/heartbeat-input', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { clientId } = req.body as { clientId?: string };

  if (!clientId) {
    res.status(400).json({ error: 'Client ID is required.' });
    return;
  }

  res.json({ ok: true, claimed: heartbeatInput(sessionId, clientId) });
});

// GET /api/session/:sessionId/status
router.get('/session/:sessionId/status', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const clientId = typeof req.query.clientId === 'string' ? req.query.clientId : undefined;
  const session = getSession(sessionId);

  if (!session) {
    // Auto-create idle session on first poll so tablet can start fresh
    const created = getOrCreateSession(sessionId);
    res.json({
      status: created.status,
      updatedAt: created.updatedAt,
      inputLocked: false,
      inputOwnedByClient: false,
    });
    return;
  }

  const { status, result, updatedAt } = session;
  res.json({
    status,
    result,
    updatedAt,
    inputLocked: isInputLocked(sessionId),
    inputOwnedByClient: isInputOwnedByClient(sessionId, clientId),
  });
});

// POST /api/session/:sessionId/reset
router.post('/session/:sessionId/reset', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  resetSession(sessionId);
  res.json({ ok: true });
});
