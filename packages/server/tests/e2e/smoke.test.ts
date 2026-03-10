import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../../src/api-server';

/**
 * End-to-end smoke test: boots the full Express app with in-memory SQLite
 * and runs a complete user journey — register, login, create pet, browse, match.
 */
// Smoke tests were written for the old JWT/SQLite stack.
// They reference /api/auth/register and /api/auth/login which no longer exist
// after the Firebase Auth migration. These tests should be rewritten against
// a staging environment once Firebase + Supabase are provisioned.
describe.skip('E2E Smoke Test', () => {
  let app: Express;
  let token: string;
  let userId: string;
  let petId: string;

  beforeAll(() => {
    app = createApp(':memory:');
  });

  it('health: GET /api/resources/breeds returns data (public)', async () => {
    const res = await request(app).get('/api/resources/breeds');
    expect(res.status).toBe(200);
    expect(res.body.dogs).toBeInstanceOf(Array);
    expect(res.body.dogs.length).toBeGreaterThan(0);
  });

  it('register: POST /api/auth/register', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'smoke@test.com',
      password: 'SmokeTest123!',
      name: 'Smoke Tester',
      phone: '+971501111111',
      emirate: 'Dubai',
      role: 'owner',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
    userId = res.body.user.id;
  });

  it('login: POST /api/auth/login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'smoke@test.com',
      password: 'SmokeTest123!',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('me: GET /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('smoke@test.com');
  });

  it('create pet: POST /api/pets', async () => {
    const res = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Smoky',
        species: 'dog',
        breed: 'Labrador Retriever',
        age: 2,
        gender: 'male',
        weight: 30,
        location: 'Dubai',
        isNeutered: false,
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    petId = res.body.id;
  });

  it('list pets: GET /api/pets', async () => {
    const res = await request(app)
      .get('/api/pets')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Smoky');
  });

  it('get pet: GET /api/pets/:id', async () => {
    const res = await request(app)
      .get(`/api/pets/${petId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.breed).toBe('Labrador Retriever');
  });

  it('update pet: PUT /api/pets/:id', async () => {
    const res = await request(app)
      .put(`/api/pets/${petId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ weight: 32 });
    expect(res.status).toBe(200);
    expect(res.body.weight).toBe(32);
  });

  it('rejects unauthenticated: GET /api/pets without token', async () => {
    const res = await request(app).get('/api/pets');
    expect(res.status).toBe(401);
  });

  it('vets directory: GET /api/resources/vets', async () => {
    const res = await request(app).get('/api/resources/vets');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
