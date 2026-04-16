import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';
import { authenticate, AuthRequest, JWT_SECRET } from '../middleware/auth';

const router = Router();
const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#14b8a6'];

router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields required' });

  const hash = await bcrypt.hash(password, 10);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  try {
    const result = await db.execute({
      sql: 'INSERT INTO users (username, email, password_hash, avatar_color) VALUES (?, ?, ?, ?)',
      args: [username, email, hash, color],
    });
    const id = Number(result.lastInsertRowid);
    const token = jwt.sign({ userId: id, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, username, email, avatar_color: color } });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return res.status(409).json({ error: 'Username or email already taken' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
  const user = result.rows[0] as any;
  if (!user || !await bcrypt.compare(password, user.password_hash as string))
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: Number(user.id), username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: Number(user.id), username: user.username, email: user.email, avatar_color: user.avatar_color } });
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const result = await db.execute({ sql: 'SELECT id, username, email, avatar_color, created_at FROM users WHERE id = ?', args: [req.userId!] });
  const user = result.rows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.get('/users', authenticate, async (_req: AuthRequest, res: Response) => {
  const result = await db.execute('SELECT id, username, avatar_color FROM users ORDER BY username');
  res.json(result.rows);
});

export default router;
