'use client';

import { useState } from 'react';
import { TaskItemKind } from '@prisma/client';
import { TaskItemData } from '../TaskManagementModal/types';
import './TaskItemsEditor.css';

interface Props {
    items: TaskItemData[];
    onChange: (items: TaskItemData[]) => void;
    disabled?: boolean;
}

const SECTIONS: {
    kind: TaskItemKind;
    title: string;
    addLabel: string;
    placeholder: string;
}[] = [
        {
            kind: 'ITEM',
            title: 'Необходимые предметы',
            addLabel: '+ Добавить предмет',
            placeholder: 'Название предмета',
        },
        {
            kind: 'ACTION',
            title: 'Необходимые действия',
            addLabel: '+ Добавить действие',
            placeholder: 'Что нужно сделать',
        },
        {
            kind: 'REQUIREMENT',
            title: 'Условия и требования',
            addLabel: '+ Добавить условие',
            placeholder: 'Условие / требование',
        },
    ];

export default function TaskItemsEditor({ items, onChange, disabled }: Props) {
    const [expanded, setExpanded] = useState<Record<string, number | null>>({});

    const itemsOfKind = (kind: TaskItemKind) =>
        items
            .filter(it => it.kind === kind)
            .sort((a, b) => a.order - b.order);

    const replaceKind = (kind: TaskItemKind, updated: TaskItemData[]) => {
        const others = items.filter(it => it.kind !== kind);
        const reordered = updated.map((it, i) => ({ ...it, order: i }));
        onChange([...others, ...reordered]);
    };

    const addItem = (kind: TaskItemKind) => {
        const current = itemsOfKind(kind);
        replaceKind(kind, [
            ...current,
            {
                kind,
                name: '',
                description: '',
                quantity: '',
                order: current.length,
                completed: false,
            },
        ]);
        setExpanded(p => ({ ...p, [kind]: current.length }));
    };

    const updateItem = (kind: TaskItemKind, index: number, patch: Partial<TaskItemData>) => {
        const current = itemsOfKind(kind);
        const updated = current.map((it, i) => (i === index ? { ...it, ...patch } : it));
        replaceKind(kind, updated);
    };

    const removeItem = (kind: TaskItemKind, index: number) => {
        const current = itemsOfKind(kind);
        replaceKind(kind, current.filter((_, i) => i !== index));
        if (expanded[kind] === index) {
            setExpanded(p => ({ ...p, [kind]: null }));
        }
    };

    const moveItem = (kind: TaskItemKind, index: number, direction: -1 | 1) => {
        const current = itemsOfKind(kind);
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= current.length) return;

        const copy = [...current];
        [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
        replaceKind(kind, copy);
        setExpanded(p => ({ ...p, [kind]: newIndex }));
    };

    return (
        <div className="task-items-editor">
            {SECTIONS.map(section => {
                const kindItems = itemsOfKind(section.kind);
                const completedCount = kindItems.filter(it => it.completed).length;

                return (
                    <div key={section.kind} className="task-items-editor__section">
                        <div className="task-items-editor__section-header">
                            <span className="task-items-editor__section-title">{section.title}</span>
                            {kindItems.length > 0 && (
                                <span className="task-items-editor__section-count">
                                    {completedCount} / {kindItems.length}
                                </span>
                            )}
                        </div>

                        <div className="task-items-editor__list">
                            {kindItems.map((it, i) => (
                                <div
                                    key={it.id ?? `${section.kind}-new-${i}`}
                                    className={`task-items-editor__item ${it.completed ? 'task-items-editor__item--completed' : ''}`}
                                >
                                    <div className="task-items-editor__row">
                                        <input
                                            type="checkbox"
                                            className="task-items-editor__checkbox"
                                            checked={it.completed}
                                            onChange={e => updateItem(section.kind, i, { completed: e.target.checked })}
                                            disabled={disabled}
                                        />

                                        <input
                                            type="text"
                                            className="task-items-editor__name"
                                            placeholder={section.placeholder}
                                            value={it.name}
                                            onChange={e => updateItem(section.kind, i, { name: e.target.value })}
                                            disabled={disabled}
                                        />

                                        <input
                                            type="text"
                                            className="task-items-editor__quantity task-items-editor__quantity--inline"
                                            placeholder=""
                                            value={it.quantity ?? ''}
                                            onChange={e => updateItem(section.kind, i, { quantity: e.target.value })}
                                            disabled={disabled}
                                            title="Количество / характеристика"
                                        />

                                        <button
                                            type="button"
                                            className="task-items-editor__btn"
                                            onClick={() => setExpanded(p => ({
                                                ...p,
                                                [section.kind]: p[section.kind] === i ? null : i,
                                            }))}
                                            title="Описание и количество"
                                        >
                                            {(expanded[section.kind] === i) ? '-' : '＋'}
                                            {/* {(it.description || it.quantity) ? '📝' : '＋'} */}
                                        </button>

                                        <button
                                            type="button"
                                            className="task-items-editor__btn"
                                            onClick={() => moveItem(section.kind, i, -1)}
                                            disabled={i === 0 || disabled}
                                            title="Вверх"
                                        >
                                            ↑
                                        </button>

                                        <button
                                            type="button"
                                            className="task-items-editor__btn"
                                            onClick={() => moveItem(section.kind, i, 1)}
                                            disabled={i === kindItems.length - 1 || disabled}
                                            title="Вниз"
                                        >
                                            ↓
                                        </button>

                                        <button
                                            type="button"
                                            className="task-items-editor__btn task-items-editor__btn--danger"
                                            onClick={() => removeItem(section.kind, i)}
                                            disabled={disabled}
                                            title="Удалить"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {expanded[section.kind] === i && (
                                        <div className="task-items-editor__expanded">
                                            <div className="task-items-editor__expanded-field">
                                                <label className="task-items-editor__expanded-label">Количество / характеристика:</label>
                                                <input
                                                    type="text"
                                                    className="task-items-editor__quantity task-items-editor__quantity--expanded"
                                                    placeholder="Например: 2 шт, 5 л, до конца дня"
                                                    value={it.quantity ?? ''}
                                                    onChange={e => updateItem(section.kind, i, { quantity: e.target.value })}
                                                    disabled={disabled}
                                                />
                                            </div>

                                            <textarea
                                                className="task-items-editor__description"
                                                placeholder="Описание (опционально)"
                                                value={it.description ?? ''}
                                                onChange={e => updateItem(section.kind, i, { description: e.target.value })}
                                                disabled={disabled}
                                                rows={2}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="task-items-editor__add"
                            onClick={() => addItem(section.kind)}
                            disabled={disabled}
                        >
                            {section.addLabel}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}