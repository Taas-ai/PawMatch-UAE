import { describe, it, expect } from 'vitest';
import * as schema from '../src/schema.js';

describe('Database Schema', () => {
  it('exports all 8 tables', () => {
    const tables = ['users', 'pets', 'matches', 'messages', 'breedingContracts',
      'vetConsultations', 'petDiagnostics', 'petDocuments'];
    for (const t of tables) {
      expect(schema).toHaveProperty(t);
    }
  });

  it('exports all enums', () => {
    const enums = ['roleEnum', 'speciesEnum', 'genderEnum', 'petStatusEnum',
      'matchStatusEnum', 'contractStatusEnum', 'urgencyLevelEnum', 'documentTypeEnum'];
    for (const e of enums) {
      expect(schema).toHaveProperty(e);
    }
  });

  it('users table has expected columns', () => {
    // pgTable exposes columns as direct properties
    expect('id' in schema.users).toBe(true);
    expect('email' in schema.users).toBe(true);
    expect('name' in schema.users).toBe(true);
    expect('role' in schema.users).toBe(true);
    expect('kycVerified' in schema.users).toBe(true);
    // Removed after Firebase migration:
    expect('passwordHash' in schema.users).toBe(false);
    expect('authProvider' in schema.users).toBe(false);
    expect('authProviderId' in schema.users).toBe(false);
  });

  it('pets table has expected columns', () => {
    expect('id' in schema.pets).toBe(true);
    expect('ownerId' in schema.pets).toBe(true);
    expect('species' in schema.pets).toBe(true);
    expect('isNeutered' in schema.pets).toBe(true);
    expect('healthRecords' in schema.pets).toBe(true);
  });

  it('roleEnum has correct values', () => {
    expect(schema.roleEnum.enumValues).toEqual(['owner', 'breeder', 'vet', 'admin']);
  });

  it('speciesEnum has correct values', () => {
    expect(schema.speciesEnum.enumValues).toEqual(['dog', 'cat']);
  });
});
