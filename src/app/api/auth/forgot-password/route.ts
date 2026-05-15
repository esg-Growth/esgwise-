import { NextResponse } from 'next/server';
import { getUserByEmail, saveResetToken } from '@/lib/db';
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
    // Get protocol and host from request if possible, or use env var
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    
    const resetLink = `${baseUrl}/reset-password/${token}`;

    // LOG THE LINK FOR THE DEVELOPER (Since we don't have SMTP configured yet)
    console.log('-------------------------------------------');
    console.log('PASSWORD RESET REQUEST FOR:', email);
    console.log('RESET LINK:', resetLink);
    console.log('-------------------------------------------');

    // In a real app, send the email here
    // await sendEmail(email, 'Reset your password', `Click here: ${resetLink}`);

    return NextResponse.json({ 
      success: true, 
      testResetLink: resetLink // Return for testing UI since no SMTP is configured
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
