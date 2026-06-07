'use client';

import "./TaskNotificationModal.css";
import { Task } from "@/app/page";
import { formatHourTextForNotification } from "@/utils/datetime";
import { RefObject, useEffect, useState } from "react";

export default function TaskNotificationModal({ activateRef, isOpenedRef }: { activateRef?: RefObject<((data: Task, offset: number) => void) | null>, isOpenedRef?: RefObject<boolean | null> }) {
    const [isOpened, setOpened] = useState(false);
    const [taskData, setTaskData] = useState<Task | null>(null);
    const [offset, setOffset] = useState<number | null>(null);

    const updateOpened = (val: boolean) => {
        if (isOpenedRef) isOpenedRef.current = val;
        setOpened(val);
    }

    const activateFn = (data: Task, notificationOffset: number) => {
        const audio = new Audio('/notification-01.mp3');
        audio.oncanplay = () => audio.play();
        updateOpened(true);
        setTaskData(data);
        setOffset(notificationOffset);
    }

    useEffect(() => {
        if (activateRef) activateRef.current = activateFn;
    }, [activateRef]);

    if (isOpened) return (
        <div className="task-notification-modal__overlay">
            <div className="task-notification-modal">
                <div className="task-notification-modal__header">
                    <h1 className="task-notification-modal__title">Уведомление</h1>
                </div>
                <div className="task-notification-modal__content">Осталось {formatHourTextForNotification(offset || 0, true)} до выполнения задачи {taskData?.name}!</div>
                <div className="task-notification-modal__buttons">
                    <button className="task-notification-modal__button" onClick={() => updateOpened(false)}>Продолжить</button>
                </div>
            </div>
        </div>
    )
}