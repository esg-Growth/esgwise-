import { auth } from '@/auth';

export interface Session {
  userId: string;
  companyId: string | null;
  email: string;
  name: string;
  role: 'platform_admin' | 'reporter' | 'company_admin' | 'company_member' | string;
  isAdmin?: boolean;
  isDemo?: boolean;
  /** Present when role === 'reporter' */
  reporterId?: string | null;
  /** The company the reporter is currently viewing/managing */
  activeCompanyId?: string | null;
}

export async function getSession(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  return {
    userId: (session.user as any).id,
    companyId: (session.user as any).companyId ?? null,
    email: session.user.email,
    name: session.user.name || 'User',
    role: (session.user as any).role || 'company_member',
    isAdmin: (session.user as any).isAdmin === true,
    reporterId: (session.user as any).reporterId ?? null,
    activeCompanyId: (session.user as any).activeCompanyId ?? null,
  };
}

export function requireSession(session: Session | null): Session {
  if (!session) throw new Error('Not authenticated');
  return session;
}
