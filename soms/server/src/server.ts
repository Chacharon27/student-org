import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/db';
import { ensureAdminUser } from './utils/admin';

const PORT = Number(process.env.PORT) || 5000;

(async () => {
  try {
    await connectDB();
    await ensureAdminUser();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 SOMS API running on port ${PORT}`);
      console.log(`📘 Swagger docs:  http://localhost:${PORT}/api/docs`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
