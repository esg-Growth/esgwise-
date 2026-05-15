import { auth } from '@/auth';

export interface Session {
  userId: string;
  companyId: string;
  email: string;
  name: string;
  role: string;
  isAdmin?: boolean;
  isDemo?: boolean;
}

export async function getSession(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  return {
    userId: (session.user as any).id,
    companyId: (session.user as any).companyId,
    email: session.user.email,
    name: session.user.name || 'User',
    role: (session.user as any).role || 'member',
    isAdmin: (session.user as any).isAdmin === true,
  };
}

export function requireSession(session: Session | null): Session {
  if (!session) throw new Error('Not authenticated');
  return session;
}
