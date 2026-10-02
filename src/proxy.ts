import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { AUTH_URLS, COOKIE_NAME } from '@/lib/constants';

const protectedPaths = ['/', '/profile', '/courses', '/dashboard'];
const authPaths = ['/login', '/register'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isAuthPage = AUTH_URLS.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (isProtected) {

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    const response = NextResponse.next();
    response.headers.set('X-User-Id', payload.userId as string);
    response.headers.set('X-User-Login', payload.login as string);
    return response;
  }

  if (isAuthPage) {
    if (token) {
      const payload = await verifyJWT(token);
      if (payload) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      const response = NextResponse.next();
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/profile/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};