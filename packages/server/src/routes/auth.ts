import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';
import { users, PawMatchDb } from '@pawmatch/db';
import { signToken, requireAuth, AuthRequest } from '../middleware/auth';
import { sanitizeUser } from '../utils/user';

export function authRouter(db: PawMatchDb): Router {
  const router = Router();

  router.post('/register', async (req, res) => {
    try {
      const { email, password, name, emirate, phone } = req.body;
      if (!email || !password || !name) {
        res.status(400).json({ error: 'email, password, and name are required' });
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }

      // Password strength
      if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
      }

      const existing = db.select().from(users).where(eq(users.email, email)).get();
      if (existing) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }
      const id = uuid();
      const passwordHash = await bcrypt.hash(password, 10);
      db.insert(users).values({ id, email, passwordHash, name, emirate, phone }).run();
      const token = signToken(id);
      res.status(201).json({ token, user: { id, email, name, emirate } });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
      }
      const user = db.select().from(users).where(eq(users.email, email)).get();
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      if (!user.passwordHash) {
        res.status(400).json({ error: 'This account uses social login. Please sign in with Google or Apple.' });
        return;
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      const token = signToken(user.id);
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, emirate: user.emirate } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  router.get('/me', requireAuth, (req: AuthRequest, res) => {
    const user = db.select().from(users).where(eq(users.id, req.userId!)).get();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(sanitizeUser(user));
  });

  return router;
}
