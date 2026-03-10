import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/api-server';
import { createTestDb, makeToken } from '../helpers/test-db';

describe('Auth API', () => {
  let app: any;
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
    app = createApp(db);
  });

  it('POST /api/auth/sync creates a new user', async () => {
    const uid = 'firebase-uid-001';
    const res = await request(app)
      .post('/api/auth/sync')
      .set('Authorization', `Bearer ${makeToken(uid)}`)
      .send({ email: 'test@example.com', name: 'Test User', emirate: 'Dubai' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(uid);
    expect(res.body.email).toBe('test@example.com');
  });

  it('POST /api/auth/sync updates an existing user', async () => {
    const uid = 'firebase-uid-002';
    const token = makeToken(uid);

    // Create user first
    await request(app).post('/api/auth/sync')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'update@example.com', name: 'Original Name' });

    // Update the user
    const res = await request(app).post('/api/auth/sync')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name', emirate: 'Abu Dhabi' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.emirate).toBe('Abu Dhabi');
  });

  it('POST /api/auth/sync rejects missing email for new user', async () => {
    const res = await request(app)
      .post('/api/auth/sync')
      .set('Authorization', `Bearer ${makeToken('new-uid')}`)
      .send({ name: 'No Email' });
    expect(res.status).toBe(400);
  });

  it('GET /api/auth/me returns user with valid token', async () => {
    const uid = 'firebase-uid-003';
    const token = makeToken(uid);

    await request(app).post('/api/auth/sync')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'me@example.com', name: 'Me User' });

    const res = await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('me@example.com');
  });

  it('GET /api/auth/me rejects missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me rejects invalid token', async () => {
    const res = await request(app).get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token-xyz');
    expect(res.status).toBe(401);
  });
});
