import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { eq, and } from 'drizzle-orm';
import { pets, PawMatchDb } from '@pawmatch/db';
import { requireAuth, AuthRequest } from '../middleware/auth';

export function petsRouter(db: PawMatchDb): Router {
  const router = Router();
  router.use(requireAuth);

  router.get('/', (req: AuthRequest, res) => {
    const { species, breed, emirate, gender } = req.query;
    const conditions: any[] = [eq(pets.status, 'active')];
    if (species) conditions.push(eq(pets.species, species as string));
    if (breed) conditions.push(eq(pets.breed, breed as string));
    if (emirate) conditions.push(eq(pets.location, emirate as string));
    if (gender) conditions.push(eq(pets.gender, gender as string));
    const results = db.select().from(pets).where(and(...conditions)).all();
    res.json(results);
  });

  router.get('/:id', (req: AuthRequest, res) => {
    const pet = db.select().from(pets).where(eq(pets.id, req.params.id)).get();
    if (!pet) { res.status(404).json({ error: 'Pet not found' }); return; }
    res.json(pet);
  });

  router.post('/', (req: AuthRequest, res) => {
    const { name, species: sp, breed, age, gender, weight, location, temperament, pedigree, healthRecords, dnaTestResults, isNeutered, photoUrls } = req.body;
    if (!name || !sp || !breed || age == null || !gender || weight == null || !location) {
      res.status(400).json({ error: 'Missing required fields' }); return;
    }
    const id = uuid();
    db.insert(pets).values({
      id, ownerId: req.userId!, name, species: sp, breed, age, gender, weight, location,
      temperament, pedigree, isNeutered: isNeutered ?? false,
      healthRecords: healthRecords ? JSON.stringify(healthRecords) : '[]',
      dnaTestResults, photoUrls: photoUrls ? JSON.stringify(photoUrls) : '[]',
    }).run();
    const pet = db.select().from(pets).where(eq(pets.id, id)).get();
    res.status(201).json(pet);
  });

  router.put('/:id', (req: AuthRequest, res) => {
    const pet = db.select().from(pets).where(eq(pets.id, req.params.id)).get();
    if (!pet) { res.status(404).json({ error: 'Pet not found' }); return; }
    if (pet.ownerId !== req.userId) { res.status(403).json({ error: 'Not your pet' }); return; }
    const updates: Record<string, any> = {};
    for (const key of ['name', 'breed', 'age', 'gender', 'weight', 'location', 'temperament', 'pedigree', 'dnaTestResults', 'isNeutered']) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (req.body.healthRecords) updates.healthRecords = JSON.stringify(req.body.healthRecords);
    if (req.body.photoUrls) updates.photoUrls = JSON.stringify(req.body.photoUrls);
    updates.updatedAt = new Date().toISOString();
    db.update(pets).set(updates).where(eq(pets.id, req.params.id)).run();
    const updated = db.select().from(pets).where(eq(pets.id, req.params.id)).get();
    res.json(updated);
  });

  router.delete('/:id', (req: AuthRequest, res) => {
    const pet = db.select().from(pets).where(eq(pets.id, req.params.id)).get();
    if (!pet) { res.status(404).json({ error: 'Pet not found' }); return; }
    if (pet.ownerId !== req.userId) { res.status(403).json({ error: 'Not your pet' }); return; }
    db.update(pets).set({ status: 'inactive', updatedAt: new Date().toISOString() }).where(eq(pets.id, req.params.id)).run();
    res.json({ message: 'Pet deactivated' });
  });

  return router;
}
