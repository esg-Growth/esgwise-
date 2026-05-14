import { cookies } from 'next/headers';

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
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('esgwise_session')?.value;
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function requireSession(session: Session | null): Session {
  if (!session) throw new Error('Not authenticated');
  return session;
}
