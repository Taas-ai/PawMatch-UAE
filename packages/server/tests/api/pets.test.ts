import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/api-server';

async function registerAndGetToken(app: any, email = 'owner@test.com') {
  const res = await request(app).post('/api/auth/register')
    .send({ email, password: 'Test1234!', name: 'Owner', emirate: 'Dubai' });
  return res.body.token;
}

describe('Pets API', () => {
  let app: any;
  let token: string;

  beforeEach(async () => {
    app = createApp(':memory:');
    token = await registerAndGetToken(app);
  });

  it('POST /api/pets creates a pet', async () => {
    const res = await request(app).post('/api/pets').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Luna', species: 'dog', breed: 'Golden Retriever', age: 3, gender: 'female', weight: 28, location: 'Dubai', isNeutered: false });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Luna');
    expect(res.body.ownerId).toBeDefined();
  });

  it('GET /api/pets lists pets', async () => {
    await request(app).post('/api/pets').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Luna', species: 'dog', breed: 'Golden Retriever', age: 3, gender: 'female', weight: 28, location: 'Dubai', isNeutered: false });
    const res = await request(app).get('/api/pets').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('GET /api/pets filters by species', async () => {
    await request(app).post('/api/pets').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Luna', species: 'dog', breed: 'GR', age: 3, gender: 'female', weight: 28, location: 'Dubai', isNeutered: false });
    await request(app).post('/api/pets').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Mimi', species: 'cat', breed: 'Persian', age: 2, gender: 'female', weight: 4, location: 'Dubai', isNeutered: false });
    const res = await request(app).get('/api/pets?species=cat').set('Authorization', `Bearer ${token}`);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Mimi');
  });

  it('PUT /api/pets/:id updates own pet', async () => {
    const create = await request(app).post('/api/pets').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Luna', species: 'dog', breed: 'GR', age: 3, gender: 'female', weight: 28, location: 'Dubai', isNeutered: false });
    const res = await request(app).put(`/api/pets/${create.body.id}`).set('Authorization', `Bearer ${token}`)
      .send({ name: 'Luna Star' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Luna Star');
  });

  it('PUT /api/pets/:id rejects non-owner', async () => {
    const create = await request(app).post('/api/pets').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Luna', species: 'dog', breed: 'GR', age: 3, gender: 'female', weight: 28, location: 'Dubai', isNeutered: false });
    const otherToken = await registerAndGetToken(app, 'other@test.com');
    const res = await request(app).put(`/api/pets/${create.body.id}`).set('Authorization', `Bearer ${otherToken}`)
      .send({ name: 'Hacked' });
    expect(res.status).toBe(403);
  });

  it('DELETE /api/pets/:id soft deletes', async () => {
    const create = await request(app).post('/api/pets').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Luna', species: 'dog', breed: 'GR', age: 3, gender: 'female', weight: 28, location: 'Dubai', isNeutered: false });
    const res = await request(app).delete(`/api/pets/${create.body.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const list = await request(app).get('/api/pets').set('Authorization', `Bearer ${token}`);
    expect(list.body.length).toBe(0);
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/pets');
    expect(res.status).toBe(401);
  });
});
