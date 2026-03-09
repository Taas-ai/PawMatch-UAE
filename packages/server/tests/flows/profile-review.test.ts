import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mockGenerate, setupGenkitMock } from '../helpers/mock-genkit';

vi.mock('../../src/genkit', () => setupGenkitMock());

import { profileReviewFlow } from '../../src/flows/profile-review';

const completeProfile = {
  name: 'Sultan',
  species: 'dog' as const,
  breed: 'Golden Retriever',
  age: 3,
  gender: 'male' as const,
  weight: 32,
  location: 'Dubai',
  healthRecords: ['Vaccinated', 'Dewormed', 'Hip scored: Excellent'],
  dnaTestResults: 'Clear of 230+ genetic conditions',
  temperament: 'Friendly, calm, excellent with children',
  pedigree: 'AKC Champion bloodline, 3 generations documented',
  isNeutered: false,
};

const incompleteProfile = {
  name: 'Dog1',
  species: 'dog' as const,
  breed: 'Husky',
  age: 1,
  gender: 'male' as const,
  weight: 20,
  location: 'Dubai',
  isNeutered: false,
};

describe('profileReviewFlow', () => {
  beforeEach(() => {
    mockGenerate.mockReset();
  });

  it('reviews complete profile with high quality score', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        qualityScore: 92,
        completeness: 95,
        trustScore: 88,
        issues: [],
        suggestedImprovements: ['Add a video of the pet'],
        fraudRiskIndicators: [],
        readyForListing: true,
      },
    });

    const result = await profileReviewFlow({
      profile: completeProfile,
      photoCount: 5,
      hasVerifiedOwner: true,
      accountAge: 180,
    });

    expect(result.qualityScore).toBeGreaterThanOrEqual(80);
    expect(result.completeness).toBeGreaterThanOrEqual(80);
    expect(result.trustScore).toBeGreaterThanOrEqual(80);
    expect(result.issues).toHaveLength(0);
    expect(result.readyForListing).toBe(true);
    expect(result.fraudRiskIndicators).toHaveLength(0);
  });

  it('flags issues for incomplete profile', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        qualityScore: 35,
        completeness: 40,
        trustScore: 30,
        issues: [
          { field: 'healthRecords', severity: 'critical', message: 'No health records provided' },
          { field: 'temperament', severity: 'warning', message: 'Temperament description missing' },
          { field: 'pedigree', severity: 'suggestion', message: 'Adding pedigree info improves trust' },
        ],
        suggestedImprovements: [
          'Add health records and vaccination history',
          'Upload at least 3 photos',
          'Add temperament description',
          'Verify ownership through KYC',
        ],
        fraudRiskIndicators: [],
        readyForListing: false,
      },
    });

    const result = await profileReviewFlow({
      profile: incompleteProfile,
      photoCount: 0,
      hasVerifiedOwner: false,
      accountAge: 2,
    });

    expect(result.qualityScore).toBeLessThan(50);
    expect(result.completeness).toBeLessThan(50);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.readyForListing).toBe(false);
    expect(result.suggestedImprovements.length).toBeGreaterThan(0);

    // Check issue severity levels are valid
    for (const issue of result.issues) {
      expect(['critical', 'warning', 'suggestion']).toContain(issue.severity);
    }
  });

  it('returns fraud indicators for suspicious profiles', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        qualityScore: 60,
        completeness: 70,
        trustScore: 15,
        issues: [
          { field: 'breed', severity: 'critical', message: 'Premium breed listed by brand new account' },
        ],
        suggestedImprovements: ['Complete identity verification'],
        fraudRiskIndicators: [
          'New account (2 days) listing premium breed',
          'No owner verification',
          'Weight inconsistent with breed standard for Husky at 1 year',
        ],
        readyForListing: false,
      },
    });

    const result = await profileReviewFlow({
      profile: incompleteProfile,
      photoCount: 1,
      hasVerifiedOwner: false,
      accountAge: 2,
    });

    expect(result.trustScore).toBeLessThan(30);
    expect(result.fraudRiskIndicators.length).toBeGreaterThan(0);
    expect(result.readyForListing).toBe(false);
  });
});
