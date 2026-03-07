import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';
import { pets, matches, breedingContracts, PawMatchDb } from '@pawmatch/db';
import { requireAuth, AuthRequest } from '../middleware/auth';

export function contractsRouter(db: PawMatchDb): Router {
  const router = Router();
  router.use(requireAuth);

  // POST / — Create contract from a match
  router.post('/', (req: AuthRequest, res) => {
    const { matchId, studFeeAED, terms } = req.body;
    if (!matchId) {
      res.status(400).json({ error: 'matchId is required' });
      return;
    }

    const match = db.select().from(matches).where(eq(matches.id, matchId)).get();
    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    const petA = db.select().from(pets).where(eq(pets.id, match.petAId)).get();
    const petB = db.select().from(pets).where(eq(pets.id, match.petBId)).get();

    if (!petA || !petB) {
      res.status(404).json({ error: 'Pets in match not found' });
      return;
    }

    const id = uuid();
    db.insert(breedingContracts).values({
      id,
      matchId,
      ownerAId: petA.ownerId,
      ownerBId: petB.ownerId,
      studFeeAED: studFeeAED ?? null,
      terms: terms ?? null,
    }).run();

    const contract = db.select().from(breedingContracts).where(eq(breedingContracts.id, id)).get();
    res.status(201).json(contract);
  });

  // GET /:id — Get contract
  router.get('/:id', (req: AuthRequest, res) => {
    const contract = db.select().from(breedingContracts).where(eq(breedingContracts.id, req.params.id)).get();
    if (!contract) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }
    res.json(contract);
  });

  // PUT /:id — Update contract status
  router.put('/:id', (req: AuthRequest, res) => {
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const contract = db.select().from(breedingContracts).where(eq(breedingContracts.id, req.params.id)).get();
    if (!contract) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }

    // Only parties can update
    if (contract.ownerAId !== req.userId && contract.ownerBId !== req.userId) {
      res.status(403).json({ error: 'Only contract parties can update' });
      return;
    }

    db.update(breedingContracts).set({
      status,
      updatedAt: new Date().toISOString(),
    }).where(eq(breedingContracts.id, req.params.id)).run();

    const updated = db.select().from(breedingContracts).where(eq(breedingContracts.id, req.params.id)).get();
    res.json(updated);
  });

  return router;
}
