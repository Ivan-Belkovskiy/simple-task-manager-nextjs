import { NextResponse } from 'next/server';
import { getApiUser, unauthorized } from '@/lib/api/auth';
import { corsHeaders, handleOptions } from '@/lib/api/cors';
import { toggleTaskItem, deleteTaskItem } from '@/app/actions/tasks/taskItems';

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
    const itemId = Number(id);
    if (isNaN(itemId)) {
        return NextResponse.json(
            { success: false, error: 'Некорректный id' },
            { status: 400, headers }
        );
    }

    try {
        const body = await request.json();
        const completed = Boolean(body?.completed);
        const result = await toggleTaskItem(itemId, completed);
        return NextResponse.json(result, { headers });
    } catch (error) {
        console.error('Ошибка обновления элемента:', error);
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
    const itemId = Number(id);
    if (isNaN(itemId)) {
        return NextResponse.json(
            { success: false, error: 'Некорректный id' },
            { status: 400, headers }
        );
    }

    try {
        const result = await deleteTaskItem(itemId);
        return NextResponse.json(result, { headers });
    } catch (error) {
        console.error('Ошибка удаления элемента:', error);
        return NextResponse.json(
            { success: false, error: 'Ошибка сервера' },
            { status: 500, headers }
        );
    }
}
