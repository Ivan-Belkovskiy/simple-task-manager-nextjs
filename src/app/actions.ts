'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { EditingTaskData } from "@/components/UI/TaskEditorModal/TaskEditorModal";
import { Notification } from "./page";

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


export async function createTask(formData: FormData, selectedUserIds: number[], notifications?: { offset: number }[]) {
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

                task_notifications: {
                    create: notifications?.map(n => ({
                        hour_offset: n.offset,
                        activated: false,
                    }))
                }
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
                completed_at: new Date()
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

// export async function updateTask(id: number, data: EditingTaskData) {
//     try {
//         // const data = JSON.parse(d) as EditingTaskData;
//         // console.log('NAME ::: ' + (data.name))
//         await prisma.tasks.update({
//             data: {
//                 name: data.name,
//                 description: data.description,
//                 category_id: (data.category && data.category !== '[[NONE]]') ? Number(data.category) : null,
//                 priority_id: data.priority,
//                 complete_before_date: data.completeBefore ? new Date(data.completeBefore) : null,

//                 task_users: {

//                     deleteMany: {},

//                     create: data.users.map((userId) => ({
//                         user_id: Number(userId),
//                     })),
//                 },

//                 // task_notifications: {

//                 //     deleteMany: {},

//                 //     create: data.notifications
//                 // }
//             },
//             where: {
//                 id: id,
//             }
//         });
//         // console.log(data);

//         revalidatePath('/');
//         return { success: true };
//     } catch (error) {
//         console.error(error);
//         return { success: false };
//     }
// }

export async function updateTask(id: number, data: EditingTaskData) {
    try {
        await prisma.tasks.update({
            where: { id: id },
            data: {
                name: data.name,
                description: data.description,
                category_id: (data.category && data.category !== '[[NONE]]') ? Number(data.category) : null,
                priority_id: data.priority,
                complete_before_date: data.completeBefore ? new Date(data.completeBefore) : null,
                task_users: {
                    deleteMany: {},
                    create: data.users.map((userId) => ({ user_id: Number(userId) })),
                },
                task_notifications: {
                    deleteMany: {}, 
                    create: (!data.disableCompleteBeforeDate) ? data.notifications?.map(n => ({
                        hour_offset: Number(n.hour_offset),
                        activated: n.activated || false, 
                    })) : []
                },
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function createTaskNew(data: EditingTaskData) {
    // const name = formData.get("name") as string;
    // const description = formData.get("description") as string;
    // const categoryId = formData.get("categoryId");
    // const priorityId = formData.get("priorityId");
    // const completeBefore = formData.get("completeBeforeDate");

    try {
        await prisma.tasks.create({
            data: {
                name: data.name,
                description: data.description,
                completed: false,
                category_id: (data.category && data.category !== '[[NONE]]') ? Number(data.category) : null,
                priority_id: data.priority,
                complete_before_date: data.completeBefore ? new Date(data.completeBefore) : null,

                task_users: {
                    create: data.users.map((userId) => ({
                        user_id: Number(userId),
                    })),
                },

                task_notifications: {
                    create: data.notifications?.map(n => ({
                        hour_offset: n.hour_offset,
                        activated: false,
                    }))
                }

            },
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Ошибка создания задачи:", error);
        return { success: false };
    }
}

export async function validateTasks() {
    try {
        const updated = await prisma.tasks.updateMany({
            where: {
                complete_before_date: { lt: new Date() },
                completed: false,
                rejected: false
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
        await prisma.task_notifications.update({
            where: {
                id: notificationId,
            },
            data: {
                activated: true,
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}