// src/middleware.ts — Next.js Route Protection
import { NextRequest } from 'next/server';
import proxy from './proxy';

export default function middleware(req: NextRequest) {
  return proxy(req);
}

export const config = {
  matcher: ['/noa/:path*', '/founders/:path*', '/login'],
};
