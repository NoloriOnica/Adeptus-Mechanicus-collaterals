import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  api,
  INPUT_LOCK_HEARTBEAT_MS,
  MAX_CONFESSION_LENGTH,
  POLL_INTERVAL_MS,
} from '@adeptus/shared';
import styles from './PhonePage.module.css';

import frame1 from '../../../../assets/Loading 1:4.png';
import frame2 from '../../../../assets/Loading 2:4.png';
import frame3 from '../../../../assets/Loading 3:4.png';
import frame4 from '../../../../assets/Loading 4:4.png';
import borderImg from '../../../../assets/Border.png';
import logoImg from '../../../../assets/Logo.png';

const FRAMES = [frame1, frame2, frame3, frame4];
const FRAME_INTERVAL_MS = 180;
const MIN_LOADING_MS = 1600;

type Screen = 'checking' | 'welcome' | 'input' | 'loading' | 'submitted' | 'standby';

function getOrCreateClientId(): string {
  const storageKey = 'adeptus-phone-client-id';
  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) return existing;

  const created = window.crypto.randomUUID();
  window.sessionStorage.setItem(storageKey, created);
  return created;
}

export function PhonePage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [screen, setScreen] = useState<Screen>('checking');
  const [confession, setConfession] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [submissionCount, setSubmissionCount] = useState<number | null>(null);
  const [clientId] = useState(getOrCreateClientId);

  useEffect(() => {
    if (screen !== 'loading') return;
    const id = setInterval(() => setFrameIndex((i) => (i + 1) % FRAMES.length), FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, [screen]);

  useEffect(() => {
    if (!sessionId) return;
    if (screen !== 'checking' && screen !== 'welcome' && screen !== 'standby') return;

    let cancelled = false;

    const syncAvailability = async () => {
      try {
        const status = await api.getStatus(sessionId, clientId);
        if (cancelled) return;

        const unavailable = status.status !== 'idle' || (status.inputLocked && !status.inputOwnedByClient);
        setScreen((current) => {
          if (current !== 'checking' && current !== 'welcome' && current !== 'standby') {
            return current;
          }
          return unavailable ? 'standby' : 'welcome';
        });
      } catch {
        if (cancelled) return;
        setScreen((current) => (current === 'checking' ? 'welcome' : current));
      }
    };

    syncAvailability();
    const id = setInterval(syncAvailability, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [clientId, screen, sessionId]);

  useEffect(() => {
    if (!sessionId || screen !== 'input') return;

    const beat = async () => {
      try {
        const lock = await api.heartbeatInput(sessionId, { clientId });
        if (!lock.claimed) {
          setError(null);
          setScreen('standby');
        }
      } catch {
        // Best-effort heartbeat; next interval will retry.
      }
    };

    beat();
    const id = setInterval(beat, INPUT_LOCK_HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [clientId, screen, sessionId]);

  const handleBeginInput = useCallback(async () => {
    if (!sessionId) return;

    setError(null);

    try {
      const lock = await api.claimInput(sessionId, { clientId });
      setScreen(lock.claimed ? 'input' : 'standby');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to access the session.');
    }
  }, [clientId, sessionId]);

  const handleSubmit = useCallback(async () => {
    if (!confession.trim()) { setError('Confession cannot be empty.'); return; }
    if (confession.length > MAX_CONFESSION_LENGTH) {
      setError(`Max ${MAX_CONFESSION_LENGTH} characters.`); return;
    }
    setError(null);
    setScreen('loading');
    const start = Date.now();
    try {
      const res = await api.submitConfession(sessionId!, {
        confession: confession.trim(),
        clientId,
      });
      setSubmissionCount(res.submissionCount ?? null);
      const elapsed = Date.now() - start;
      if (elapsed < MIN_LOADING_MS) await new Promise<void>((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
      setScreen('submitted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed. Please try again.';
      if (message.includes('currently busy') || message.includes('Another device')) {
        setError(null);
        setScreen('standby');
        return;
      }
      setScreen('input');
      setError(message);
    }
  }, [clientId, confession, sessionId]);

  const handleReset = useCallback(() => {
    setConfession('');
    setError(null);
    setFrameIndex(0);
    setSubmissionCount(null);
    setScreen('checking');
  }, []);

  // ─── Loading (full screen, no chrome) ────────────────────────────────────
  if (screen === 'loading') {
    return (
      <div className={styles.loadingScreen}>
        <img src={FRAMES[frameIndex]} alt="" className={styles.loadingFrame} aria-hidden="true" />
        <p className={styles.loadingText}>INTERPRETING…</p>
      </div>
    );
  }

  // ─── Submitted (Page 3) ───────────────────────────────────────────────────
  if (screen === 'submitted') {
    return (
      <div className={styles.page}>
        <img src={borderImg} alt="" className={styles.borderImg} aria-hidden="true" />
        <div className={styles.submittedBody}>
          <div className={styles.textBlock}>
            <p>Your confession has been accepted.</p>
            {submissionCount !== null && (
              <p>You are the <strong>{submissionCount}</strong>{ordinal(submissionCount)} to enter this system.</p>
            )}
            <p>Adeptus Mechanicus will return a response.</p>
            <p className={styles.dim}>Look at the tablet.</p>
          </div>
          <button className={styles.submitAnother} onClick={handleReset}>
            Submit another confession
          </button>
        </div>
        <div className={styles.bottomBar} />
      </div>
    );
  }

  if (screen === 'checking') {
    return (
      <div className={styles.page}>
        <img src={borderImg} alt="" className={styles.borderImg} aria-hidden="true" />
        <div className={styles.checkingBody}>
          <img src={logoImg} alt="Adeptus Mechanicus" className={styles.logo} />
          <p className={styles.statusText}>ACCESSING SYSTEM…</p>
        </div>
        <div className={styles.bottomBar} />
      </div>
    );
  }

  if (screen === 'standby') {
    return (
      <div className={styles.page}>
        <img src={borderImg} alt="" className={styles.borderImg} aria-hidden="true" />
        <div className={styles.standbyBody}>
          <img src={logoImg} alt="Adeptus Mechanicus" className={styles.logo} />
          <div className={styles.textBlock}>
            <p>The system is at capacity.</p>
            <p>Please wait until the previous interaction is complete.</p>
            <p>Return shortly.</p>
          </div>
        </div>
        <div className={styles.bottomBar} />
      </div>
    );
  }

  // ─── Input (Page 2) ───────────────────────────────────────────────────────
  if (screen === 'input') {
    return (
      <div className={styles.page}>
        <img src={borderImg} alt="" className={styles.borderImg} aria-hidden="true" />
        <div className={styles.inputBody}>
          <textarea
            className={styles.confessionInput}
            value={confession}
            onChange={(e) => { setError(null); setConfession(e.target.value); }}
            maxLength={MAX_CONFESSION_LENGTH}
            placeholder=""
            autoFocus
          />
          {error && <p className={styles.errorMsg}>{error}</p>}
          <button className={styles.actionButton} onClick={handleSubmit}>ENTER</button>
          <div className={styles.helperBlock}>
            <p>Enter your confession.</p>
            <p>Interpretation will begin upon submission.</p>
          </div>
          <p className={styles.charCount}>{confession.length} / {MAX_CONFESSION_LENGTH}</p>
        </div>
        <div className={styles.bottomBar} />
      </div>
    );
  }

  // ─── Welcome (Page 1) ─────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <img src={borderImg} alt="" className={styles.borderImg} aria-hidden="true" />
      <div className={styles.welcomeBody}>
        <div className={styles.spacer} />
        <img src={logoImg} alt="Adeptus Mechanicus" className={styles.logo} />
        <div className={styles.textBlock}>
          <p>Your response is an offering.</p>
          <p>Your support is a 0.6% reduction in your interpersonal guilt.</p>
        </div>
        {error && <p className={styles.errorMsg}>{error}</p>}
        <button className={styles.actionButton} onClick={handleBeginInput}>NEXT</button>
      </div>
      <div className={styles.bottomBar} />
    </div>
  );
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
}
