
import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
if (!secret.length) {
    throw new Error('JWT_SECRET не задан в переменных окружения!');
}

export interface SessionPayload extends JWTPayload {
    userId: string;
    login: string;
    accessLevel: 'USER' | 'ADMIN';
    sessionId: string;
}

export async function signJWT(
    payload: Omit<SessionPayload, keyof JWTPayload>,
    expiresIn = '7d',
): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secret);
}

export async function verifyJWT(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify<SessionPayload>(token, secret);
        return payload;
    } catch {
        return null;
    }
}