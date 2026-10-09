import { NextResponse } from 'next/server';
import { getApiUser, unauthorized } from '@/lib/api/auth';
import { corsHeaders, handleOptions } from '@/lib/api/cors';
import { generateTaskDetails } from '@/app/actions/ai/generateTaskDetails';

export async function OPTIONS(request: Request) {
    return handleOptions(request);
}

export async function POST(request: Request) {
    const headers = corsHeaders(request);
    const user = await getApiUser(request);
    if (!user) return unauthorized(headers);

    try {
        const body = await request.json();
        const name = String(body?.name ?? '').trim();
        const description = String(body?.description ?? '');

        const result = await generateTaskDetails(name, description);
        return NextResponse.json(result, { headers });
    } catch (error) {
        console.error('Ошибка AI-генерации:', error);
        return NextResponse.json(
            { success: false, error: 'Ошибка сервера' },
            { status: 500, headers }
        );
    }
}