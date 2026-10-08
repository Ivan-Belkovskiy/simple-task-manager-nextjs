'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '../users/session';

export async function toggleSubtask(id: number, completed: boolean) {

    try {

        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Не авторизован' };

        const result = await prisma.subtasks.updateMany({
            where: {
                id,
                task: { account_id: user.id },
            },
            data: {
                completed,
                completed_at: completed ? new Date() : null,
            },
        });

        if (result.count === 0) return { success: false, error: 'Подзадача не найдена' };

        revalidatePath('/');
        return { success: true };

    } catch (error) {
        console.error('Ошибка переключения подзадачи:', error);
        return { success: false, error: 'Что-то пошло не так' };
    }
}

export async function deleteSubtask(id: number) {

    try {

        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Не авторизован' };

        const result = await prisma.subtasks.deleteMany({
            where: {
                id,
                task: { account_id: user.id },
            },
        });

        if (result.count === 0) return { success: false, error: 'Подзадача не найдена' };

        revalidatePath('/');
        return { success: true };

    } catch (error) {
        console.error('Ошибка удаления подзадачи:', error);
        return { success: false, error: 'Что-то пошло не так' };
    }
}