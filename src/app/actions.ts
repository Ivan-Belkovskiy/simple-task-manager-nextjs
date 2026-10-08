'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Notification } from "./(protected)/page";
import type { TaskSubmitPayload } from '@/components/UI/TaskManagementModal/types';
import { getCurrentUser, getSession } from "./actions/users/session";

export async function createTask(data: TaskSubmitPayload) {
    try {

        const user = await getCurrentUser();

        if (!user) return { success: false, error: "Не авторизован!" };

        const isCompleted = !!data.isCompleted;

        await prisma.tasks.create({
            data: {
                name: data.name,
                description: data.description,
                completed: isCompleted,
                completed_at: isCompleted
                    ? new Date(data.completedAt ?? new Date().toISOString())
                    : null,
                complete_info: isCompleted ? (data.completeInfo || undefined) : undefined,
                category_id: (data.category && data.category !== '[[NONE]]')
                    ? Number(data.category) : null,
                priority_id: data.priority,
                complete_before_date: (!isCompleted && !data.disableCompleteBeforeDate && data.completeBefore)
                    ? new Date(data.completeBefore) : null,
                created_at: (data.allowEnterCreationDate && data.createdAt)
                    ? new Date(data.createdAt) : undefined,

                task_users: {
                    create: data.users.map(userId => ({ user_id: Number(userId) })),
                },
                task_notifications: {
                    create: (!isCompleted && !data.disableCompleteBeforeDate)
                        ? data.notifications?.map(n => ({
                            hour_offset: Number(n.hour_offset),
                            activated: false,
                            target_platforms: n.target_platforms,
                            display_format: n.display_format,
                            ringtone: n.ringtone ?? null,
                        }))
                        : [],
                },
                account_id: user.id,

                subtasks: {
                    create: data.subtasks?.map((st, i) => ({
                        name: st.name,
                        description: st.description ?? null,
                        order: i,
                        completed: st.completed,
                        completed_at: st.completed ? new Date() : null,
                    })) ?? [],
                },
            },
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Ошибка создания задачи:', error);
        return { success: false };
    }
}

export async function updateTask(id: number, data: TaskSubmitPayload) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Не авторизован!' };

    try {
        await prisma.$transaction(async (tx) => {
            const task = await tx.tasks.findFirst({
                where: { id, account_id: user.id },
                select: { id: true },
            });
            if (!task) throw new Error('FORBIDDEN');

            await tx.tasks.update({
                where: { id },
                data: {
                    name: data.name,
                    description: data.description,
                    category_id: (data.category && data.category !== '[[NONE]]')
                        ? Number(data.category) : null,
                    priority_id: data.priority,
                    complete_before_date: (!data.disableCompleteBeforeDate && data.completeBefore)
                        ? new Date(data.completeBefore) : null,
                    created_at: (data.allowEnterCreationDate && data.createdAt)
                        ? new Date(data.createdAt) : undefined,
                    task_users: {
                        deleteMany: {},
                        create: data.users.map(userId => ({ user_id: Number(userId) })),
                    },
                    task_notifications: {
                        deleteMany: {},
                        create: (!data.disableCompleteBeforeDate)
                            ? data.notifications?.map(n => ({
                                hour_offset: Number(n.hour_offset),
                                activated: n.activated || false,
                                target_platforms: n.target_platforms,
                                display_format: n.display_format,
                                ringtone: n.ringtone,
                            }))
                            : [],
                    },
                },
            });

            const incomingIds = (data.subtasks ?? [])
                .map(s => s.id)
                .filter((x): x is number => typeof x === 'number');

            await tx.subtasks.deleteMany({
                where: {
                    task_id: id,
                    id: { notIn: incomingIds.length ? incomingIds : [0] },
                },
            });

            for (const [i, st] of (data.subtasks ?? []).entries()) {
                if (st.id) {
                    await tx.subtasks.update({
                        where: { id: st.id },
                        data: {
                            name: st.name,
                            description: st.description ?? null,
                            order: i,
                            completed: st.completed,
                            completed_at: st.completed ? new Date() : null,
                        },
                    });
                } else {
                    await tx.subtasks.create({
                        data: {
                            task_id: id,
                            name: st.name,
                            description: st.description ?? null,
                            order: i,
                            completed: st.completed,
                            completed_at: st.completed ? new Date() : null,
                        },
                    });
                }
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Ошибка обновления задачи:', error);
        return { success: false };
    }
}

export async function createTaskNew(data: TaskSubmitPayload) {
    try {

        const user = await getCurrentUser();

        if (!user) return { success: false, error: "Не авторизован!" };

        await prisma.tasks.create({
            data: {
                name: data.name,
                description: data.description,
                completed: false,
                category_id: (data.category && data.category !== '[[NONE]]')
                    ? Number(data.category) : null,
                priority_id: data.priority,
                complete_before_date: (!data.disableCompleteBeforeDate && data.completeBefore)
                    ? new Date(data.completeBefore) : null,
                created_at: (data.allowEnterCreationDate && data.createdAt)
                    ? new Date(data.createdAt) : undefined,

                task_users: {
                    create: data.users.map(userId => ({ user_id: Number(userId) })),
                },
                task_notifications: {
                    create: (!data.disableCompleteBeforeDate)
                        ? data.notifications?.map(n => ({
                            hour_offset: Number(n.hour_offset),
                            activated: false,
                            target_platforms: n.target_platforms,
                            display_format: n.display_format,
                            ringtone: n.ringtone ?? null,
                        }))
                        : [],
                },
                account_id: user.id,

                subtasks: {
                    create: data.subtasks?.map((st, i) => ({
                        name: st.name,
                        description: st.description ?? null,
                        order: i,
                        completed: st.completed,
                        completed_at: st.completed ? new Date() : null,
                    })) ?? [],
                },
            },
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Ошибка повторного создания задачи:', error);
        return { success: false };
    }
}

export async function createUser(name: string) {
    try {

        const user = await getCurrentUser();

        if (!user) return { success: false, error: "Не авторизован!" };

        await prisma.users.create({
            data: {
                name,
                account_id: user.id,
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function deleteUser(id: number) {
    try {

        const user = await getCurrentUser();

        if (!user) return { success: false, error: "Не авторизован!" };

        await prisma.users.delete({
            where: {
                id: id,
                account_id: user.id,
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}


export async function createCategory(name: string) {
    try {

        const user = await getCurrentUser();

        if (!user) return { success: false, error: "Не авторизован!" };

        await prisma.task_categories.create({
            data: {
                name,
                account_id: user.id,
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function deleteCategory(id: number) {
    try {

        const user = await getCurrentUser();

        if (!user) return { success: false, error: "Не авторизован!" };

        await prisma.task_categories.delete({
            where: {
                id: id,
                account_id: user.id,
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function deleteTask(id: number) {
    try {

        const user = await getCurrentUser();

        if (!user) return { success: false, error: "Не авторизован!" };

        await prisma.tasks.delete({
            where: {
                id: id,
                account_id: user.id,
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function completeTask(id: number, info?: string) {
    try {

        const user = await getCurrentUser();

        if (!user) return { success: false, error: "Не авторизован!" };

        await prisma.tasks.update({
            data: {
                completed: true,
                completed_at: new Date(),
                complete_info: info,
            },
            where: {
                id: id,
                account_id: user.id,
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}



export async function validateTasks() {
    try {

        const user = await getCurrentUser();

        if (!user) return { success: false, error: "Не авторизован!" };

        const updated = await prisma.tasks.updateMany({
            where: {
                complete_before_date: { lt: new Date() },
                completed: false,
                rejected: false,
                account_id: user.id,
            },
            data: {
                rejected: true
            }
        });

        if (updated.count > 0) revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function activateNotification(notificationId: number) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Не авторизован!' };

        const result = await prisma.task_notifications.updateMany({
            where: {
                id: notificationId,
                task: { account_id: user.id },
            },
            data: { activated: true },
        });

        if (result.count === 0) {
            return { success: false, error: 'Напоминание не найдено' };
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Ошибка активации напоминания:', error);
        return { success: false };
    }
}