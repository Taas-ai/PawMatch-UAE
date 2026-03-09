import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mockGenerate, setupGenkitMock } from '../helpers/mock-genkit';

vi.mock('../../src/genkit', () => setupGenkitMock());

import { breedDetectFlow } from '../../src/flows/breed-detect';

const mockBreedResult = {
  primaryBreed: 'Saluki',
  confidence: 92,
  secondaryBreed: undefined,
  species: 'dog' as const,
  estimatedAge: '2-3 years',
  colorPattern: 'Cream and white',
  sizeCategory: 'large' as const,
  breedCharacteristics: [
    'Slender and graceful build',
    'Long silky ears',
    'Deep chest for endurance',
    'Independent yet loyal temperament',
  ],
  uaePopularity: 'very popular' as const,
  heatToleranceRating: 'excellent' as const,
  averagePrice: 'AED 5,000 - 15,000',
};

describe('breedDetectFlow', () => {
  beforeEach(() => {
    mockGenerate.mockReset();
    mockGenerate.mockResolvedValue({ output: mockBreedResult });
  });

  it('detects breed from image URL input', async () => {
    const result = await breedDetectFlow({ imageUrl: 'https://example.com/saluki.jpg' });

    expect(result).toBeDefined();
    expect(result.primaryBreed).toBe('Saluki');
    expect(result.confidence).toBe(92);
    expect(result.species).toBe('dog');

    // Verify the prompt used media format for image input
    const callArgs = mockGenerate.mock.calls[0][0];
    expect(callArgs.prompt).toBeInstanceOf(Array);
    expect(callArgs.prompt[0]).toHaveProperty('media');
  });

  it('detects breed from text description input', async () => {
    const result = await breedDetectFlow({
      description: 'A slender, graceful dog with long silky ears and a cream coat',
    });

    expect(result).toBeDefined();
    expect(result.primaryBreed).toBe('Saluki');

    // Verify the prompt used string format for description input
    const callArgs = mockGenerate.mock.calls[0][0];
    expect(typeof callArgs.prompt).toBe('string');
    expect(callArgs.prompt).toContain('slender, graceful');
  });

  it('output matches expected schema fields', async () => {
    const result = await breedDetectFlow({ imageUrl: 'https://example.com/dog.jpg' });

    expect(result.primaryBreed).toEqual(expect.any(String));
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
    expect(['dog', 'cat', 'unknown']).toContain(result.species);
    expect(result.colorPattern).toEqual(expect.any(String));
    expect(['toy', 'small', 'medium', 'large', 'giant', 'unknown']).toContain(result.sizeCategory);
    expect(result.breedCharacteristics).toBeInstanceOf(Array);
    expect(['very popular', 'popular', 'moderate', 'rare']).toContain(result.uaePopularity);
    expect(['excellent', 'good', 'fair', 'poor']).toContain(result.heatToleranceRating);
    expect(result.averagePrice).toContain('AED');
  });
});
