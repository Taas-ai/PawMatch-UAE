import express from 'express';
import cors from 'cors';
import { createDb } from '@pawmatch/db';
import { authRouter } from './routes/auth';
import { petsRouter } from './routes/pets';

export function createApp(dbPath: string = './pawmatch.db') {
  const db = createDb(dbPath);
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRouter(db));
  app.use('/api/pets', petsRouter(db));

  return app;
}

if (require.main === module) {
  const port = process.env.PORT || 3001;
  const app = createApp();
  app.listen(port, () => console.log(`PawMatch API running on http://localhost:${port}`));
}
