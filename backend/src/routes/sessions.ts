import { Router, Response } from 'express';
import db from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  const result = await db.execute({
    sql: `SELECT s.*, u.username as created_by_name,
      COUNT(DISTINCT sp.user_id) as player_count,
      SUM(sp.buy_in) as total_pot
    FROM sessions s
    JOIN users u ON s.created_by = u.id
    LEFT JOIN session_players sp ON sp.session_id = s.id
    WHERE s.id IN (SELECT session_id FROM session_players WHERE user_id = ?)
       OR s.created_by = ?
    GROUP BY s.id
    ORDER BY s.date DESC, s.created_at DESC`,
    args: [req.userId!, req.userId!],
  });
  res.json(result.rows);
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const { name, date, location, notes, small_blind, big_blind, players } = req.body;
  if (!name || !date) return res.status(400).json({ error: 'Name and date required' });

  const ins = await db.execute({
    sql: 'INSERT INTO sessions (name, date, location, notes, small_blind, big_blind, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [name, date, location || null, notes || null, small_blind || 0.25, big_blind || 0.5, req.userId!],
  });
  const sessionId = Number(ins.lastInsertRowid);

  if (Array.isArray(players)) {
    for (const p of players) {
      await db.execute({
        sql: 'INSERT OR REPLACE INTO session_players (session_id, user_id, buy_in, cash_out) VALUES (?, ?, ?, ?)',
        args: [sessionId, p.user_id, p.buy_in || 0, p.cash_out || 0],
      });
    }
  }

  const session = await db.execute({ sql: 'SELECT * FROM sessions WHERE id = ?', args: [sessionId] });
  res.status(201).json(session.rows[0]);
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const sess = await db.execute({
    sql: `SELECT s.*, u.username as created_by_name FROM sessions s JOIN users u ON s.created_by = u.id WHERE s.id = ?`,
    args: [req.params.id],
  });
  const session = sess.rows[0];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const playersRes = await db.execute({
    sql: `SELECT sp.*, u.username, u.avatar_color FROM session_players sp JOIN users u ON sp.user_id = u.id WHERE sp.session_id = ? ORDER BY (sp.cash_out - sp.buy_in) DESC`,
    args: [req.params.id],
  });

  res.json({ ...session, players: playersRes.rows });
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { name, date, location, notes, small_blind, big_blind, players } = req.body;
  const sessRes = await db.execute({ sql: 'SELECT * FROM sessions WHERE id = ?', args: [req.params.id] });
  const session = sessRes.rows[0] as any;
  if (!session) return res.status(404).json({ error: 'Not found' });
  if (Number(session.created_by) !== req.userId) return res.status(403).json({ error: 'Forbidden' });

  await db.execute({
    sql: 'UPDATE sessions SET name=?, date=?, location=?, notes=?, small_blind=?, big_blind=? WHERE id=?',
    args: [name || session.name, date || session.date, location ?? session.location, notes ?? session.notes,
           small_blind ?? session.small_blind, big_blind ?? session.big_blind, req.params.id],
  });

  if (Array.isArray(players)) {
    await db.execute({ sql: 'DELETE FROM session_players WHERE session_id = ?', args: [req.params.id] });
    for (const p of players) {
      await db.execute({
        sql: 'INSERT INTO session_players (session_id, user_id, buy_in, cash_out) VALUES (?, ?, ?, ?)',
        args: [req.params.id, p.user_id, p.buy_in || 0, p.cash_out || 0],
      });
    }
  }

  res.json({ success: true });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const sessRes = await db.execute({ sql: 'SELECT * FROM sessions WHERE id = ?', args: [req.params.id] });
  const session = sessRes.rows[0] as any;
  if (!session) return res.status(404).json({ error: 'Not found' });
  if (Number(session.created_by) !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  await db.execute({ sql: 'DELETE FROM sessions WHERE id = ?', args: [req.params.id] });
  res.json({ success: true });
});

export default router;
