import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/constants';
import { verifyJWT } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { corsHeaders, handleOptions } from '@/lib/api/cors';

export async function OPTIONS(request: Request) {
    return handleOptions(request);
}

export async function POST(request: Request) {
    const headers = corsHeaders(request);

    try {
        const cookieStore = await cookies();
        const auth = request.headers.get('authorization');

        const token = auth?.startsWith('Bearer ')
            ? auth.slice(7)
            : cookieStore.get(COOKIE_NAME)?.value;

        if (token) {
            const payload = await verifyJWT(token);
            if (payload?.sessionId) {
                await prisma.sessions
                    .deleteMany({ where: { id: payload.sessionId } })
                    .catch(err => console.error('Ошибка удаления сессии:', err));
            }
        }

        const response = NextResponse.json({ success: true }, { headers });
        response.cookies.delete(COOKIE_NAME);
        return response;
    } catch (error) {
        console.error('Ошибка выхода:', error);
        return NextResponse.json(
            { success: false, error: 'Что-то пошло не так' },
            { status: 500, headers }
        );
    }
}