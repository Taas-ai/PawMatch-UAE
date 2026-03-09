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

import { vetAdvisorFlow } from '../../src/flows/vet-advisor';

const mockVetResult = {
  breedingReadiness: 'ready' as const,
  requiredTests: [
    { test: 'Hip & Elbow Scoring (OFA)', reason: 'Golden Retrievers prone to hip dysplasia', estimatedCostAED: '800-1,200' },
    { test: 'Cardiac Exam (OFA)', reason: 'Breed predisposition to subvalvular aortic stenosis', estimatedCostAED: '500-800' },
    { test: 'Eye Certification (CERF)', reason: 'Screen for progressive retinal atrophy', estimatedCostAED: '300-500' },
    { test: 'Brucellosis Test', reason: 'Required pre-breeding infectious disease screening', estimatedCostAED: '200-350' },
  ],
  optimalBreedingWindow: 'October to March (cooler UAE months) - next heat cycle expected around November 2026',
  breedSpecificRisks: [
    'Hip and elbow dysplasia',
    'Progressive retinal atrophy',
    'Subvalvular aortic stenosis',
    'Obesity risk affecting whelping',
  ],
  uaeClimateConsiderations: [
    'Avoid breeding during summer months (June-September) due to heat stress',
    'Ensure air-conditioned whelping area',
    'Pregnant females need extra hydration in UAE climate',
    'Limit outdoor exercise during pregnancy in hot weather',
  ],
  recommendedVetVisitBefore: true,
  generalAdvice: 'Sultan is in good breeding age and health. Ensure all genetic tests are completed at least 2 weeks before planned breeding. Consult a licensed UAE veterinarian at a registered clinic.',
};

describe('vetAdvisorFlow', () => {
  beforeEach(() => {
    mockGenerate.mockReset();
    mockGenerate.mockResolvedValue({ output: mockVetResult });
  });

  it('returns breeding readiness assessment', async () => {
    const result = await vetAdvisorFlow({
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'female',
      weight: 27,
      healthHistory: ['Vaccinated', 'Dewormed'],
      previousLitters: 0,
    });

    expect(result).toBeDefined();
    expect(['ready', 'not yet', 'consult vet first', 'not recommended']).toContain(result.breedingReadiness);
    expect(result.breedingReadiness).toBe('ready');
    expect(result.generalAdvice).toBeTruthy();
    expect(result.recommendedVetVisitBefore).toBe(true);
  });

  it('includes required tests with AED costs', async () => {
    const result = await vetAdvisorFlow({
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'female',
      weight: 27,
    });

    expect(result.requiredTests).toBeInstanceOf(Array);
    expect(result.requiredTests.length).toBeGreaterThan(0);

    for (const test of result.requiredTests) {
      expect(test.test).toEqual(expect.any(String));
      expect(test.reason).toEqual(expect.any(String));
      expect(test.estimatedCostAED).toBeTruthy();
    }
  });

  it('includes breed-specific risks and UAE climate considerations', async () => {
    const result = await vetAdvisorFlow({
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'female',
      weight: 27,
    });

    expect(result.breedSpecificRisks).toBeInstanceOf(Array);
    expect(result.breedSpecificRisks.length).toBeGreaterThan(0);
    expect(result.uaeClimateConsiderations).toBeInstanceOf(Array);
    expect(result.uaeClimateConsiderations.length).toBeGreaterThan(0);
  });

  it('handles optional question field', async () => {
    const resultWithAnswer = {
      ...mockVetResult,
      answerToQuestion: 'For a Golden Retriever, the ideal first breeding age is between 2-3 years, after all health screenings are complete.',
    };
    mockGenerate.mockResolvedValue({ output: resultWithAnswer });

    const result = await vetAdvisorFlow({
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'female',
      weight: 27,
      question: 'What is the ideal age for first breeding?',
    });

    expect(result.answerToQuestion).toBeDefined();
    expect(result.answerToQuestion).toContain('breeding');

    // Verify question was included in prompt
    const callArgs = mockGenerate.mock.calls[0][0];
    expect(callArgs.prompt).toContain('ideal age for first breeding');
  });

  it('works with cat species', async () => {
    const catResult = {
      ...mockVetResult,
      breedingReadiness: 'consult vet first' as const,
      breedSpecificRisks: ['Polycystic kidney disease (PKD)', 'Hypertrophic cardiomyopathy'],
      generalAdvice: 'Persian cats require PKD screening before breeding. Consult a UAE-licensed veterinarian.',
    };
    mockGenerate.mockResolvedValue({ output: catResult });

    const result = await vetAdvisorFlow({
      species: 'cat',
      breed: 'Persian',
      age: 2,
      gender: 'female',
      weight: 4,
    });

    expect(result.breedingReadiness).toBe('consult vet first');
    expect(result.breedSpecificRisks).toContain('Polycystic kidney disease (PKD)');
  });
});
