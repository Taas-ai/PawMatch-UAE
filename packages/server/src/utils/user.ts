import { PawMatchDb } from '@pawmatch/db';
import { users } from '@pawmatch/db';
import { eq, and } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { signToken } from '../middleware/auth';

/** Strip sensitive fields before sending user to client */
export function sanitizeUser(user: Record<string, any>) {
  const { passwordHash, ...safe } = user;
  return safe;
}

/**
 * Find or create a user from social login (Google/Apple).
 * Handles: lookup by provider ID, fallback by email, account linking, creation.
 */
export function findOrCreateSocialUser(
  db: PawMatchDb,
  opts: {
    provider: 'google' | 'apple';
    providerId: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
  }
) {
  const { provider, providerId, email, name, avatarUrl } = opts;

  // 1. Lookup by provider ID
  let user = db.select().from(users)
    .where(and(eq(users.authProvider, provider), eq(users.authProviderId, providerId)))
    .get();

  let isNewUser = false;

  if (!user && email) {
    // 2. Lookup by email
    user = db.select().from(users).where(eq(users.email, email)).get();

    if (user) {
      // Link social provider to existing account
      // NOTE: In production, require password verification before linking
      db.update(users)
        .set({ authProvider: provider, authProviderId: providerId, avatarUrl: avatarUrl || user.avatarUrl })
        .where(eq(users.id, user.id))
        .run();
      // Merge changes in memory instead of re-fetching
      user = { ...user, authProvider: provider, authProviderId: providerId, avatarUrl: avatarUrl || user.avatarUrl };
    }
  }

  if (!user) {
    // 3. Create new user
    const id = uuid();
    const newUser = {
      id,
      email: email || `${provider}_${providerId}@private.relay`,
      name: name || (email ? email.split('@')[0] : `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`),
      authProvider: provider,
      authProviderId: providerId,
      avatarUrl: avatarUrl || null,
    };
    db.insert(users).values(newUser).run();
    // Build user object from known values instead of re-fetching
    user = { ...newUser, passwordHash: null, phone: null, emirate: null, role: 'owner', kycVerified: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as any;
    isNewUser = true;
  }

  const token = signToken(user!.id);
  return { token, user: sanitizeUser(user!), isNewUser };
}
