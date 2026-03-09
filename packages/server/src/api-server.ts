import express from 'express';
import cors from 'cors';
import { createDb } from '@pawmatch/db';
import { authRouter } from './routes/auth';
import { petsRouter } from './routes/pets';
import { matchesRouter } from './routes/matches';
import { messagesRouter } from './routes/messages';
import { aiToolsRouter } from './routes/ai-tools';
import { contractsRouter } from './routes/contracts';
import { resourcesRouter } from './routes/resources';
import { socialAuthRouter } from './routes/social-auth';

export function createApp(dbPath: string = './pawmatch.db') {
  const db = createDb(dbPath);
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRouter(db));
  app.use('/api/auth', socialAuthRouter(db));
  app.use('/api/pets', petsRouter(db));
  app.use('/api/matches', matchesRouter(db));
  app.use('/api/messages', messagesRouter(db));
  app.use('/api/resources', resourcesRouter());
  app.use('/api', aiToolsRouter(db));
  app.use('/api/contracts', contractsRouter(db));

  return app;
}

if (require.main === module) {
  const port = process.env.PORT || 3001;
  const app = createApp();
  app.listen(port, () => console.log(`PawMatch API running on http://localhost:${port}`));
}
