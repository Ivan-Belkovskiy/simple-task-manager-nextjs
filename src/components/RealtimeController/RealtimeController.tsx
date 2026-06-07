'use client';

import { activateNotification, validateTasks } from "@/app/actions";
import { Task } from "@/app/page";
import { getLocalDateString, subtractHours } from "@/utils/datetime";
import { useRouter } from "next/navigation";
import { Dispatch, RefObject, SetStateAction, useEffect, useRef } from "react";

interface RealtimeControllerProps {
    tasks?: Task[];

    isEditMode?: RefObject<boolean>;

    currentDate?: Date;
    setCurrentDate?: Dispatch<SetStateAction<Date | undefined>>;

    activateNotificationRef?: RefObject<((data: Task, offset: number) => void) | null>;
    isNotificationOpenRef?: RefObject<boolean>;
}

export default function RealtimeController({
    tasks,
    isEditMode,
    currentDate,
    setCurrentDate,
    activateNotificationRef,
    isNotificationOpenRef
}: RealtimeControllerProps) {
    const router = useRouter();

    const currentTasksRef = useRef<Task[] | undefined>(tasks);

    const queueRef = useRef<{ task: Task, notification: any }[]>([]);
    // const isModalOpenRef = useRef(false);

    const processQueue = async () => {
        if (!isNotificationOpenRef) return;

        if (isNotificationOpenRef.current || queueRef.current.length === 0) return;

        const next = queueRef.current.shift();
        if (next) {
            isNotificationOpenRef.current = true;
            await activateNotification(next.notification.id);
            activateNotificationRef?.current?.(next.task, next.notification.hour_offset);
        }
    };

    const getNextPendingNotification = (tasks: Task[]): { task: Task, notification: any } | null => {
        const now = new Date();
        let bestMatch: { task: Task, notification: any } | null = null;
        let minTime = Infinity;

        tasks.forEach(task => {
            if (!task.complete_before_date || !task.task_notifications) return;

            task.task_notifications.forEach(n => {
                if (n.activated || !task.complete_before_date || !n.hour_offset) return;

                const notifyTime = subtractHours(new Date(task.complete_before_date), n.hour_offset).getTime();

                if (notifyTime <= now.getTime() && notifyTime <= minTime) {
                    minTime = notifyTime;
                    bestMatch = { task, notification: n };
                }
            });
        });

        return bestMatch;
    };

    useEffect(() => {
        currentTasksRef.current = tasks;
    }, [tasks]);

    const timerRef = useRef(0);

    useEffect(() => {
        const interval = setInterval(async () => {
            timerRef.current += 1;

            const now = new Date();

            if (setCurrentDate) setCurrentDate(now);



            const task = currentTasksRef.current?.[0];


            if (task?.complete_before_date) {

                if (task.complete_before_date < now) {
                    await validateTasks();
                }

                // if (task.task_notifications) {
                //     const notifications = task.task_notifications.filter(n => !n.activated);
                //     if (
                //         notifications[0]?.hour_offset &&
                //         subtractHours(task.complete_before_date, (
                //             notifications[0].hour_offset
                //         )) < now
                //     ) {
                //         await activateNotification(notifications[0].id);
                //         activateNotificationRef?.current?.(task, notifications[0].hour_offset);
                //         // console.error('НАПОМИНАНИЕ!!!')
                //         // console.log('NOW:   ' + getLocalDateString(new Date(now)));
                //         // console.log('NOTIFICATION AT:   ' + getLocalDateString(new Date(
                //         //     subtractHours(task.complete_before_date, (
                //         //         notifications[0].hour_offset
                //         //     ))
                //         // )));
                //     }
                // }
            }

            const nextNotification = getNextPendingNotification(currentTasksRef.current || []);

            if (nextNotification) {
                const isAlreadyInQueue = queueRef.current.some(
                    q => q.notification.id === nextNotification.notification.id
                );

                if (!isAlreadyInQueue) {
                    queueRef.current.push(nextNotification);
                }
            }

            processQueue();

            console.log(queueRef.current);

            if (timerRef.current >= 20 && !isEditMode?.current) {

                router.refresh();
                timerRef.current = 0;
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isEditMode, router]);

    return <></>;
}