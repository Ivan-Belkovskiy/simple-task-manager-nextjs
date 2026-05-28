'use client';

import { useRouter } from "next/navigation";
import { Dispatch, RefObject, SetStateAction, useEffect, useRef } from "react";

interface RealtimeControllerProps {
    isEditMode?: RefObject<boolean>;

    currentDate?: Date;
    setCurrentDate?: Dispatch<SetStateAction<Date | undefined>>;
}

export default function RealtimeController({ isEditMode, currentDate, setCurrentDate }: RealtimeControllerProps) {
    const router = useRouter();

    const timerRef = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            timerRef.current += 1;

            const now = new Date();

            if (setCurrentDate) setCurrentDate(now);

            if (timerRef.current >= 10 && !isEditMode?.current) {
                router.refresh();
                timerRef.current = 0;
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isEditMode, router]);

    return <></>;
}