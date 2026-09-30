import { ModalMode } from "./types";

export interface ModeConfig {
    title: string;
    confirmLabel: string;
    cancelLabel?: string;
    themeClass: string;
    showCancel: boolean;
    showReuploadNote: boolean;
    validate: boolean;
    showIsCompleted: boolean;
}

export const MODE_CONFIG: Record<ModalMode, ModeConfig> = {
    create: {
        title: 'Добавить задачу',
        confirmLabel: 'Добавить задачу',
        themeClass: 'task-modal--create',
        showCancel: false,
        showReuploadNote: false,
        validate: true,
        showIsCompleted: true,
    },
    edit: {
        title: 'Редактировать задачу',
        confirmLabel: 'Сохранить изменения',
        cancelLabel: 'Отменить изменения',
        themeClass: 'task-modal--edit',
        showCancel: true,
        showReuploadNote: false,
        validate: false,
        showIsCompleted: false,
    },
    reupload: {
        title: 'Повторное создание задачи',
        confirmLabel: 'Создать задачу повторно',
        themeClass: 'task-modal--reupload',
        showCancel: false,
        showReuploadNote: true,
        validate: false,
        showIsCompleted: false,
    },
};