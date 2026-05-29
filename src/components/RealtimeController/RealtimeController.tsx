'use client';

import { validateTasks } from "@/app/actions";
import { Task } from "@/app/page";
import { getLocalDateString } from "@/utils/date";
import { useRouter } from "next/navigation";
import { Dispatch, RefObject, SetStateAction, useEffect, useRef } from "react";

interface RealtimeControllerProps {
    tasks?: Task[];

    isEditMode?: RefObject<boolean>;

    currentDate?: Date;
    setCurrentDate?: Dispatch<SetStateAction<Date | undefined>>;
}

export default function RealtimeController({ tasks, isEditMode, currentDate, setCurrentDate }: RealtimeControllerProps) {
    const router = useRouter();

    const currentTasksRef = useRef<Task[] | undefined>(tasks);

    useEffect(() => {
        currentTasksRef.current = tasks;
    }, [tasks]);

    const timerRef = useRef(0);

    useEffect(() => {
        const interval = setInterval(async () => {
            timerRef.current += 1;

            const now = new Date();

            if (setCurrentDate) setCurrentDate(now);
            
            if (currentTasksRef.current?.[0]?.complete_before_date) {
                // console.log('NOW:   ' + getLocalDateString(new Date(now)));
                // console.log('COMPLETE BEFORE:   ' + getLocalDateString(new Date(currentTasksRef.current?.[0].complete_before_date)));
                if (currentTasksRef.current[0].complete_before_date < now) {
                    // console.warn(`[!] ЗАДАЧА ${currentTasksRef.current[0]?.name} ОТКЛОНЕНА!!!`)
                    await validateTasks();
                    // router.refresh(); 
                }
            }
            
            if (timerRef.current >= 20 && !isEditMode?.current) {

                router.refresh();
                timerRef.current = 0;
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isEditMode, router]);

    return <></>;
}