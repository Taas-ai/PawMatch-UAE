import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

vi.mock('../../src/flows/pet-match', () => ({
  petMatchFlow: vi.fn().mockResolvedValue({
    compatibilityScore: 85,
    geneticHealthRisk: 'low',
    breedCompatibility: 'good',
    temperamentMatch: 'excellent',
    locationProximity: 'Same city',
    recommendation: 'Great match',
    warnings: [],
    breedingTips: ['Schedule vet check'],
  }),
}));

import { createApp } from '../../src/api-server';
import { createTestDb, makeToken } from '../helpers/test-db';

const OWNER_UID = 'match-owner-001';

async function setupUser(app: any, uid: string, email: string) {
  await request(app).post('/api/auth/sync')
    .set('Authorization', `Bearer ${makeToken(uid)}`)
    .send({ email, name: 'Owner', emirate: 'Dubai' });
}

async function createPet(app: any, uid: string, overrides: Record<string, any> = {}) {
  const defaults = {
    name: 'Luna', species: 'dog', breed: 'Golden Retriever',
    age: 3, gender: 'female', weight: 28, location: 'Dubai', isNeutered: false,
  };
  const res = await request(app).post('/api/pets')
    .set('Authorization', `Bearer ${makeToken(uid)}`)
    .send({ ...defaults, ...overrides });
  return res.body;
}

describe('Matches API', () => {
  let app: any;

  beforeEach(async () => {
    const db = createTestDb();
    app = createApp(db);
    await setupUser(app, OWNER_UID, 'owner@test.com');
  });

  it('POST /api/matches/analyze creates a match', async () => {
    const petA = await createPet(app, OWNER_UID, { name: 'Rex', gender: 'male', breed: 'GR' });
    const petB = await createPet(app, OWNER_UID, { name: 'Luna', gender: 'female', breed: 'GR' });

    const res = await request(app).post('/api/matches/analyze')
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
      .send({ petAId: petA.id, petBId: petB.id });

    expect(res.status).toBe(201);
    expect(res.body.compatibilityScore).toBe(85);
    expect(res.body.geneticHealthRisk).toBe('low');
    expect(res.body.petAId).toBe(petA.id);
    expect(res.body.petBId).toBe(petB.id);
    expect(res.body.status).toBe('pending');
  });

  it('GET /api/matches lists user matches', async () => {
    const petA = await createPet(app, OWNER_UID, { name: 'Rex', gender: 'male' });
    const petB = await createPet(app, OWNER_UID, { name: 'Luna', gender: 'female' });

    await request(app).post('/api/matches/analyze')
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
      .send({ petAId: petA.id, petBId: petB.id });

    const res = await request(app).get('/api/matches')
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].compatibilityScore).toBe(85);
  });

  it('PUT /api/matches/:id/respond accepts a match', async () => {
    const petA = await createPet(app, OWNER_UID, { name: 'Rex', gender: 'male' });
    const petB = await createPet(app, OWNER_UID, { name: 'Luna', gender: 'female' });

    const create = await request(app).post('/api/matches/analyze')
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
      .send({ petAId: petA.id, petBId: petB.id });

    const res = await request(app).put(`/api/matches/${create.body.id}/respond`)
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
      .send({ status: 'accepted' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('accepted');
  });

  it('POST /api/matches/analyze returns 400 without pet IDs', async () => {
    const res = await request(app).post('/api/matches/analyze')
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/matches/analyze returns 404 for missing pets', async () => {
    const res = await request(app).post('/api/matches/analyze')
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
      .send({ petAId: 'nonexistent', petBId: 'also-nonexistent' });
    expect(res.status).toBe(404);
  });

  it('PUT /api/matches/:id/respond rejects invalid status', async () => {
    const petA = await createPet(app, OWNER_UID, { name: 'Rex', gender: 'male' });
    const petB = await createPet(app, OWNER_UID, { name: 'Luna', gender: 'female' });

    const create = await request(app).post('/api/matches/analyze')
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
      .send({ petAId: petA.id, petBId: petB.id });

    const res = await request(app).put(`/api/matches/${create.body.id}/respond`)
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
      .send({ status: 'invalid' });

    expect(res.status).toBe(400);
  });
});
