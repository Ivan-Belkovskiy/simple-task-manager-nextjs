import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { COOKIE_NAME } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { createSession, SESSION_EXPIRATION } from '@/lib/auth/session-management';
import { corsHeaders, handleOptions } from '@/lib/api/cors';

export async function OPTIONS(request: Request) {
    return handleOptions(request);
}

export async function POST(request: Request) {
    const headers = corsHeaders(request);

    try {
        const body = await request.json();
        const login = String(body?.login ?? '').trim();
        const password = String(body?.password ?? '');

        if (!login || !password) {
            return NextResponse.json(
                { success: false, error: 'Заполните все поля' },
                { status: 400, headers }
            );
        }

        const user = await prisma.app_accounts.findUnique({ where: { login } });
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Неверный логин или пароль' },
                { status: 401, headers }
            );
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return NextResponse.json(
                { success: false, error: 'Неверный логин или пароль' },
                { status: 401, headers }
            );
        }

        const session = await createSession({
            userId: user.id,
            login: user.login,
            accessLevel: user.access_level,
            userAgent: request.headers.get('user-agent'),
            ip: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        });

        const response = NextResponse.json(
            {
                success: true,
                token: session.token,
                expiresIn: session.expiresIn,
                user: {
                    id: user.id,
                    username: user.username,
                    login: user.login,
                    email: user.email,
                    access_level: user.access_level,
                },
            },
            { headers }
        );

        response.cookies.set(COOKIE_NAME, session.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: SESSION_EXPIRATION,
            path: '/',
            sameSite: 'lax',
        });

        return response;
    } catch (error) {
        console.error('Ошибка логина:', error);
        return NextResponse.json(
            { success: false, error: 'Что-то пошло не так' },
            { status: 500, headers }
        );
    }
}