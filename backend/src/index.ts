import express from 'express';
import cors from 'cors';
import { router } from './routes';

const PORT = Number(process.env.PORT) || 3001;

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      // Add your LAN IP here if testing across devices, e.g. 'http://192.168.1.x:5173'
    ],
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
});
