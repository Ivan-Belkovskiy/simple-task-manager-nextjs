'use client';

import { ReactNode } from "react";
import "./TaskInfoModal.css";

export default function TaskInfoModal({ title, children, onClose }: { title?: string; children?: ReactNode; onClose?: () => void }) {
    return (
        <div className="task-info-modal__overlay">
            <div className="task-info-modal">
                <div className="task-info-modal__header">
                    <h1 className="task-info-modal__title">{title}</h1>
                    {/* <button className="task-info-modal__button close-modal-btn" onClick={onClose}>⨉</button> */}
                </div>
                <div className="task-info-modal__content">
                    {children}
                </div>
                {/* <div className="task-info-modal__buttons">
                    <button className="task-info-modal__button close-modal-btn" onClick={onClose}>↲ Назад</button>
                </div> */}
            </div>
        </div>
    )
}