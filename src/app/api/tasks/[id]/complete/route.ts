import { NextResponse } from 'next/server';
import { getApiUser, unauthorized } from '@/lib/api/auth';
import { corsHeaders, handleOptions } from '@/lib/api/cors';
import { completeTask } from '@/app/actions';

export async function OPTIONS(request: Request) {
    return handleOptions(request);
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const headers = corsHeaders(request);
    const user = await getApiUser(request);
    if (!user) return unauthorized(headers);

    const { id } = await params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
        return NextResponse.json(
            { success: false, error: 'Некорректный id' },
            { status: 400, headers }
        );
    }

    try {
        const body = await request.json().catch(() => ({}));
        const info = typeof body?.info === 'string' ? body.info : undefined;
        const result = await completeTask(taskId, info);
        return NextResponse.json(result, { headers });
    } catch (error) {
        console.error('Ошибка завершения задачи:', error);
        return NextResponse.json(
            { success: false, error: 'Ошибка сервера' },
            { status: 500, headers }
        );
    }
}