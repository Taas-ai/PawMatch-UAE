import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { eq, inArray, or } from 'drizzle-orm';
import { pets, matches, PawMatchDb } from '@pawmatch/db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { petMatchFlow } from '../flows/pet-match';

export function matchesRouter(db: PawMatchDb): Router {
  const router = Router();
  router.use(requireAuth);

  // POST /analyze — AI-powered match analysis
  router.post('/analyze', async (req: AuthRequest, res) => {
    try {
      const { petAId, petBId } = req.body;
      if (!petAId || !petBId) {
        res.status(400).json({ error: 'petAId and petBId are required' });
        return;
      }

      const [[petA], [petB]] = await Promise.all([
        db.select().from(pets).where(eq(pets.id, petAId)),
        db.select().from(pets).where(eq(pets.id, petBId)),
      ]);

      if (!petA || !petB) {
        res.status(404).json({ error: 'One or both pets not found' });
        return;
      }

      if (petA.ownerId !== req.userId && petB.ownerId !== req.userId) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      const profileA = {
        name: petA.name, species: petA.species as 'dog' | 'cat', breed: petA.breed,
        age: petA.age, gender: petA.gender as 'male' | 'female', weight: petA.weight,
        location: petA.location, healthRecords: JSON.parse(petA.healthRecords || '[]') as string[],
        dnaTestResults: petA.dnaTestResults ?? undefined, temperament: petA.temperament ?? undefined,
        pedigree: petA.pedigree ?? undefined, isNeutered: petA.isNeutered,
      };

      const profileB = {
        name: petB.name, species: petB.species as 'dog' | 'cat', breed: petB.breed,
        age: petB.age, gender: petB.gender as 'male' | 'female', weight: petB.weight,
        location: petB.location, healthRecords: JSON.parse(petB.healthRecords || '[]') as string[],
        dnaTestResults: petB.dnaTestResults ?? undefined, temperament: petB.temperament ?? undefined,
        pedigree: petB.pedigree ?? undefined, isNeutered: petB.isNeutered,
      };

      const aiResult = await petMatchFlow({ petA: profileA, petB: profileB });

      const id = uuid();
      const now = new Date().toISOString();
      await db.insert(matches).values({
        id, petAId, petBId, requestedBy: req.userId!,
        compatibilityScore: aiResult.compatibilityScore,
        geneticHealthRisk: aiResult.geneticHealthRisk,
        breedCompatibility: aiResult.breedCompatibility,
        temperamentMatch: aiResult.temperamentMatch,
        locationProximity: aiResult.locationProximity,
        recommendation: aiResult.recommendation,
        warnings: JSON.stringify(aiResult.warnings),
        breedingTips: JSON.stringify(aiResult.breedingTips),
        createdAt: now, updatedAt: now,
      });

      const [match] = await db.select().from(matches).where(eq(matches.id, id));
      res.status(201).json(match);
    } catch (err: any) {
      console.error('Match analysis error:', err);
      res.status(500).json({ error: 'Match analysis failed' });
    }
  });

  // GET / — List matches for user's pets
  router.get('/', async (req: AuthRequest, res) => {
    const userPetRows = await db.select({ id: pets.id }).from(pets).where(eq(pets.ownerId, req.userId!));
    const userPetIds = userPetRows.map(p => p.id);

    if (userPetIds.length === 0) {
      res.json([]);
      return;
    }

    const userMatches = await db.select().from(matches).where(
      or(inArray(matches.petAId, userPetIds), inArray(matches.petBId, userPetIds))
    );
    res.json(userMatches);
  });

  // GET /:id — Get single match
  router.get('/:id', async (req: AuthRequest, res) => {
    const [match] = await db.select().from(matches).where(eq(matches.id, req.params.id));
    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    const [[petA], [petB]] = await Promise.all([
      db.select().from(pets).where(eq(pets.id, match.petAId)),
      db.select().from(pets).where(eq(pets.id, match.petBId)),
    ]);
    if (petA?.ownerId !== req.userId && petB?.ownerId !== req.userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    res.json(match);
  });

  // PUT /:id/respond — Accept or reject a match
  router.put('/:id/respond', async (req: AuthRequest, res) => {
    const { status } = req.body;
    if (!status || !['accepted', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Status must be accepted or rejected' });
      return;
    }

    const [match] = await db.select().from(matches).where(eq(matches.id, req.params.id));
    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    const [[petA], [petB]] = await Promise.all([
      db.select().from(pets).where(eq(pets.id, match.petAId)),
      db.select().from(pets).where(eq(pets.id, match.petBId)),
    ]);
    if (petA?.ownerId !== req.userId && petB?.ownerId !== req.userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await db.update(matches).set({ status, updatedAt: new Date().toISOString() }).where(eq(matches.id, req.params.id));
    const [updated] = await db.select().from(matches).where(eq(matches.id, req.params.id));
    res.json(updated);
  });

  return router;
}
