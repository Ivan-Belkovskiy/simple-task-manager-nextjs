import { NextResponse } from 'next/server';
import { getApiUser, unauthorized } from '@/lib/api/auth';
import { corsHeaders, handleOptions } from '@/lib/api/cors';
import { toggleSubtask, deleteSubtask } from '@/app/actions/tasks/subtasks';

export async function OPTIONS(request: Request) {
    return handleOptions(request);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const headers = corsHeaders(request);
    const user = await getApiUser(request);
    if (!user) return unauthorized(headers);

    const { id } = await params;
    const subtaskId = Number(id);
    if (isNaN(subtaskId)) {
        return NextResponse.json(
            { success: false, error: 'Некорректный id' },
            { status: 400, headers }
        );
    }

    try {
        const body = await request.json();
        const completed = Boolean(body?.completed);
        const result = await toggleSubtask(subtaskId, completed);
        return NextResponse.json(result, { headers });
    } catch (error) {
        console.error('Ошибка обновления подзадачи:', error);
        return NextResponse.json(
            { success: false, error: 'Ошибка сервера' },
            { status: 500, headers }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const headers = corsHeaders(request);
    const user = await getApiUser(request);
    if (!user) return unauthorized(headers);

    const { id } = await params;
    const subtaskId = Number(id);
    if (isNaN(subtaskId)) {
        return NextResponse.json(
            { success: false, error: 'Некорректный id' },
            { status: 400, headers }
        );
    }

    try {
        const result = await deleteSubtask(subtaskId);
        return NextResponse.json(result, { headers });
    } catch (error) {
        console.error('Ошибка удаления подзадачи:', error);
        return NextResponse.json(
            { success: false, error: 'Ошибка сервера' },
            { status: 500, headers }
        );
    }
}