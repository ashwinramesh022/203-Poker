import { initDb } from '../backend/src/db';
import app from '../backend/src/app';

let ready: Promise<void> | null = null;

function ensureReady() {
  if (!ready) ready = initDb();
  return ready;
}

export default async function handler(req: any, res: any) {
  await ensureReady();
  return app(req, res);
}
