import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockGenerate } = vi.hoisted(() => ({
  mockGenerate: vi.fn(),
}));

vi.mock('../../src/genkit', async () => {
  const actual = await vi.importActual<any>('../../src/genkit');
  return {
    ...actual,
    ai: {
      defineFlow: vi.fn((_config: any, handler: any) => {
        return async (input: any) => handler(input);
      }),
      generate: mockGenerate,
    },
  };
});

// Import AFTER mock is set up (vi.mock is hoisted)
import { petMatchFlow } from '../../src/flows/pet-match';

const samplePetA = {
  name: 'Sultan',
  species: 'dog' as const,
  breed: 'Golden Retriever',
  age: 3,
  gender: 'male' as const,
  weight: 32,
  location: 'Dubai',
  healthRecords: ['Vaccinated', 'Dewormed'],
  temperament: 'Friendly, energetic',
  isNeutered: false,
};

const samplePetB = {
  name: 'Layla',
  species: 'dog' as const,
  breed: 'Golden Retriever',
  age: 2,
  gender: 'female' as const,
  weight: 27,
  location: 'Abu Dhabi',
  healthRecords: ['Vaccinated', 'Hip scored'],
  temperament: 'Calm, obedient',
  isNeutered: false,
};

const mockMatchResult = {
  compatibilityScore: 87,
  geneticHealthRisk: 'low' as const,
  breedCompatibility: 'excellent' as const,
  temperamentMatch: 'good' as const,
  locationProximity: 'Dubai to Abu Dhabi - approximately 1.5 hours drive',
  recommendation: 'Sultan and Layla are an excellent breeding match. Same breed with complementary temperaments and good health records.',
  warnings: ['Ensure both have current hip and elbow scores before proceeding'],
  breedingTips: [
    'Schedule breeding during cooler months (October-March) due to UAE climate',
    'Both parents should have OFA hip certification',
    'Consider progesterone testing for optimal timing',
  ],
};

describe('petMatchFlow', () => {
  beforeEach(() => {
    mockGenerate.mockReset();
    mockGenerate.mockResolvedValue({ output: mockMatchResult });
  });

  it('returns a valid match result with correct schema fields', async () => {
    const result = await petMatchFlow({ petA: samplePetA, petB: samplePetB });

    expect(result).toBeDefined();
    expect(result.compatibilityScore).toBe(87);
    expect(result.geneticHealthRisk).toBe('low');
    expect(result.breedCompatibility).toBe('excellent');
    expect(result.temperamentMatch).toBe('good');
    expect(result.locationProximity).toContain('Dubai');
    expect(result.recommendation).toBeTruthy();
    expect(result.warnings).toBeInstanceOf(Array);
    expect(result.breedingTips).toBeInstanceOf(Array);
  });

  it('compatibility score is within 0-100 range', async () => {
    const result = await petMatchFlow({ petA: samplePetA, petB: samplePetB });
    expect(result.compatibilityScore).toBeGreaterThanOrEqual(0);
    expect(result.compatibilityScore).toBeLessThanOrEqual(100);
  });

  it('all enum fields have valid values', async () => {
    const result = await petMatchFlow({ petA: samplePetA, petB: samplePetB });

    expect(['low', 'medium', 'high']).toContain(result.geneticHealthRisk);
    expect(['excellent', 'good', 'fair', 'poor']).toContain(result.breedCompatibility);
    expect(['excellent', 'good', 'fair', 'poor']).toContain(result.temperamentMatch);
  });

  it('passes both pet profiles to ai.generate', async () => {
    await petMatchFlow({ petA: samplePetA, petB: samplePetB });

    expect(mockGenerate).toHaveBeenCalledOnce();
    const callArgs = mockGenerate.mock.calls[0][0];
    expect(callArgs.prompt).toContain('Sultan');
    expect(callArgs.prompt).toContain('Layla');
    expect(callArgs.output).toBeDefined();
  });
});
