import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/api-server';
import { createTestDb, makeToken } from '../helpers/test-db';

const OWNER_UID = 'test-owner-001';
const OTHER_UID = 'test-owner-002';

async function setupUser(app: any, uid: string, email: string) {
  await request(app).post('/api/auth/sync')
    .set('Authorization', `Bearer ${makeToken(uid)}`)
    .send({ email, name: 'Test Owner', emirate: 'Dubai' });
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

describe('Pets API', () => {
  let app: any;

  beforeEach(async () => {
    const db = createTestDb();
    app = createApp(db);
    await setupUser(app, OWNER_UID, 'owner@test.com');
    await setupUser(app, OTHER_UID, 'other@test.com');
  });

  it('POST /api/pets creates a pet', async () => {
    const res = await request(app).post('/api/pets')
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
      .send({ name: 'Luna', species: 'dog', breed: 'Golden Retriever', age: 3, gender: 'female', weight: 28, location: 'Dubai', isNeutered: false });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Luna');
    expect(res.body.ownerId).toBe(OWNER_UID);
  });

  it('GET /api/pets lists pets', async () => {
    await createPet(app, OWNER_UID);
    const res = await request(app).get('/api/pets')
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('GET /api/pets filters by species', async () => {
    await createPet(app, OWNER_UID, { name: 'Rex', species: 'dog', breed: 'GR' });
    await createPet(app, OWNER_UID, { name: 'Mimi', species: 'cat', breed: 'Persian', weight: 4 });
    const res = await request(app).get('/api/pets?species=cat')
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Mimi');
  });

  it('PUT /api/pets/:id updates own pet', async () => {
    const pet = await createPet(app, OWNER_UID);
    const res = await request(app).put(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
      .send({ name: 'Luna Star' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Luna Star');
  });

  it('PUT /api/pets/:id rejects non-owner', async () => {
    const pet = await createPet(app, OWNER_UID);
    const res = await request(app).put(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${makeToken(OTHER_UID)}`)
      .send({ name: 'Hacked' });
    expect(res.status).toBe(403);
  });

  it('DELETE /api/pets/:id soft deletes', async () => {
    const pet = await createPet(app, OWNER_UID);
    const del = await request(app).delete(`/api/pets/${pet.id}`)
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`);
    expect(del.status).toBe(200);
    const list = await request(app).get('/api/pets')
      .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`);
    expect(list.body.length).toBe(0);
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/pets');
    expect(res.status).toBe(401);
  });
});
