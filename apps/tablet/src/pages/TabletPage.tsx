import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api, POLL_INTERVAL_MS, RESULT_AUTO_RESET_MS } from '@adeptus/shared';
import styles from './TabletPage.module.css';

// Assets from tablet_assets folder
import frame1 from '../../../../tablet_assets/Loading 1:4.png';
import frame2 from '../../../../tablet_assets/Loading 2:4.png';
import frame3 from '../../../../tablet_assets/Loading 3:4.png';
import frame4 from '../../../../tablet_assets/Loading 4:4.png';
import logoImg from '../../../../tablet_assets/Logo.png';
import borderImg from '../../../../tablet_assets/Border_Blue.png';

const FRAMES = [frame1, frame2, frame3, frame4];
const FRAME_INTERVAL_MS = 180;

type Screen = 'idle' | 'loading' | 'result' | 'error';

/**
 * Build the phone URL the QR code should point to.
 * Uses VITE_PHONE_URL env var if set (useful when running on a LAN),
 * otherwise falls back to localhost:5173.
 */
function buildPhoneUrl(sessionId: string): string {
  const base = import.meta.env.VITE_PHONE_URL ?? `${window.location.protocol}//${window.location.hostname}:5173`;
  return `${base}/phone/${sessionId}`;
}

export function TabletPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [screen, setScreen] = useState<Screen>('idle');
  const [result, setResult] = useState('');
  const [frameIndex, setFrameIndex] = useState(0);
  const [autoResetIn, setAutoResetIn] = useState<number | null>(null);

  // Keep latest screen in a ref so async callbacks don't close over stale state
  const screenRef = useRef<Screen>('idle');
  screenRef.current = screen;

  const phoneUrl = buildPhoneUrl(sessionId!);

  // ─── Loading frame animation ────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'loading') return;
    const id = setInterval(() => setFrameIndex((i) => (i + 1) % FRAMES.length), FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, [screen]);

  // ─── Polling ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;

    const poll = async () => {
      try {
        const data = await api.getStatus(sessionId);

        if (data.status === 'pending' && screenRef.current !== 'loading') {
          setScreen('loading');
        } else if (data.status === 'done' && data.result) {
          if (screenRef.current !== 'result') {
            setResult(data.result);
            setScreen('result');
          }
        } else if (data.status === 'idle' && screenRef.current !== 'idle') {
          setScreen('idle');
          setResult('');
        } else if (data.status === 'error') {
          setScreen('error');
        }
      } catch {
        // Silently swallow poll errors — server may be momentarily unavailable
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [sessionId]);

  // ─── Auto-reset countdown on result screen ──────────────────────────────
  const handleReset = useCallback(async () => {
    try {
      await api.resetSession(sessionId!);
    } catch {
      // Best-effort reset
    }
    setScreen('idle');
    setResult('');
    setAutoResetIn(null);
  }, [sessionId]);

  useEffect(() => {
    if (screen !== 'result') {
      setAutoResetIn(null);
      return;
    }

    const startedAt = Date.now();

    const tickId = setInterval(() => {
      const remaining = RESULT_AUTO_RESET_MS - (Date.now() - startedAt);
      setAutoResetIn(Math.max(0, Math.ceil(remaining / 1000)));
    }, 500);

    const resetId = setTimeout(() => {
      handleReset();
    }, RESULT_AUTO_RESET_MS);

    return () => {
      clearInterval(tickId);
      clearTimeout(resetId);
    };
  }, [screen, handleReset]);

  // ─── Loading screen ──────────────────────────────────────────────────────
  if (screen === 'loading') {
    return (
      <div className={styles.loadingScreen}>
        <img src={borderImg} alt="" className={styles.borderImg} aria-hidden="true" />

        <div className={styles.loadingContent}>
          <img src={FRAMES[frameIndex]} alt="" className={styles.loadingFrame} aria-hidden="true" />
          <p className={styles.processingText}>PROCESSING…</p>
        </div>

        <div className={styles.bottomBar} />
      </div>
    );
  }

  // ─── Result screen ───────────────────────────────────────────────────────
  if (screen === 'result') {
    return (
      <div className={styles.resultPage}>
        <img src={borderImg} alt="" className={styles.borderImg} aria-hidden="true" />

        <div className={styles.resultContent}>
          <div className={styles.resultTextBlock}>
            <p className={styles.resultText}>{result}</p>
          </div>

          <button className={styles.restartButton} onClick={handleReset}>
            RESTART
          </button>

          {autoResetIn !== null && (
            <p className={styles.autoResetLabel}>
              Auto-reset in {autoResetIn}s
            </p>
          )}
        </div>

        <div className={styles.bottomBar} />
      </div>
    );
  }

  // ─── Error screen ────────────────────────────────────────────────────────
  if (screen === 'error') {
    return (
      <div className={styles.errorScreen}>
        <img src={borderImg} alt="" className={styles.borderImg} aria-hidden="true" />

        <div className={styles.errorContent}>
          <p className={styles.errorText}>SYSTEM ERROR</p>
          <p className={styles.errorSubtext}>The Machine Spirit is displeased.</p>
          <button className={styles.restartButton} onClick={handleReset}>
            RESTART
          </button>
        </div>

        <div className={styles.bottomBar} />
      </div>
    );
  }

  // ─── Idle screen (default) ───────────────────────────────────────────────
  return (
    <div className={styles.idlePage}>
      <img src={borderImg} alt="" className={styles.borderImg} aria-hidden="true" />

      <div className={styles.idleContent}>
        <img src={logoImg} alt="Adeptus Mechanicus" className={styles.logo} />

        <p className={styles.scanText}>Scan the QR to begin</p>

        <div className={styles.qrWrapper}>
          <QRCodeSVG
            value={phoneUrl}
            size={200}
            fgColor="#00b7ff"
            bgColor="#000000"
            level="M"
          />
        </div>

        <p className={styles.sessionLabel}>
          SESSION: <span className={styles.sessionId}>{sessionId}</span>
        </p>
      </div>

      <div className={styles.bottomBar} />
    </div>
  );
}
