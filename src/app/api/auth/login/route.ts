import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { getUserByEmail } = await import('@/lib/db');
    const bcrypt = await import('bcryptjs');

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.is_active === 0 || user.is_active === false) {
      return NextResponse.json({ error: 'Account is disabled' }, { status: 403 });
    }


    const response = NextResponse.json({ success: true, userId: user.id });
    response.cookies.set('esgwise_session', JSON.stringify({
      userId: user.id,
      companyId: user.company_id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.is_admin === 1,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 });
  }
}
