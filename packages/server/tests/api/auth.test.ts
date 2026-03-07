import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/api-server';

describe('Auth API', () => {
  let app: any;

  beforeEach(() => {
    app = createApp(':memory:');
  });

  it('POST /api/auth/register creates a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'Test1234!', name: 'Test User', emirate: 'Dubai' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('POST /api/auth/register rejects duplicate email', async () => {
    const payload = { email: 'dup@example.com', password: 'Test1234!', name: 'Dup', emirate: 'Dubai' };
    await request(app).post('/api/auth/register').send(payload);
    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(409);
  });

  it('POST /api/auth/login returns token', async () => {
    await request(app).post('/api/auth/register')
      .send({ email: 'login@example.com', password: 'Test1234!', name: 'Login', emirate: 'Dubai' });
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'Test1234!' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login rejects wrong password', async () => {
    await request(app).post('/api/auth/register')
      .send({ email: 'wrong@example.com', password: 'Test1234!', name: 'Wrong', emirate: 'Dubai' });
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: 'WrongPass!' });
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me returns user with valid token', async () => {
    const reg = await request(app).post('/api/auth/register')
      .send({ email: 'me@example.com', password: 'Test1234!', name: 'Me', emirate: 'Dubai' });
    const res = await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('me@example.com');
  });

  it('GET /api/auth/me rejects missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
