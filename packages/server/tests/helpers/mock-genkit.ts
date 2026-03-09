import { vi } from 'vitest';

/**
 * Shared mock for Genkit AI module.
 * Must be called via vi.mock at the top of each test file.
 *
 * Usage:
 *   import { mockGenerate, setupGenkitMock } from '../helpers/mock-genkit';
 *   vi.mock('../../src/genkit', () => setupGenkitMock());
 */
export const mockGenerate = vi.fn();

export function setupGenkitMock() {
  return {
    ai: {
      defineFlow: vi.fn((_config: any, handler: Function) => {
        return async (input: any) => handler(input);
      }),
      generate: mockGenerate,
    },
    PetProfileSchema: {} as any,
    MatchResultSchema: {} as any,
  };
}
