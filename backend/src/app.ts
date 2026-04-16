import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import sessionRoutes from './routes/sessions';
import statsRoutes from './routes/stats';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/stats', statsRoutes);

export default app;
