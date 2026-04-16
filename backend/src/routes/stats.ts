import { Router, Response } from 'express';
import db from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/player/:userId', async (req: AuthRequest, res: Response) => {
  const uid = req.params.userId;

  const overallRes = await db.execute({
    sql: `SELECT
      COUNT(*) as sessions_played,
      SUM(cash_out - buy_in) as total_profit,
      SUM(buy_in) as total_buy_in,
      SUM(cash_out) as total_cash_out,
      MAX(cash_out - buy_in) as best_session,
      MIN(cash_out - buy_in) as worst_session,
      AVG(cash_out - buy_in) as avg_profit,
      SUM(CASE WHEN cash_out > buy_in THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN cash_out < buy_in THEN 1 ELSE 0 END) as losses
    FROM session_players WHERE user_id = ?`,
    args: [uid],
  });

  const historyRes = await db.execute({
    sql: `SELECT sp.buy_in, sp.cash_out, sp.cash_out - sp.buy_in as profit, s.date, s.name
      FROM session_players sp JOIN sessions s ON sp.session_id = s.id
      WHERE sp.user_id = ? ORDER BY s.date ASC`,
    args: [uid],
  });

  let running = 0;
  const chartData = historyRes.rows.map((row: any) => {
    running += Number(row.profit);
    return { date: row.date, session: row.name, profit: Number(row.profit), cumulative: parseFloat(running.toFixed(2)) };
  });

  res.json({ overall: overallRes.rows[0], history: chartData });
});

router.get('/leaderboard', async (_req: AuthRequest, res: Response) => {
  const result = await db.execute(`
    SELECT u.id, u.username, u.avatar_color,
      COUNT(*) as sessions,
      SUM(sp.cash_out - sp.buy_in) as total_profit,
      SUM(CASE WHEN sp.cash_out > sp.buy_in THEN 1 ELSE 0 END) as wins,
      AVG(sp.cash_out - sp.buy_in) as avg_profit
    FROM session_players sp JOIN users u ON sp.user_id = u.id
    GROUP BY u.id ORDER BY total_profit DESC
  `);
  res.json(result.rows);
});

router.get('/settlements', async (_req: AuthRequest, res: Response) => {
  const result = await db.execute(`
    SELECT u.id, u.username, u.avatar_color,
      SUM(sp.cash_out - sp.buy_in) as net
    FROM session_players sp JOIN users u ON sp.user_id = u.id
    GROUP BY u.id
  `);
  const balances = result.rows as any[];
  const transactions = settleDebts(balances);
  res.json({ balances, transactions });
});

router.get('/settlements/session/:sessionId', async (req: AuthRequest, res: Response) => {
  const result = await db.execute({
    sql: `SELECT sp.user_id as id, u.username, u.avatar_color, sp.buy_in, sp.cash_out,
      sp.cash_out - sp.buy_in as net
    FROM session_players sp JOIN users u ON sp.user_id = u.id
    WHERE sp.session_id = ?`,
    args: [req.params.sessionId],
  });
  const players = result.rows as any[];
  const transactions = settleDebts(players);
  res.json({ players, transactions });
});

function settleDebts(players: any[]) {
  const creditors: { id: number; username: string; amount: number }[] = [];
  const debtors: { id: number; username: string; amount: number }[] = [];

  for (const p of players) {
    const net = parseFloat(Number(p.net || 0).toFixed(2));
    if (net > 0.005) creditors.push({ id: p.id, username: p.username, amount: net });
    else if (net < -0.005) debtors.push({ id: p.id, username: p.username, amount: -net });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions: { from: string; to: string; amount: number }[] = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    if (amount > 0.01) {
      transactions.push({ from: debtors[i].username, to: creditors[j].username, amount: parseFloat(amount.toFixed(2)) });
    }
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return transactions;
}

export default router;
