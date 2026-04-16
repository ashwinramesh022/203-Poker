import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import sessionRoutes from './routes/sessions';
import statsRoutes from './routes/stats';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    urlScheme: process.env.TURSO_DATABASE_URL?.split('://')[0] ?? 'none',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/stats', statsRoutes);

export default app;
