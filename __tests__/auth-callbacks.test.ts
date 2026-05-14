import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as db from '@/lib/db';

const { nextAuthConfig } = vi.hoisted(() => ({
  nextAuthConfig: { callbacks: {} as any }
}));

// Mock next-auth to intercept the config object
vi.mock('next-auth', () => ({
  default: (config: any) => {
    nextAuthConfig.callbacks = config.callbacks;
    return { handlers: {}, signIn: vi.fn(), signOut: vi.fn(), auth: vi.fn() };
  },
}));

vi.mock('next-auth/providers/credentials', () => ({ default: vi.fn() }));
vi.mock('next-auth/providers/google', () => ({ default: vi.fn() }));
vi.mock('next-auth/providers/microsoft-entra-id', () => ({ default: vi.fn() }));

// Mock database functions
vi.mock('@/lib/db', () => ({
  getUserByEmail: vi.fn(),
  createUser: vi.fn(),
}));

// We need to import auth after mocks are setup
import '@/auth';

describe('NextAuth Callbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn callback', () => {
    it('creates a new user for OAuth if they do not exist', async () => {
      vi.mocked(db.getUserByEmail).mockResolvedValueOnce(null);
      
      const result = await nextAuthConfig.callbacks.signIn({
        user: { email: 'new@google.com', name: 'New User' },
        account: { provider: 'google' }
      });

      expect(db.getUserByEmail).toHaveBeenCalledWith('new@google.com');
      expect(db.createUser).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('does not create a user if they already exist', async () => {
      vi.mocked(db.getUserByEmail).mockResolvedValueOnce({
        id: '1',
        email: 'existing@google.com',
        role: 'user',
        company_id: 'c1'
      } as any);
      
      const result = await nextAuthConfig.callbacks.signIn({
        user: { email: 'existing@google.com' },
        account: { provider: 'google' }
      });

      expect(db.createUser).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('jwt callback', () => {
    it('populates token when user is provided (e.g. initial sign in)', async () => {
      const user = { id: 'u1', companyId: 'c1', role: 'admin' };
      const token = { email: 'test@example.com' };
      
      const result = await nextAuthConfig.callbacks.jwt({ token, user });
      
      expect(result.id).toBe('u1');
      expect(result.companyId).toBe('c1');
      expect(result.role).toBe('admin');
    });

    it('refetches user from DB if user is not provided', async () => {
      const token = { email: 'test@example.com' };
      
      vi.mocked(db.getUserByEmail).mockResolvedValueOnce({
        id: 'u2',
        company_id: 'c2',
        role: 'user'
      } as any);

      const result = await nextAuthConfig.callbacks.jwt({ token });
      
      expect(db.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result.id).toBe('u2');
      expect(result.companyId).toBe('c2');
      expect(result.role).toBe('user');
    });
  });

  describe('session callback', () => {
    it('populates session user from token', async () => {
      const session = { user: { name: 'Test' } };
      const token = { id: 'u3', companyId: 'c3', role: 'manager' };

      const result = await nextAuthConfig.callbacks.session({ session, token });
      
      expect(result.user.id).toBe('u3');
      expect(result.user.companyId).toBe('c3');
      expect(result.user.role).toBe('manager');
    });
  });
});
