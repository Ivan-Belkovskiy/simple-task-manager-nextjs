import { useEffect, useState } from 'react';
import { createTask, createTaskNew, updateTask } from '@/app/actions';
import { getLocalDateString } from '@/utils/datetime';
import { Priority, Task } from '@/app/page';
import { FormNotification, ModalMode, TaskFormData, ValidationErrors } from './types';

function emptyForm(priorities: Priority[]): TaskFormData {
    return {
        name: '',
        description: '',
        users: [],
        priority: priorities[0]?.id,
        category: '[[NONE]]',
        completeBefore: getLocalDateString(new Date()),
    };
}

export function useTaskForm(mode: ModalMode, priorities: Priority[], taskData?: Task) {
    const [data, setData] = useState<TaskFormData>(() => emptyForm(priorities));
    const [notifications, setNotifications] = useState<FormNotification[]>([]);
    const [errors, setErrors] = useState<ValidationErrors>({ name: null, users: null });
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        if (mode === 'create' || !taskData) {
            setData(emptyForm(priorities));
            setNotifications([]);
            setErrors({ name: null, users: null });
            return;
        }

        const isRework = mode === 'reupload';
        const completeBefore = isRework
            ? getLocalDateString(new Date())
            : taskData.complete_before_date
                ? getLocalDateString(new Date(taskData.complete_before_date))
                : '';

        setData({
            name: taskData.name,
            description: taskData.description ?? '',
            priority: taskData.priority_id ?? priorities[0]?.id,
            category: taskData.category_id ?? '[[NONE]]',
            users: taskData.task_users.map(u => u.users.id),
            completeBefore,
            disableCompleteBeforeDate: !taskData.complete_before_date && !isRework,
        });

        setNotifications(taskData.task_notifications.map(n => ({
            id: n.id,
            hour_offset: n.hour_offset || 0,
            activated: isRework ? false : n.activated,
            isNew: false,
        })));
    }, [mode, taskData, priorities]);

    const reset = () => {
        setData(emptyForm(priorities));
        setNotifications([]);
        setErrors({ name: null, users: null });
    };

    const validate = (): boolean => {
        const next = {
            name: data.name.trim().length === 0,
            users: data.users.length === 0,
        };
        setErrors(next);
        return !next.name && !next.users;
    };

    const submit = async (validateFirst: boolean): Promise<boolean> => {
        if (validateFirst && !validate()) return false;

        setLoading(true);
        try {
            const payload = {
                ...data,
                completeBefore: (data.completeBefore && !data.disableCompleteBeforeDate && !data.isCompleted)
                    ? new Date(data.completeBefore).toISOString()
                    : undefined,
                completedAt: (mode === 'create' && data.isCompleted)
                    ? new Date(data.completedAt || getLocalDateString(new Date())).toISOString()
                    : undefined,
                createdAt: (data.allowEnterCreationDate && data.createdAt)
                    ? new Date(data.createdAt).toISOString()
                    : undefined,
                notifications: data.disableCompleteBeforeDate ? [] : notifications,
            };

            let result;
            if (mode === 'create') {
                result = await createTask(payload);
            } else if (mode === 'edit') {
                result = await updateTask(taskData!.id, payload);
            } else {
                result = await createTaskNew(payload);
            }

            return !!result?.success;
        } finally {
            setLoading(false);
        }
    };

    return {
        data, setData,
        notifications, setNotifications,
        errors, setErrors,
        isLoading,
        submit, reset,
    };
}