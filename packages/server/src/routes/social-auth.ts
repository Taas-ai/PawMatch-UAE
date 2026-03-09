import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { eq, and } from 'drizzle-orm';
import { users, PawMatchDb } from '@pawmatch/db';
import { signToken } from '../middleware/auth';

export function socialAuthRouter(db: PawMatchDb): Router {
  const router = Router();

  /**
   * POST /api/auth/google
   * Body: { idToken: string, profile: { email, name, picture, sub } }
   *
   * In production, verify the token with Google's tokeninfo endpoint.
   * For now, accept a decoded payload for easier testing.
   */
  router.post('/google', async (req, res) => {
    try {
      const { idToken, profile } = req.body;

      if (!idToken && !profile) {
        res.status(400).json({ error: 'idToken or profile required' });
        return;
      }

      // In production: verify idToken with Google
      // const payload = await verifyGoogleToken(idToken);
      // For now, accept profile directly (client-side verification)
      const { email, name, picture, sub: googleId } = profile || {};

      if (!email || !googleId) {
        res.status(400).json({ error: 'Invalid Google profile: email and sub required' });
        return;
      }

      // Check if user exists by provider ID
      let user = db.select().from(users)
        .where(and(eq(users.authProvider, 'google'), eq(users.authProviderId, googleId)))
        .get();

      if (!user) {
        // Check by email (might have registered with email/password first)
        user = db.select().from(users).where(eq(users.email, email)).get();

        if (user) {
          // Link Google to existing account
          db.update(users)
            .set({ authProvider: 'google', authProviderId: googleId, avatarUrl: picture || user.avatarUrl })
            .where(eq(users.id, user.id))
            .run();
          // Re-fetch to get updated data
          user = db.select().from(users).where(eq(users.id, user.id)).get();
        } else {
          // Create new user
          const id = uuid();
          db.insert(users).values({
            id,
            email,
            name: name || email.split('@')[0],
            authProvider: 'google',
            authProviderId: googleId,
            avatarUrl: picture,
          }).run();
          user = db.select().from(users).where(eq(users.id, id)).get();
        }
      }

      const token = signToken(user!.id);
      const { passwordHash, ...safe } = user!;
      res.json({ token, user: safe });
    } catch (err) {
      res.status(500).json({ error: 'Google authentication failed' });
    }
  });

  /**
   * POST /api/auth/apple
   * Body: { identityToken: string, profile?: { email, name, sub } }
   *
   * Apple only sends profile on FIRST sign-in. After that, only identityToken.
   */
  router.post('/apple', async (req, res) => {
    try {
      const { identityToken, profile } = req.body;

      if (!identityToken && !profile) {
        res.status(400).json({ error: 'identityToken or profile required' });
        return;
      }

      // In production: verify identityToken with Apple's public key
      // For now, accept profile directly
      const { email, name, sub: appleId } = profile || {};

      if (!appleId) {
        res.status(400).json({ error: 'Invalid Apple profile: sub required' });
        return;
      }

      let user = db.select().from(users)
        .where(and(eq(users.authProvider, 'apple'), eq(users.authProviderId, appleId)))
        .get();

      if (!user) {
        if (email) {
          user = db.select().from(users).where(eq(users.email, email)).get();
        }

        if (user) {
          db.update(users)
            .set({ authProvider: 'apple', authProviderId: appleId })
            .where(eq(users.id, user.id))
            .run();
          user = db.select().from(users).where(eq(users.id, user.id)).get();
        } else {
          const id = uuid();
          db.insert(users).values({
            id,
            email: email || `apple_${appleId}@private.relay`,
            name: name || 'Apple User',
            authProvider: 'apple',
            authProviderId: appleId,
          }).run();
          user = db.select().from(users).where(eq(users.id, id)).get();
        }
      }

      const token = signToken(user!.id);
      const { passwordHash, ...safe } = user!;
      res.json({ token, user: safe });
    } catch (err) {
      res.status(500).json({ error: 'Apple authentication failed' });
    }
  });

  return router;
}
