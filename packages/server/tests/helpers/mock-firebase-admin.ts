import { vi } from 'vitest';

/**
 * Global mock for firebase-admin.
 * Tokens of the form "uid:<userId>" are accepted and return { uid: userId }.
 * All other tokens throw an error (simulating invalid token).
 *
 * Usage: add to vitest.config.ts setupFiles, or call vi.mock at top of test file.
 */
vi.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: vi.fn(),
  auth: vi.fn().mockReturnValue({
    verifyIdToken: vi.fn().mockImplementation(async (token: string) => {
      if (token.startsWith('uid:')) {
        return { uid: token.slice(4) };
      }
      throw new Error('Invalid token');
    }),
  }),
}));
