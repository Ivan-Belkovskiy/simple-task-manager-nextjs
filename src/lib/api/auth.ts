import 'server-only';
import type { app_accounts } from '@prisma/client';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/constants';
import { verifyJWT } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export type ApiUser = Omit<app_accounts, 'password_hash'>;

export async function getApiUser(request: Request): Promise<ApiUser | null> {
    let userId: string | null = null;

    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(COOKIE_NAME)?.value;
    if (cookieToken) {
        const payload = await verifyJWT(cookieToken);
        if (payload?.userId) userId = String(payload.userId);
    }

    if (!userId) {
        const auth = request.headers.get('authorization');
        if (auth?.startsWith('Bearer ')) {
            const payload = await verifyJWT(auth.slice(7));
            if (payload?.userId) userId = String(payload.userId);
        }
    }

    if (!userId) return null;

    return prisma.app_accounts.findUnique({
        where: { id: userId },
        omit: { password_hash: true },
    });
}

export function unauthorized(corsHeaders: Record<string, string>): Response {
    return Response.json(
        { success: false, error: 'Не авторизован' },
        { status: 401, headers: corsHeaders }
    );
}