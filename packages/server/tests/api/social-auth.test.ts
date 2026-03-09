import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/api-server';

describe('Social Auth API', () => {
  let app: any;

  beforeEach(() => {
    app = createApp(':memory:');
  });

  // --- Google ---

  it('POST /api/auth/google with valid profile creates new user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        idToken: 'fake-google-token',
        profile: {
          email: 'googleuser@gmail.com',
          name: 'Google User',
          picture: 'https://lh3.google.com/photo.jpg',
          sub: 'google-uid-123',
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('googleuser@gmail.com');
    expect(res.body.user.authProvider).toBe('google');
    expect(res.body.user.authProviderId).toBe('google-uid-123');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('POST /api/auth/google with existing email links accounts', async () => {
    // First register with email/password
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'linked@example.com', password: 'Test1234!', name: 'Linked User' });

    // Then sign in with Google using same email
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        idToken: 'fake-token',
        profile: {
          email: 'linked@example.com',
          name: 'Linked User',
          sub: 'google-uid-linked',
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.authProvider).toBe('google');
    expect(res.body.user.authProviderId).toBe('google-uid-linked');
  });

  it('POST /api/auth/google returns 400 without profile', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/idToken or profile required/);
  });

  // --- Apple ---

  it('POST /api/auth/apple with valid profile creates new user', async () => {
    const res = await request(app)
      .post('/api/auth/apple')
      .send({
        identityToken: 'fake-apple-token',
        profile: {
          email: 'appleuser@icloud.com',
          name: 'Apple User',
          sub: 'apple-uid-456',
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('appleuser@icloud.com');
    expect(res.body.user.authProvider).toBe('apple');
    expect(res.body.user.authProviderId).toBe('apple-uid-456');
  });

  it('POST /api/auth/apple with only appleId (no email) creates user with relay email', async () => {
    const res = await request(app)
      .post('/api/auth/apple')
      .send({
        identityToken: 'fake-apple-token',
        profile: {
          sub: 'apple-uid-noemail',
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('apple_apple-uid-noemail@private.relay');
    expect(res.body.user.name).toBe('Apple User');
  });

  it('POST /api/auth/apple returns 400 without identityToken or profile', async () => {
    const res = await request(app)
      .post('/api/auth/apple')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/identityToken or profile required/);
  });

  // --- Cross-cutting ---

  it('GET /api/auth/me works for social-login users', async () => {
    const google = await request(app)
      .post('/api/auth/google')
      .send({
        idToken: 'fake-token',
        profile: {
          email: 'metest@gmail.com',
          name: 'Me Test',
          sub: 'google-uid-me',
        },
      });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${google.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('metest@gmail.com');
    expect(res.body.authProvider).toBe('google');
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('POST /api/auth/login returns specific error for social-login users (no password)', async () => {
    // Create a Google-only user
    await request(app)
      .post('/api/auth/google')
      .send({
        idToken: 'fake-token',
        profile: {
          email: 'socialonly@gmail.com',
          name: 'Social Only',
          sub: 'google-uid-social',
        },
      });

    // Try to login with email/password
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'socialonly@gmail.com', password: 'anything' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/social login/i);
  });
});
