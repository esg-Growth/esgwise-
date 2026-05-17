import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createInvitation } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (session.role !== 'reporter' && !session.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { companyId, email } = await request.json();
    if (!companyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    const invitation = await createInvitation(
      companyId,
      email || '',
      'company_admin',
      session.reporterId || session.userId,
    );
    const baseUrl = process.env.NEXTAUTH_URL || 'https://esgwise.app';
    const link = `${baseUrl}/invite/${invitation.token}`;

    return NextResponse.json({ link, token: invitation.token });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
