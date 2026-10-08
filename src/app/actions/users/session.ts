// lib/session.ts
import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME } from '@/lib/constants';
import { verifyJWT, type SessionPayload } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { app_accounts } from '@prisma/client';

// export type PublicUser = {
//     id: string;
//     username: string;
//     login: string;
// };

export type PublicUser = Omit<app_accounts, 'password_hash'>;

export const getSession = cache(async (): Promise<SessionPayload | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload) return null;
    return payload;
});

export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
    const session = await getSession();
    if (!session) return null;

    const user = await prisma.app_accounts.findUnique({
        where: { id: session.userId },
        omit: {
            password_hash: true
        }
        // select: {
        //     id: true,
        //     username: true,
        //     login: true,
        //     // email: true,
        //     // access_level: true,
        // },
    });

    return user;
});

export async function requireUser(): Promise<PublicUser> {
    const user = await getCurrentUser();
    if (!user) redirect('/login');
    return user;
}