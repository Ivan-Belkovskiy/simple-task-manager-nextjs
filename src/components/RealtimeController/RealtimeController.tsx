// ./src/components/RealtimeController.tsx

'use client';
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect } from "react";

interface RealtimeControllerProps {
    currentDate?: Date;
    setCurrentDate?: Dispatch<SetStateAction<Date | undefined>>;
}

export default function RealtimeController({ currentDate, setCurrentDate }: RealtimeControllerProps) {
    const router = useRouter();

    useEffect(() => {
        console.log('[▦] Realtime Controller is working!!!');

        const checkDate = () => {
            const now = new Date();
            if (setCurrentDate) {
                // if (now.getDate() !== currentDate?.getDate()) {
                    setCurrentDate(now);
                    router.refresh();
                // }
            }
        };

        // checkDate();

        const interval = setInterval(() => {
            checkDate();
        }, 1000);

        return () => clearInterval(interval);
    });

    return <></>;
}