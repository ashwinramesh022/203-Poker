import { initDb } from '../backend/src/db';
import app from '../backend/src/app';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let initialised = false;
let initError: unknown = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!initialised && !initError) {
    try {
      await initDb();
      initialised = true;
    } catch (err) {
      initError = err;
      console.error('[init] DB init failed:', err);
    }
  }
  if (initError && req.url !== '/api/health') {
    return (res as any).status(503).json({ error: 'DB init failed', detail: String(initError) });
  }
  return app(req, res);
}
