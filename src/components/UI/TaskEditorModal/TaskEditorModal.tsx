'use client';

import { Category, Priority, Task, User } from "@/app/page";
import "./TaskEditorModal.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import { useEffect, useState } from "react";
import { createTask, createTaskNew, updateTask } from "@/app/actions";
import UserListModal from "../UserListModal/UserListModal";
import CustomSelect from "../CustomSelect/CustomSelect";
import CategoryListModal from "../CategoryListModal/CategoryListModal";
import { getLocalDateString } from "@/utils/date";
import InteractiveList from "../InteractiveList/InteractiveList";

export interface EditingTaskData {
    name: string,
    description: string | null,
    priority?: number | null,
    category?: number | string,
    users: (string | number)[],
    completeBefore?: string
}

export default function TaskEditorModal({ taskData, categories, priorities, users, onClose }: {
    taskData: Task;
    categories: Category[];
    priorities: Priority[];
    users: User[];
    onClose?: () => void;
}) {

    const [isLoading, setLoading] = useState(false);

    const [userModalOpened, setUserModalOpened] = useState(false);
    const [categoryModalOpened, setCategoryModalOpened] = useState(false);

    const confirmChanges = async () => {
        setLoading(true);
        // if (
        //     !newTaskData.name ||
        //     !newTaskData.priority ||
        //     !newTaskData.users ||
        //     !newTaskData.completeBefore
        // ) return;
        // const formData = new FormData();
        // formData.append("name", editingData.name);
        // formData.append("description", (editingData.description));
        // formData.append("priorityId", String(editingData.priority));
        // formData.append("categoryId", String(editingData.category));
        // formData.append("completeBeforeDate", String(editingData.completeBefore));

        if (taskData.completed || taskData.rejected) {
            await createTaskNew({
                ...editingData,
                completeBefore: editingData.completeBefore ? new Date(editingData.completeBefore).toISOString() : undefined
            });
        } else {
            await updateTask(taskData.id, {
                ...editingData,
                completeBefore: editingData.completeBefore ? new Date(editingData.completeBefore).toISOString() : undefined
            });
        }

        // await createTask(formData, editingData.users.map(v => Number(v)));

        // setEditingData({
        //     name: '',
        //     description: '',
        //     users: [],
        // });
        setLoading(false);

        onClose?.();
    }

    const [editingData, setEditingData] = useState<EditingTaskData>({
        name: '',
        description: '',
        users: [],
    });

    const initEditingData = (data: Task) => ({
        name: data.name,
        description: data.description,
        priority: data.priority_id,
        category: data.category_id || "[[NONE]]",
        users: data.task_users.map(i => i.users.id),
        completeBefore: (taskData.completed || taskData.rejected) ? (
            getLocalDateString(new Date())
        ) : (
            data.complete_before_date
                ? getLocalDateString(
                    new Date(data.complete_before_date)
                )
                : ""
        ),
        // completeBefore: data.complete_before_date,
    })

    useEffect(() => {
        setEditingData(
            initEditingData(taskData)
        )
    }, [taskData]);

    return (
        <div className={`task-editor-modal__overlay ${(taskData.completed || taskData.rejected) ? 'reupload-mode' : ''}`}>
            <div className="task-editor-modal">
                <div className="task-editor-modal__header">
                    <h1 className="task-editor-modal__title">{(taskData.completed || taskData.rejected) ? "Повторное создание задачи" : "Редактировать задачу"}</h1>
                    <button className="task-editor-modal__button close-modal-btn" onClick={() => {
                        setEditingData({
                            name: '',
                            description: '',
                            users: [],
                        });
                        onClose?.();
                    }}>⨉</button>
                </div>
                <div className="task-editor-modal__content">
                    <div className="task-editor-modal__block">
                        <span className="task-editor-modal__label">Название:</span>
                        <input
                            type="text"
                            className="task-editor-modal__input task-name-input"
                            value={editingData.name}
                            onChange={(e) => setEditingData({
                                ...editingData,
                                name: e.target.value
                            })}
                        />
                    </div>
                    <div className="task-editor-modal__block">
                        <span className="task-editor-modal__label">Описание:</span>
                        <textarea
                            className="task-editor-modal__input task-name-input"
                            value={editingData.description || ""}
                            onChange={(e) => setEditingData({
                                ...editingData,
                                description: e.target.value
                            })}
                        />
                    </div>
                    <div className="task-editor-modal__block">
                        <span className="task-editor-modal__label">Приоритет:</span>
                        <select
                            className="task-editor-modal__select task-priority-select"
                            value={editingData.priority || ''}
                            onChange={(e) => setEditingData({
                                ...editingData,
                                priority: Number(e.target.value)
                            })}
                            style={{
                                color: (priorities.find(p => p.id === editingData.priority)?.display_color || '')
                            }}
                        >
                            {priorities.map(p => (
                                <option key={p.id} value={p.id} style={{ color: p.display_color || '' }}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="task-editor-modal__block">
                        <span className="task-editor-modal__label">Категория:</span>
                        <CustomSelect
                            className="task-editor-modal__select task-category-select"
                            value={editingData.category || "[[NONE]]"}
                            onSelect={(newVal) => setEditingData({
                                ...editingData,
                                category: (newVal)
                            })}
                            options={[
                                {
                                    label: '—',
                                    value: '[[NONE]]',

                                },
                                ...categories.map(c => ({
                                    // type: 'default',
                                    label: c.name,
                                    value: c.id,
                                })),
                                {
                                    label: 'Добавить категорию...',
                                    value: 'addCategory',
                                    type: 'button',
                                    btnCallback: () => setCategoryModalOpened(true)
                                }
                            ]}
                        />

                    </div>
                    <div className="task-editor-modal__block --desktop-only">
                        <span className="task-editor-modal__label">Ответственный за выполнение:</span>
                        <MultiSelect
                            className="task-editor-modal__select task-user-select"
                            value={editingData.users}
                            onSelect={(newValue) => setEditingData({
                                ...editingData,
                                users: newValue,
                            })}
                            options={[
                                ...users.map(user => ({
                                    label: user.name,
                                    value: user.id,
                                })),
                                {
                                    label: "Добавить пользователя...",
                                    value: "[[ADD]]",
                                    type: "button",
                                    btnCallback: () => setUserModalOpened(true)
                                }
                            ]}
                        />
                    </div>
                    <div className="task-editor-modal__block flex-col --mobile-only">
                        <span className="task-editor-modal__label">Ответственный за выполнение:</span>

                        <InteractiveList
                            className="task-editor-modal__list task-user-list"
                            value={editingData.users}
                            onSelect={(newValue) => setEditingData({
                                ...editingData,
                                users: newValue,
                            })}
                            options={[
                                ...users.map(user => ({
                                    label: user.name,
                                    value: user.id,
                                })),
                                {
                                    label: "Добавить пользователя...",
                                    value: "[[ADD]]",
                                    type: "button",
                                    btnCallback: () => setUserModalOpened(true)
                                }
                            ]}
                        />
                    </div>
                    <div className="task-editor-modal__block">
                        <span className="task-editor-modal__label">Выполнить до:</span>
                        <input
                            type="datetime-local"
                            min={getLocalDateString(new Date())}
                            className="task-editor-modal__input"
                            value={editingData.completeBefore || ""}
                            onChange={(e) => {
                                const today = getLocalDateString(new Date());
                                if (
                                    e.target.value >= today
                                    // new Date(e.target.value).getTime() > new Date().getTime()
                                ) {
                                    setEditingData({
                                        ...editingData,
                                        completeBefore: e.target.value
                                    });
                                } else setEditingData({
                                    ...editingData,
                                    completeBefore: today
                                });
                            }}
                        />
                    </div>
                    {(taskData.completed || taskData.rejected) && (
                        <div className="task-editor-modal__block">
                            <div className="task-editor-modal__notification reupload-task-notification">ПРИМЕЧАНИЕ: Будет создана <b>отдельная</b> новая задача с введенными выше настройками, которая <b>не будет иметь связи</b> с данной выполненной задачей!</div>
                        </div>
                    )}
                </div>
                <div className="task-editor-modal__buttons">
                    {(taskData.completed || taskData.rejected) ? (
                        <button disabled={isLoading} className="task-editor-modal__button confirm-reupload-button" onClick={() => confirmChanges()}>Создать задачу повторно</button>
                    ) : (
                        <>
                            <button disabled={isLoading} className="task-editor-modal__button cancel-edit-button" onClick={() => onClose?.()}>Отменить изменения</button>
                            <button disabled={isLoading} className="task-editor-modal__button confirm-edit-button" onClick={() => confirmChanges()}>Сохранить изменения</button>
                        </>
                    )}
                </div>
            </div>

            {(userModalOpened) && (
                <UserListModal users={users} onClose={() => setUserModalOpened(false)} />
            )}

            {(categoryModalOpened) && (
                <CategoryListModal categories={categories} onClose={() => setCategoryModalOpened(false)} />
            )}
        </div>
    );
}