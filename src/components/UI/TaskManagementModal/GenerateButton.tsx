'use client';

import { useState } from 'react';
import { generateTaskDetails } from '@/app/actions/ai/generateTaskDetails';
import type { TaskFormData, SubTaskData, TaskItemData } from './types';
import './GenerateButton.css';

interface Props {
    data: TaskFormData;
    onApply: (patch: Partial<TaskFormData>) => void;
    disabled?: boolean;
}

export default function GenerateButton({ data, onApply, disabled }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClick = async () => {
        if (!data.name.trim()) {
            setError('Сначала введите название задачи');
            return;
        }
        setError(null);
        setLoading(true);

        try {
            const result = await generateTaskDetails(data.name, data.description);

            if (!result.success || !result.data) {
                setError(result.error ?? 'Ошибка генерации');
                return;
            }

            const { subtasks, items } = result.data;

            const newSubtasks: SubTaskData[] = subtasks.map((st, i) => ({
                name: st.name,
                description: st.description ?? '',
                order: i,
                completed: false,
            }));

            const grouped: Record<string, TaskItemData[]> = {};
            for (const it of items) {
                (grouped[it.kind] ||= []).push({
                    kind: it.kind,
                    name: it.name,
                    description: it.description ?? '',
                    quantity: it.quantity ?? '',
                    order: 0,
                    completed: false,
                });
            }

            const normalizedItems: TaskItemData[] = [];
            for (const kind of ['ITEM', 'ACTION', 'REQUIREMENT'] as const) {
                (grouped[kind] ?? []).forEach((it, i) => {
                    normalizedItems.push({ ...it, order: i });
                });
            }

            onApply({
                subtasks: newSubtasks,
                items: normalizedItems,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="generate-button-wrapper">
            <button
                type="button"
                className="generate-button"
                onClick={handleClick}
                disabled={disabled || loading}
            >
                {loading ? '⏳ Генерация...' : '✨ Сгенерировать данные'}
            </button>
            {error && (
                <span className="generate-button__error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}