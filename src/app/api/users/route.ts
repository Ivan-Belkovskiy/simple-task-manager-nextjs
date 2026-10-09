import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser, unauthorized } from '@/lib/api/auth';
import { corsHeaders, handleOptions } from '@/lib/api/cors';
import { createUser } from '@/app/actions';

export async function OPTIONS(request: Request) {
    return handleOptions(request);
}

export async function GET(request: Request) {
    const headers = corsHeaders(request);
    const user = await getApiUser(request);
    if (!user) return unauthorized(headers);

    const users = await prisma.users.findMany({
        where: { account_id: user.id },
        orderBy: { id: 'asc' },
    });

    return NextResponse.json({ success: true, users }, { headers });
}

export async function POST(request: Request) {
    const headers = corsHeaders(request);
    const user = await getApiUser(request);
    if (!user) return unauthorized(headers);

    try {
        const body = await request.json();
        const name = String(body?.name ?? '').trim();
        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Введите имя' },
                { status: 400, headers }
            );
        }
        const result = await createUser(name);
        return NextResponse.json(result, { headers });
    } catch (error) {
        console.error('Ошибка создания пользователя:', error);
        return NextResponse.json(
            { success: false, error: 'Ошибка сервера' },
            { status: 500, headers }
        );
    }
}