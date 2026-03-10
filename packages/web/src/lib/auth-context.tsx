import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';
import { api } from './api';

interface User {
  id: string;
  email: string;
  name: string;
  emirate: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string, emirate: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const profile = await api.auth.me();
          setUser(profile as unknown as User);
        } catch {
          // User exists in Firebase but not yet synced to DB
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function syncAfterSignIn(fbUser: FirebaseUser, name?: string, emirate?: string) {
    const synced = await api.auth.sync({
      email: fbUser.email!,
      name: name || fbUser.displayName || fbUser.email!.split('@')[0],
      emirate,
    });
    setUser(synced as unknown as User);
  }

  const loginWithEmail = async (email: string, password: string) => {
    const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);
    await syncAfterSignIn(fbUser);
  };

  const registerWithEmail = async (email: string, password: string, name: string, emirate: string) => {
    const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
    await syncAfterSignIn(fbUser, name, emirate);
  };

  const loginWithGoogle = async () => {
    const { user: fbUser } = await signInWithPopup(auth, new GoogleAuthProvider());
    await syncAfterSignIn(fbUser);
  };

  const loginWithApple = async () => {
    const { user: fbUser } = await signInWithPopup(auth, new OAuthProvider('apple.com'));
    await syncAfterSignIn(fbUser);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, loginWithEmail, registerWithEmail, loginWithGoogle, loginWithApple, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
