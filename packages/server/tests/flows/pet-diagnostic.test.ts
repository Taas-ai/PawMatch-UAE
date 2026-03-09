import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mockGenerate, setupGenkitMock } from '../helpers/mock-genkit';

vi.mock('../../src/genkit', () => setupGenkitMock());

import { petDiagnosticFlow } from '../../src/flows/pet-diagnostic';

const mockDiagnosticResult = {
  assessment: 'The image shows a localized area of redness and mild swelling on the left ear.',
  possibleConditions: [
    { condition: 'Otitis externa (ear infection)', likelihood: 'high' as const, severity: 'moderate' as const, description: 'Common in dogs in hot and humid climates.' },
    { condition: 'Allergic dermatitis', likelihood: 'moderate' as const, severity: 'mild' as const, description: 'Could be triggered by environmental allergens.' },
  ],
  recommendedActions: [
    'Schedule a vet appointment within 2-3 days',
    'Keep the ear clean and dry',
    'Monitor for worsening symptoms',
  ],
  urgencyLevel: 'soon' as const,
  shouldSeeVet: true,
  disclaimer: 'This is an AI-assisted preliminary assessment and NOT a veterinary diagnosis. Please consult a licensed UAE veterinarian.',
};

describe('petDiagnosticFlow', () => {
  beforeEach(() => {
    mockGenerate.mockReset();
    mockGenerate.mockResolvedValue({ output: mockDiagnosticResult });
  });

  it('returns valid diagnostic result with all required fields', async () => {
    const result = await petDiagnosticFlow({
      imageUrl: 'data:image/png;base64,abc123',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
    });

    expect(result).toBeDefined();
    expect(result.assessment).toBeTruthy();
    expect(result.possibleConditions).toBeInstanceOf(Array);
    expect(result.possibleConditions.length).toBeGreaterThan(0);
    expect(result.recommendedActions).toBeInstanceOf(Array);
    expect(result.recommendedActions.length).toBeGreaterThan(0);
    expect(result.shouldSeeVet).toBeDefined();
  });

  it('urgency level is valid enum value', async () => {
    const result = await petDiagnosticFlow({
      imageUrl: 'data:image/png;base64,abc123',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
    });

    expect(['routine', 'soon', 'urgent', 'emergency']).toContain(result.urgencyLevel);
  });

  it('disclaimer is always present', async () => {
    const result = await petDiagnosticFlow({
      imageUrl: 'data:image/png;base64,abc123',
      species: 'cat',
      breed: 'Persian',
      age: 2,
    });

    expect(result.disclaimer).toBeTruthy();
    expect(typeof result.disclaimer).toBe('string');
    expect(result.disclaimer.length).toBeGreaterThan(0);
  });

  it('handles input with symptoms text', async () => {
    const result = await petDiagnosticFlow({
      imageUrl: 'data:image/png;base64,abc123',
      symptoms: 'Scratching ear frequently, head tilting',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
    });

    expect(result).toBeDefined();
    expect(result.assessment).toBeTruthy();

    // Verify symptoms were included in prompt
    const callArgs = mockGenerate.mock.calls[0][0];
    expect(callArgs.prompt[1].text).toContain('Scratching ear frequently');
  });

  it('handles input without symptoms text', async () => {
    const result = await petDiagnosticFlow({
      imageUrl: 'data:image/png;base64,abc123',
      species: 'dog',
      breed: 'Saluki',
      age: 5,
    });

    expect(result).toBeDefined();
    expect(result.assessment).toBeTruthy();

    // Verify no symptoms fallback text in prompt
    const callArgs = mockGenerate.mock.calls[0][0];
    expect(callArgs.prompt[1].text).toContain('No symptoms described by owner.');
  });
});
