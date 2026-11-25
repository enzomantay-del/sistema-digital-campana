import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { isFirebaseConfigured, requireAuth } from '@/infrastructure/firebase/config';

export interface IAuthService {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  subscribe(callback: (user: User | null) => void): () => void;
}

export class FirebaseAuthService implements IAuthService {
  async login(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(requireAuth(), email, password);
    return credential.user;
  }

  async logout(): Promise<void> {
    await signOut(requireAuth());
  }

  subscribe(callback: (user: User | null) => void): () => void {
    if (!isFirebaseConfigured()) {
      callback(null);
      return () => undefined;
    }

    return onAuthStateChanged(requireAuth(), callback);
  }
}

export const authService = new FirebaseAuthService();
