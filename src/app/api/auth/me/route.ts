import { NextResponse } from 'next/server';
import { getApiUser, unauthorized } from '@/lib/api/auth';
import { corsHeaders, handleOptions } from '@/lib/api/cors';

export async function OPTIONS(request: Request) {
    return handleOptions(request);
}

export async function GET(request: Request) {
    const headers = corsHeaders(request);
    const user = await getApiUser(request);

    if (!user) return unauthorized(headers);

    return NextResponse.json(
        {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                login: user.login,
                email: user.email,
                telegram_id: user.telegram_id,
                access_level: user.access_level,
                created_at: user.created_at,
            },
        },
        { headers }
    );
}