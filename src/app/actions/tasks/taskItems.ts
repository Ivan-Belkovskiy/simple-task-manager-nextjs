'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '../users/session';

export async function toggleTaskItem(id: number, completed: boolean) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Не авторизован' };

        const result = await prisma.task_items.updateMany({
            where: {
                id,
                task: { account_id: user.id },
            },
            data: {
                completed,
                completed_at: completed ? new Date() : null,
            },
        });

        if (result.count === 0) return { success: false, error: 'Элемент не найден' };

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Ошибка переключения элемента:', error);
        return { success: false, error: 'Что-то пошло не так' };
    }
}

export async function deleteTaskItem(id: number) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Не авторизован' };

        const result = await prisma.task_items.deleteMany({
            where: {
                id,
                task: { account_id: user.id },
            },
        });

        if (result.count === 0) return { success: false, error: 'Элемент не найден' };

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Ошибка удаления элемента:', error);
        return { success: false, error: 'Что-то пошло не так' };
    }
}