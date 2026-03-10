import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { mockGeminiDiagnosticResponse, mockGeminiDocumentOCRResponse } from '../../../../fixtures/sample-data';

vi.mock('../../src/flows/pet-diagnostic', () => ({
  petDiagnosticFlow: vi.fn().mockResolvedValue(mockGeminiDiagnosticResponse),
}));
vi.mock('../../src/flows/vet-document-ocr', () => ({
  vetDocumentOCRFlow: vi.fn().mockResolvedValue(mockGeminiDocumentOCRResponse),
}));

import { createApp } from '../../src/api-server';
import { createTestDb, makeToken } from '../helpers/test-db';

const OWNER_UID = 'diag-owner-001';

async function setupUser(app: any, uid: string) {
  await request(app).post('/api/auth/sync')
    .set('Authorization', `Bearer ${makeToken(uid)}`)
    .send({ email: 'diag-owner@test.com', name: 'DiagOwner', emirate: 'Dubai' });
}

async function createPet(app: any, uid: string) {
  const res = await request(app).post('/api/pets')
    .set('Authorization', `Bearer ${makeToken(uid)}`)
    .send({ name: 'Luna', species: 'dog', breed: 'Golden Retriever', age: 3, gender: 'female', weight: 28, location: 'Dubai', isNeutered: false });
  return res.body.id;
}

describe('Diagnostics API', () => {
  let app: any;
  let petId: string;

  beforeEach(async () => {
    const db = createTestDb();
    app = createApp(db);
    await setupUser(app, OWNER_UID);
    petId = await createPet(app, OWNER_UID);
  });

  describe('POST /api/diagnostic/:petId', () => {
    it('creates a diagnostic analysis', async () => {
      const res = await request(app).post(`/api/diagnostic/${petId}`)
        .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
        .send({ imageUrl: 'data:image/png;base64,abc123', symptoms: 'Scratching ear' });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.assessment).toBeTruthy();
      expect(res.body.possibleConditions).toBeInstanceOf(Array);
      expect(res.body.urgencyLevel).toBe('soon');
      expect(res.body.disclaimer).toBeTruthy();
    });

    it('returns 404 for missing pet', async () => {
      const res = await request(app).post('/api/diagnostic/nonexistent-pet')
        .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
        .send({ imageUrl: 'data:image/png;base64,abc123' });
      expect(res.status).toBe(404);
    });

    it('returns 400 without imageUrl', async () => {
      const res = await request(app).post(`/api/diagnostic/${petId}`)
        .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
        .send({ symptoms: 'Scratching ear' });
      expect(res.status).toBe(400);
    });

    it('requires auth (401 without token)', async () => {
      const res = await request(app).post(`/api/diagnostic/${petId}`)
        .send({ imageUrl: 'data:image/png;base64,abc123' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/diagnostic/:petId', () => {
    it('returns diagnostic history', async () => {
      await request(app).post(`/api/diagnostic/${petId}`)
        .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
        .send({ imageUrl: 'data:image/png;base64,abc123', symptoms: 'Ear redness' });

      const res = await request(app).get(`/api/diagnostic/${petId}`)
        .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`);
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].petId).toBe(petId);
    });

    it('requires auth (401 without token)', async () => {
      const res = await request(app).get(`/api/diagnostic/${petId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/documents/:petId/scan', () => {
    it('creates a document scan', async () => {
      const res = await request(app).post(`/api/documents/${petId}/scan`)
        .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
        .send({ imageUrl: 'data:image/png;base64,lab123', documentType: 'lab_report' });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.documentType).toBe('lab_report');
      expect(res.body.rawText).toBeTruthy();
    });

    it('returns 404 for missing pet', async () => {
      const res = await request(app).post('/api/documents/nonexistent-pet/scan')
        .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
        .send({ imageUrl: 'data:image/png;base64,lab123', documentType: 'lab_report' });
      expect(res.status).toBe(404);
    });

    it('returns 400 without required fields', async () => {
      const res = await request(app).post(`/api/documents/${petId}/scan`)
        .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
        .send({ imageUrl: 'data:image/png;base64,lab123' });
      expect(res.status).toBe(400);
    });

    it('requires auth (401 without token)', async () => {
      const res = await request(app).post(`/api/documents/${petId}/scan`)
        .send({ imageUrl: 'data:image/png;base64,lab123', documentType: 'lab_report' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/documents/:petId', () => {
    it('returns document list', async () => {
      await request(app).post(`/api/documents/${petId}/scan`)
        .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`)
        .send({ imageUrl: 'data:image/png;base64,lab123', documentType: 'lab_report' });

      const res = await request(app).get(`/api/documents/${petId}`)
        .set('Authorization', `Bearer ${makeToken(OWNER_UID)}`);
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].petId).toBe(petId);
      expect(res.body[0].documentType).toBe('lab_report');
    });

    it('requires auth (401 without token)', async () => {
      const res = await request(app).get(`/api/documents/${petId}`);
      expect(res.status).toBe(401);
    });
  });
});
