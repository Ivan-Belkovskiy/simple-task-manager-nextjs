import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser, unauthorized } from '@/lib/api/auth';
import { corsHeaders, handleOptions } from '@/lib/api/cors';
import { updateTask, deleteTask } from '@/app/actions';

export async function OPTIONS(request: Request) {
    return handleOptions(request);
}

export async function GET(
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
        const task = await prisma.tasks.findFirst({
            where: { id: taskId, account_id: user.id },
            include: {
                category: true,
                priority: true,
                task_users: { include: { users: true } },
                task_notifications: { orderBy: { hour_offset: 'desc' } },
                subtasks: { orderBy: { order: 'asc' } },
                items: { orderBy: [{ kind: 'asc' }, { order: 'asc' }] },
            },
        });

        if (!task) {
            return NextResponse.json(
                { success: false, error: 'Задача не найдена' },
                { status: 404, headers }
            );
        }

        return NextResponse.json({ success: true, task }, { headers });
    } catch (error) {
        console.error('Ошибка получения задачи:', error);
        return NextResponse.json(
            { success: false, error: 'Ошибка сервера' },
            { status: 500, headers }
        );
    }
}

export async function PATCH(
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
        const body = await request.json();
        const result = await updateTask(taskId, body);
        return NextResponse.json(result, { headers });
    } catch (error) {
        console.error('Ошибка обновления задачи:', error);
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
    const taskId = Number(id);

    if (isNaN(taskId)) {
        return NextResponse.json(
            { success: false, error: 'Некорректный id' },
            { status: 400, headers }
        );
    }

    try {
        const result = await deleteTask(taskId);
        return NextResponse.json(result, { headers });
    } catch (error) {
        console.error('Ошибка удаления задачи:', error);
        return NextResponse.json(
            { success: false, error: 'Ошибка сервера' },
            { status: 500, headers }
        );
    }
}