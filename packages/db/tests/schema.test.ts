import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import * as schema from '../src/schema.js';

function createTestDb() {
  const sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema });
  sqlite.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      name TEXT NOT NULL,
      auth_provider TEXT NOT NULL DEFAULT 'email',
      auth_provider_id TEXT,
      phone TEXT,
      emirate TEXT,
      role TEXT NOT NULL DEFAULT 'owner',
      kyc_verified INTEGER NOT NULL DEFAULT 0,
      avatar_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE pets (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      breed TEXT NOT NULL,
      age REAL NOT NULL,
      gender TEXT NOT NULL,
      weight REAL NOT NULL,
      location TEXT NOT NULL,
      temperament TEXT,
      pedigree TEXT,
      health_records TEXT NOT NULL DEFAULT '[]',
      dna_test_results TEXT,
      is_neutered INTEGER NOT NULL DEFAULT 0,
      photo_urls TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE matches (
      id TEXT PRIMARY KEY,
      pet_a_id TEXT NOT NULL REFERENCES pets(id),
      pet_b_id TEXT NOT NULL REFERENCES pets(id),
      requested_by TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending',
      compatibility_score REAL,
      genetic_health_risk TEXT,
      breed_compatibility TEXT,
      temperament_match TEXT,
      location_proximity TEXT,
      recommendation TEXT,
      warnings TEXT NOT NULL DEFAULT '[]',
      breeding_tips TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE messages (
      id TEXT PRIMARY KEY,
      match_id TEXT NOT NULL REFERENCES matches(id),
      sender_id TEXT NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE breeding_contracts (
      id TEXT PRIMARY KEY,
      match_id TEXT NOT NULL REFERENCES matches(id),
      owner_a_id TEXT NOT NULL REFERENCES users(id),
      owner_b_id TEXT NOT NULL REFERENCES users(id),
      stud_fee_aed REAL,
      terms TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      contract_text TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE vet_consultations (
      id TEXT PRIMARY KEY,
      pet_id TEXT NOT NULL REFERENCES pets(id),
      requested_by TEXT NOT NULL REFERENCES users(id),
      breeding_readiness TEXT,
      required_tests TEXT NOT NULL DEFAULT '[]',
      breed_specific_risks TEXT NOT NULL DEFAULT '[]',
      uae_climate_considerations TEXT NOT NULL DEFAULT '[]',
      general_advice TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

const testUser = {
  id: 'user-sarah-001',
  email: 'sarah@example.com',
  passwordHash: '$2a$10$placeholder',
  name: 'Sarah Thompson',
  phone: '+971501234567',
  emirate: 'Dubai',
  role: 'owner' as const,
  kycVerified: true,
};

const testPet = {
  id: 'pet-golden-001',
  ownerId: 'user-sarah-001',
  name: 'Luna',
  species: 'dog' as const,
  breed: 'Golden Retriever',
  age: 3,
  gender: 'female' as const,
  weight: 28,
  location: 'Dubai',
  isNeutered: false,
  healthRecords: '[]',
  photoUrls: '[]',
  status: 'active' as const,
};

describe('Database Schema', () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  it('creates all 6 tables', () => {
    const tables = db.all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ) as any[];
    const names = tables.map((t: any) => t.name).sort();
    expect(names).toEqual([
      'breeding_contracts', 'matches', 'messages', 'pets', 'users', 'vet_consultations'
    ]);
  });

  it('inserts and retrieves a user', () => {
    db.insert(schema.users).values(testUser).run();
    const result = db.select().from(schema.users).where(eq(schema.users.id, 'user-sarah-001')).get();
    expect(result?.name).toBe('Sarah Thompson');
    expect(result?.emirate).toBe('Dubai');
  });

  it('inserts a pet with FK to user', () => {
    db.insert(schema.users).values(testUser).run();
    db.insert(schema.pets).values(testPet).run();
    const pet = db.select().from(schema.pets).where(eq(schema.pets.id, 'pet-golden-001')).get();
    expect(pet?.breed).toBe('Golden Retriever');
    expect(pet?.ownerId).toBe('user-sarah-001');
  });

  it('rejects pet with invalid owner FK', () => {
    expect(() => {
      db.insert(schema.pets).values({ ...testPet, ownerId: 'nonexistent' }).run();
    }).toThrow();
  });

  it('enforces unique email', () => {
    db.insert(schema.users).values(testUser).run();
    expect(() => {
      db.insert(schema.users).values({ ...testUser, id: 'different-id' }).run();
    }).toThrow();
  });
});
