import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiUser, unauthorized } from '@/lib/api/auth';
import { corsHeaders, handleOptions } from '@/lib/api/cors';
import { createTask } from '@/app/actions';

export async function OPTIONS(request: Request) {
    return handleOptions(request);
}

export async function GET(request: Request) {
    const headers = corsHeaders(request);
    const user = await getApiUser(request);
    if (!user) return unauthorized(headers);

    try {
        const tasks = await prisma.tasks.findMany({
            where: { account_id: user.id },
            include: {
                category: true,
                priority: true,
                task_users: { include: { users: true } },
                task_notifications: { orderBy: { hour_offset: 'desc' } },
                subtasks: { orderBy: { order: 'asc' } },
                items: { orderBy: [{ kind: 'asc' }, { order: 'asc' }] },
            },
            orderBy: [
                { completed: 'asc' },
                { rejected: 'asc' },
                { completed_at: 'desc' },
                { complete_before_date: 'asc' },
                { priority_id: 'desc' },
            ],
        });

        return NextResponse.json({ success: true, tasks }, { headers });
    } catch (error) {
        console.error('Ошибка получения задач:', error);
        return NextResponse.json(
            { success: false, error: 'Ошибка сервера' },
            { status: 500, headers }
        );
    }
}

export async function POST(request: Request) {
    const headers = corsHeaders(request);
    const user = await getApiUser(request);
    if (!user) return unauthorized(headers);

    try {
        const body = await request.json();
        const result = await createTask(body);
        return NextResponse.json(result, { headers });
    } catch (error) {
        console.error('Ошибка создания задачи:', error);
        return NextResponse.json(
            { success: false, error: 'Ошибка сервера' },
            { status: 500, headers }
        );
    }
}