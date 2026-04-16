import { initDb } from './db';
import app from './app';

const PORT = process.env.PORT || 3001;

initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => { console.error('DB init failed:', err); process.exit(1); });
