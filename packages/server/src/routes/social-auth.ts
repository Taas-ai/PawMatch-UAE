import { Router } from 'express';
import { PawMatchDb } from '@pawmatch/db';
import { findOrCreateSocialUser } from '../utils/user';

export function socialAuthRouter(db: PawMatchDb): Router {
  const router = Router();

  /**
   * POST /api/auth/google
   * Body: { idToken: string, profile: { email, name, picture, sub } }
   *
   * NOTE: In production, verify idToken with google-auth-library before trusting profile.
   */
  router.post('/google', async (req, res) => {
    try {
      const { profile } = req.body;

      if (!profile?.email || !profile?.sub) {
        res.status(400).json({ error: 'Invalid Google profile: email and sub required' });
        return;
      }

      // TODO: Production token verification
      // if (process.env.NODE_ENV === 'production') {
      //   const ticket = await googleClient.verifyIdToken({ idToken: req.body.idToken });
      //   profile = ticket.getPayload();
      // }

      const result = findOrCreateSocialUser(db, {
        provider: 'google',
        providerId: profile.sub,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.picture,
      });

      res.json(result);
    } catch (err) {
      console.error('Google auth error:', err);
      res.status(500).json({ error: 'Google authentication failed' });
    }
  });

  /**
   * POST /api/auth/apple
   * Body: { identityToken: string, profile: { sub, email?, name? } }
   * Apple only sends email/name on FIRST sign-in.
   */
  router.post('/apple', async (req, res) => {
    try {
      const { profile } = req.body;

      if (!profile?.sub) {
        res.status(400).json({ error: 'Invalid Apple profile: sub required' });
        return;
      }

      const result = findOrCreateSocialUser(db, {
        provider: 'apple',
        providerId: profile.sub,
        email: profile.email,
        name: profile.name,
      });

      res.json(result);
    } catch (err) {
      console.error('Apple auth error:', err);
      res.status(500).json({ error: 'Apple authentication failed' });
    }
  });

  return router;
}
