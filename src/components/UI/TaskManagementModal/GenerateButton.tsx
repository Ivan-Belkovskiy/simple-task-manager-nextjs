'use client';

import { useState } from 'react';
import { generateTaskDetails } from '@/app/actions/ai/generateTaskDetails';
import type { TaskFormData, SubTaskData, TaskItemData } from './types';
import './GenerateButton.css';
import AnimatedLoader from '../AnimatedLoader/AnimatedLoader';
import { AIPromptData } from './AIGenerationModal/AIGenerationModal';

type Props = {
    action: "generation";
    data: TaskFormData;
    onGenerationStart?: () => void;
    onGenerationEnd?: () => void;
    onApply: (patch: Partial<TaskFormData>) => void;
    prompts: AIPromptData[];
    generations?: {
        current: number;
        max: number;
    };
    disabled?: boolean;
} | {
    action: "open-modal";
    onClick?: () => any;
    disabled?: boolean;
}

export default function GenerateButton(props: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [cachedHit, setCachedHit] = useState(false);


    const handleClick = async () => {
        if (props.action === 'generation') {

            if (!props.data.name.trim()) {
                setError('Сначала введите название задачи');
                return;
            }
            setError(null);
            setLoading(true);

            props.onGenerationStart?.();

            try {
                const result = await generateTaskDetails(props.data.name, props.data.description, props.prompts);

                if (!result.success || !result.data) {
                    setError(result.error ?? 'Ошибка генерации');
                    return;
                }

                if (result.cached) {
                    setCachedHit(true);
                    setTimeout(() => setCachedHit(false), 2000);
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

                props.onApply({
                    subtasks: newSubtasks,
                    items: normalizedItems,
                });
            } finally {
                props.onGenerationEnd?.();
                setLoading(false);
            }
        } else if (props.action === 'open-modal') {
            props.onClick?.();
        }
    };

    return (
        <div className="generate-button-wrapper">
            <button
                type="button"
                className={`generate-button ${cachedHit ? 'generate-button--cached' : ''}`}
                onClick={handleClick}
                disabled={props.disabled || loading}
            >
                {loading ? (
                    <>
                        <AnimatedLoader color='#fff' styles={{ display: 'inline-flex' }} />
                        <span>Генерация...</span>
                    </>
                ) : cachedHit ? 'Данные загружены из кэша' : (props.action === 'generation' && props.generations) ? (
                    <>
                        <span>✨ Сгенерировать данные</span>
                        <span className='generations-count --desktop-only'>[Доступно {(props.generations.max - props.generations.current)} / {props.generations.max}]</span>
                        <span className='generations-count --mobile-only'>[{(props.generations.max - props.generations.current)} / {props.generations.max}]</span>
                    </>
                ) : `✨ Сгенерировать данные`}
            </button>
            {error && (
                <span className="generate-button__error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}