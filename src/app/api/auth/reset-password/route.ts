import { NextResponse } from 'next/server';
import { verifyResetToken, getUserByEmail, updateUserPassword, invalidateResetToken } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

  const email = await verifyResetToken(token);
  if (!email) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });

  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    const email = await verifyResetToken(token);
    if (!email) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await updateUserPassword(user.id, passwordHash);

    await invalidateResetToken(token);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
