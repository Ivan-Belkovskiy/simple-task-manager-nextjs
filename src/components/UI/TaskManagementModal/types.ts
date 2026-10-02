import { Category, Notification, Priority, Task, User } from "@/app/(protected)/page";

export type ModalMode = 'create' | 'edit' | 'reupload';

export interface FormNotification {
    id?: number;         
    hour_offset: number;
    activated?: boolean;
    isNew?: boolean;
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
}

export interface TaskSubmitPayload extends TaskFormData {
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