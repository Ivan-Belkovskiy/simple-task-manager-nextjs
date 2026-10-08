import { Category, Priority, Task, User } from "@/app/(protected)/page";
import { NotificationFormat, NotificationPlatform, TaskItemKind } from "@prisma/client";

export type ModalMode = 'create' | 'edit' | 'reupload';

export interface FormNotification {
    id?: number;
    hour_offset: number;
    activated?: boolean;
    isNew?: boolean;
    target_platforms: NotificationPlatform[];
    display_format: NotificationFormat;
    ringtone?: string;
}

export interface SubTaskData {
    id?: number;
    name: string;
    description?: string | null;
    order: number;
    completed: boolean;
}

export interface TaskItemData {
    id?: number;
    kind: TaskItemKind;
    name: string;
    description?: string | null;
    quantity?: string | null;
    order: number;
    completed: boolean;
}

export interface TaskFormData {
    name: string;
    description: string;
    priority?: number;
    category: string | number;
    users: (string | number)[];
    completeBefore?: string;
    disableCompleteBeforeDate?: boolean;
    isCompleted?: boolean;
    completedAt?: string;
    completeInfo?: string;
    allowEnterCreationDate?: boolean;
    createdAt?: string;

    subtasks: SubTaskData[];
    items: TaskItemData[]; 
}

export interface TaskSubmitPayload extends Omit<TaskFormData, 'completeBefore' | 'completedAt' | 'createdAt'> {
    completeBefore?: string;
    completedAt?: string;
    createdAt?: string;
    notifications?: FormNotification[];
}

export interface ValidationErrors {
    name: boolean | null;
    users: boolean | null;
}

export interface TaskManagementModalProps {
    mode: ModalMode;
    taskData?: Task;
    categories: Category[];
    priorities: Priority[];
    users: User[];
    onClose?: () => void;
}