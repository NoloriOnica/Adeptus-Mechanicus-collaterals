import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { router } from './routes';

const PORT = Number(process.env.PORT) || 3001;
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
];

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/^['"]|['"]$/g, '').replace(/\/$/, '');
}

function getAllowedOrigins(): string[] {
  const configured = process.env.CORS_ALLOWED_ORIGINS
    ?.split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  return configured && configured.length > 0 ? configured : DEFAULT_ALLOWED_ORIGINS;
}

const app = express();
const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools and same-origin server traffic without an Origin header.
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      console.error('CORS origin not allowed:', origin, 'allowed:', allowedOrigins);
      callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    methods: ['GET', 'POST'],
  }),
);

app.use(express.json());

app.use('/api', router);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`\n  Adeptus Mechanicus — Backend`);
  console.log(`  ► http://localhost:${PORT}\n`);
  console.log(`  Allowed origins: ${allowedOrigins.join(', ')}\n`);
});
