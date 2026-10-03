
import 'server-only';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/constants';
import { verifyJWT, type SessionPayload } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { AppAccount } from '@/types/data';

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyJWT(token);
}

export async function getCurrentUser(): Promise<AppAccount | null> {
    const session = await getSession();
    if (!session) return null;

    const user = await prisma.app_accounts.findUnique({
        where: {
            id: session.userId,
        },
        omit: {
            password_hash: true
        }
    });
    
    return user;
}