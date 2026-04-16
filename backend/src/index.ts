import express from 'express';
import cors from 'cors';
import { initDb } from './db';
import authRoutes from './routes/auth';
import sessionRoutes from './routes/sessions';
import statsRoutes from './routes/stats';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/stats', statsRoutes);

initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => { console.error('DB init failed:', err); process.exit(1); });
