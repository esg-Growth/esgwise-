import { NextResponse } from 'next/server';
import { getUserByEmail, saveResetToken } from '@/lib/db-cloud';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      // For security reasons, don't reveal if a user exists
      return NextResponse.json({ success: true });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    await saveResetToken(email, token);

    // Construct the reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://esgwise-6d39e.web.app'}/reset-password/${token}`;

    // LOG THE LINK FOR THE DEVELOPER (Since we don't have SMTP configured yet)
    console.log('-------------------------------------------');
    console.log('PASSWORD RESET REQUEST FOR:', email);
    console.log('RESET LINK:', resetLink);
    console.log('-------------------------------------------');

    // In a real app, send the email here
    // await sendEmail(email, 'Reset your password', `Click here: ${resetLink}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
