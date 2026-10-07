import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { AUTH_URLS, COOKIE_NAME, PROTECTED_URLS } from '@/lib/constants';

function matchesPath(pathname: string, paths: string[]): boolean {
    return paths.some(p => pathname === p || pathname.startsWith(p + '/'));
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(COOKIE_NAME)?.value;

    const isProtected = matchesPath(pathname, PROTECTED_URLS);
    const isAuthPage = matchesPath(pathname, AUTH_URLS);

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

        const requestHeaders = new Headers(request.headers);
        requestHeaders.delete('X-User-Id');
        requestHeaders.delete('X-User-Login');
        requestHeaders.set('X-User-Id', String(payload.userId));
        requestHeaders.set('X-User-Login', payload.login);

        return NextResponse.next({
            request: { headers: requestHeaders },
        });
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
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};