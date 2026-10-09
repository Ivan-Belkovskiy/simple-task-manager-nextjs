import 'server-only';
import { signJWT } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

const SESSION_EXPIRATION = 7 * 24 * 60 * 60;

export interface CreateSessionOptions {
    userId: string;
    login: string;
    accessLevel: 'USER' | 'MANAGER';
    userAgent?: string | null;
    ip?: string | null;
}

export interface CreatedSession {
    token: string;
    sessionId: string;
    expiresIn: number;
}

export async function createSession(opts: CreateSessionOptions): Promise<CreatedSession> {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRATION * 1000);

    await prisma.sessions.create({
        data: {
            id: sessionId,
            user_id: opts.userId,
            refresh_hash: '',
            user_agent: opts.userAgent ?? null,
            ip: opts.ip ?? null,
            expires_at: expiresAt,
        },
    });

    const token = await signJWT({
        userId: opts.userId,
        login: opts.login,
        accessLevel: opts.accessLevel,
        sessionId,
    });

    return { token, sessionId, expiresIn: SESSION_EXPIRATION };
}

export { SESSION_EXPIRATION };