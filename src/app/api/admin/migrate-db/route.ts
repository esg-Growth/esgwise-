import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  return NextResponse.json({ error: 'Migration is disabled as the app is disconnected from all connections' }, { status: 403 });
}
