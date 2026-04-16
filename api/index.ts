import { initDb } from '../backend/src/db';
import app from '../backend/src/app';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let initialised = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!initialised) {
    await initDb();
    initialised = true;
  }
  return app(req, res);
}
