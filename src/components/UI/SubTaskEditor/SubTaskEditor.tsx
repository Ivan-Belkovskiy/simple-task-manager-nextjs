'use client';

import { useState } from 'react';
import { SubTaskData } from '../TaskManagementModal/types';
import './SubTaskEditor.css';

interface Props {
    subtasks: SubTaskData[];
    onChange: (subtasks: SubTaskData[]) => void;
    disabled?: boolean;
}

export default function SubTaskEditor({ subtasks, onChange, disabled }: Props) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const add = () => {
        onChange([
            ...subtasks,
            { name: '', description: '', order: subtasks.length, completed: false },
        ]);
        setExpandedIndex(subtasks.length);
    };

    const update = (index: number, patch: Partial<SubTaskData>) => {
        onChange(subtasks.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    };

    const remove = (index: number) => {
        onChange(
            subtasks
                .filter((_, i) => i !== index)
                .map((s, i) => ({ ...s, order: i })),
        );
        if (expandedIndex === index) setExpandedIndex(null);
    };

    const move = (index: number, direction: -1 | 1) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= subtasks.length) return;

        const copy = [...subtasks];
        [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
        onChange(copy.map((s, i) => ({ ...s, order: i })));
        setExpandedIndex(newIndex);
    };

    return (
        <div className="subtask-editor">
            <div className="subtask-editor__header">
                <span className="subtask-editor__title">Подзадачи</span>
                {subtasks.length > 0 && (
                    <span className="subtask-editor__count">
                        {subtasks.filter(s => s.completed).length} / {subtasks.length}
                    </span>
                )}
            </div>

            <div className="subtask-editor__list">
                {subtasks.map((st, i) => (
                    <div
                        key={st.id ?? `new-${i}`}
                        className={`subtask-editor__item ${st.completed ? 'subtask-editor__item--completed' : ''}`}
                    >
                        <div className="subtask-editor__row">
                            <input
                                type="checkbox"
                                className="subtask-editor__checkbox"
                                checked={st.completed}
                                onChange={e => update(i, { completed: e.target.checked })}
                                disabled={disabled}
                            />

                            <input
                                type="text"
                                className="subtask-editor__name"
                                placeholder={`Подзадача ${i + 1}`}
                                value={st.name}
                                onChange={e => update(i, { name: e.target.value })}
                                disabled={disabled}
                            />

                            <button
                                type="button"
                                className="subtask-editor__btn"
                                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                                title="Описание"
                            >
                                {(expandedIndex === i) ? '-' : '＋'}
                                {/* {st.description ? '📝' : '＋'} */}
                            </button>

                            <button
                                type="button"
                                className="subtask-editor__btn"
                                onClick={() => move(i, -1)}
                                disabled={i === 0 || disabled}
                                title="Вверх"
                            >
                                ↑
                            </button>

                            <button
                                type="button"
                                className="subtask-editor__btn"
                                onClick={() => move(i, 1)}
                                disabled={i === subtasks.length - 1 || disabled}
                                title="Вниз"
                            >
                                ↓
                            </button>

                            <button
                                type="button"
                                className="subtask-editor__btn subtask-editor__btn--danger"
                                onClick={() => remove(i)}
                                disabled={disabled}
                                title="Удалить"
                            >
                                ✕
                            </button>
                        </div>

                        {expandedIndex === i && (
                            <textarea
                                className="subtask-editor__description"
                                placeholder="Описание подзадачи (опционально)"
                                value={st.description ?? ''}
                                onChange={e => update(i, { description: e.target.value })}
                                disabled={disabled}
                                rows={2}
                            />
                        )}
                    </div>
                ))}
            </div>

            <button
                type="button"
                className="subtask-editor__add"
                onClick={add}
                disabled={disabled}
            >
                + Добавить подзадачу
            </button>
        </div>
    );
}