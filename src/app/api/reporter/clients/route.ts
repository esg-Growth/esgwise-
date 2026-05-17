import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createClientCompany, getReporterClients } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (session.role !== 'reporter' && !session.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const clients = await getReporterClients(session.reporterId || session.userId);
    return NextResponse.json({ clients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (session.role !== 'reporter' && !session.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, name_ar, sector, country, size, data_mode } = body;

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const reporterId = session.reporterId || session.userId;
    const company = await createClientCompany(
      reporterId,
      name,
      sector || 'other',
      data_mode || 'reporter_managed',
      { size: size || 'small', country: country || 'Jordan' },
    );

    return NextResponse.json({ company }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
