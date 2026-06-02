// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Hardcoded credentials — swap for DB lookup when proper auth is added
const USERS: Record<string, { password: string; role: string; redirect: string }> = {
  noa: {
    password: 'noa2026',
    role: 'noa',
    redirect: '/noa/tracker',
  },
  founders: {
    password: 'founders2026',
    role: 'founder_team',
    redirect: '/founders/tracker',
  },
};

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const user = USERS[username.toLowerCase().trim()];

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please check your username and password.' },
        { status: 401 }
      );
    }

    // Set role cookie — httpOnly so JS can't tamper with it
    const res = NextResponse.json({
      success: true,
      role: user.role,
      redirect: user.redirect,
    });

    res.cookies.set('ag_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return res;
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
