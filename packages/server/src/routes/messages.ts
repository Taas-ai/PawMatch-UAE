import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';
import { pets, matches, messages, PawMatchDb } from '@pawmatch/db';
import { requireAuth, AuthRequest } from '../middleware/auth';

async function isMatchParticipant(db: PawMatchDb, matchId: string, userId: string): Promise<boolean> {
  const match = db.select().from(matches).where(eq(matches.id, matchId)).get();
  if (!match) return false;

  const petA = db.select().from(pets).where(eq(pets.id, match.petAId)).get();
  const petB = db.select().from(pets).where(eq(pets.id, match.petBId)).get();

  return (petA?.ownerId === userId) || (petB?.ownerId === userId);
}

export function messagesRouter(db: PawMatchDb): Router {
  const router = Router();
  router.use(requireAuth);

  // GET /:matchId — Get all messages for a match
  router.get('/:matchId', async (req: AuthRequest, res) => {
    const participant = await isMatchParticipant(db, req.params.matchId, req.userId!);
    if (!participant) {
      res.status(403).json({ error: 'Not a participant in this match' });
      return;
    }

    const msgs = db.select().from(messages)
      .where(eq(messages.matchId, req.params.matchId)).all();
    res.json(msgs);
  });

  // POST /:matchId — Send a message
  router.post('/:matchId', async (req: AuthRequest, res) => {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const match = db.select().from(matches).where(eq(matches.id, req.params.matchId)).get();
    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    if (match.status !== 'accepted') {
      res.status(403).json({ error: 'Can only message in accepted matches' });
      return;
    }

    const participant = await isMatchParticipant(db, req.params.matchId, req.userId!);
    if (!participant) {
      res.status(403).json({ error: 'Not a participant in this match' });
      return;
    }

    const id = uuid();
    db.insert(messages).values({
      id,
      matchId: req.params.matchId,
      senderId: req.userId!,
      content,
    }).run();

    const msg = db.select().from(messages).where(eq(messages.id, id)).get();
    res.status(201).json(msg);
  });

  return router;
}
