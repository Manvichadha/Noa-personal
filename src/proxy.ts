// src/proxy.ts — Next.js 16 route protection
import { NextRequest, NextResponse } from 'next/server';

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = req.cookies.get('ag_role')?.value;

  // ── Protect /noa/* — requires role=noa ──
  if (pathname.startsWith('/noa')) {
    if (!role) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== 'noa') {
      const url = req.nextUrl.clone();
      url.pathname = role === 'founder_team' ? '/founders/tracker' : '/login';
      return NextResponse.redirect(url);
    }
  }

  // ── Protect /founders/* — requires role=founder_team ──
  if (pathname.startsWith('/founders')) {
    if (!role) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== 'founder_team') {
      const url = req.nextUrl.clone();
      url.pathname = role === 'noa' ? '/noa/tracker' : '/login';
      return NextResponse.redirect(url);
    }
  }

  // ── Already logged in — redirect /login → dashboard ──
  if (pathname === '/login' && role) {
    const url = req.nextUrl.clone();
    url.pathname = role === 'noa' ? '/noa/tracker' : '/founders/tracker';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/noa/:path*', '/founders/:path*', '/login'],
};
