'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Task } from "./page";
import { EditingTaskData } from "@/components/UI/TaskEditorModal/TaskEditorModal";

export async function createUser(name: string) {
    try {
        await prisma.users.create({
            data: {
                name,
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
        await prisma.users.delete({
            where: {
                id: id,
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
        await prisma.task_categories.create({
            data: {
                name,
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
        await prisma.task_categories.delete({
            where: {
                id: id,
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}


export async function createTask(formData: FormData, selectedUserIds: number[]) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId");
    const priorityId = formData.get("priorityId");
    const completeBefore = formData.get("completeBeforeDate");

    try {
        await prisma.tasks.create({
            data: {
                name,
                description,
                completed: false,
                category_id: (categoryId && categoryId !== '[[NONE]]') ? Number(categoryId) : null,
                priority_id: priorityId ? Number(priorityId) : null,
                complete_before_date: completeBefore ? new Date(completeBefore as string) : null,

                task_users: {
                    create: selectedUserIds.map((userId) => ({
                        user_id: userId,
                    })),
                },
            },
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Ошибка создания задачи:", error);
        return { success: false };
    }
}

export async function deleteTask(id: number) {
    try {
        await prisma.tasks.delete({
            where: {
                id: id,
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function completeTask(id: number) {
    try {
        await prisma.tasks.update({
            data: {
                completed: true,
            },
            where: {
                id: id,
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function updateTask(id: number, data: EditingTaskData) {
    try {
        // const data = JSON.parse(d) as EditingTaskData;
        // console.log('NAME ::: ' + (data.name))
        await prisma.tasks.update({
            data: {
                name: data.name,
                description: data.description,
                priority_id: data.priority,
                category_id: (data.category && data.category !== '[[NONE]]') ? Number(data.category) : null,
                complete_before_date: data.completeBefore ? new Date(data.completeBefore) : null,
                
                task_users: {

                    deleteMany: {},

                    create: data.users.map((userId) => ({
                        user_id: Number(userId),
                    })),
                },
            },
            where: {
                id: id,
            }
        });
        // console.log(data);

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}