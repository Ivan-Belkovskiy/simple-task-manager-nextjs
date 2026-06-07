'use client';

import { Category, Notification, Priority, Task, User } from "@/app/page";
import "./TaskEditorModal.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import { useEffect, useState } from "react";
import { createTask, createTaskNew, updateTask } from "@/app/actions";
import UserListModal from "../UserListModal/UserListModal";
import CustomSelect from "../CustomSelect/CustomSelect";
import CategoryListModal from "../CategoryListModal/CategoryListModal";
import { formatHourTextForNotification, getLocalDateString } from "@/utils/datetime";
import InteractiveList from "../InteractiveList/InteractiveList";

export interface EditingTaskData {
    name: string;
    description: string | null;
    priority?: number | null;
    category?: number | string;
    users: (string | number)[];
    completeBefore?: string;
    notifications?: Notification[]
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

    const initEditingData = (data: Task): EditingTaskData => ({
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
        notifications: data.task_notifications
        // completeBefore: data.complete_before_date,
    });

    const removeNotification = (id: number) => {
        setEditingData(p => ({
            ...p,
            notifications: p.notifications?.filter((_, i) => i !== id),
        }));
    }

    const addNotification = () => {
        const lastNotification = editingData.notifications?.[
            (editingData.notifications.length - 1)
        ];
        if ((lastNotification?.hour_offset && lastNotification.hour_offset > 1) || editingData.notifications?.length === 0) setEditingData((p: any) => {
            // return p;
            return (p.notifications) ? ({
                ...p,
                notifications: [...p.notifications, {
                    hour_offset: (
                        (lastNotification?.hour_offset) ? (lastNotification.hour_offset - 1) : 5
                    )
                }]
            }) : editingData;
        });
    }

    // const handleNotificationChange = (index: number, newValue: number) => {
    //     const val = Number(newValue);

    //     setEditingData(prev => {
    //         if (!prev.notifications) return prev;

    //         const newNotifications = [...prev.notifications];

    //         newNotifications[index] = {
    //             ...newNotifications[index],
    //             hour_offset: val
    //         };

    //         return {
    //             ...prev,
    //             notifications: newNotifications
    //         };
    //     });
    // };

    const handleNotificationChange = (index: number, newValue: number) => {
        setEditingData(prev => {
            if (!prev.notifications) return prev;

            const newNotifications = [...prev.notifications];
            let val = Number(newValue);

            val = Math.max(1, val);

            const prevNotification = newNotifications[index - 1];
            const current = newNotifications[index];
            const nextNotification = newNotifications[index + 1];

            if (prevNotification?.hour_offset) {
                val = Math.min(val, prevNotification.hour_offset - 1);
            }

            // if (nextNotification?.hour_offset) {

            for (let i = (index + 1); i < newNotifications.length; i++) {

                const c = prev.notifications[i - 1];
                const n = prev.notifications[i];

                const last = prev.notifications[
                    prev.notifications.length - 1
                ];

                if (
                    (c?.hour_offset && n?.hour_offset && current?.hour_offset) &&
                    ((newValue - current.hour_offset) < 0) &&
                    (n.hour_offset >= (c.hour_offset - (
                        (i === (index + 1)) ? 1 : 0
                    )))
                ) {
                    if (
                        last?.hour_offset && (last.hour_offset > 1)
                    ) {
                        n.hour_offset -= 1;
                    } else val = current.hour_offset;
                }

            }
            // val = Math.max(val, nextNotification.hour_offset + 1);
            // }



            if (newNotifications[index].hour_offset !== val) {
                newNotifications[index] = {
                    ...newNotifications[index],
                    hour_offset: val
                };
            }

            return { ...prev, notifications: newNotifications };
        });
    };

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
                    <div className="task-editor-modal__block complete-before-datetime-block">
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

                    <div className="add-task-modal__block notification-settings">
                        <h1>Настройки уведомления</h1>
                        <div className="notification-settings__notification-list">
                            {editingData.notifications?.map((n, idx) => (
                                <div className="notification-settings__notification" key={idx}>
                                    <span className="notification-settings__number">{idx + 1}-й раз</span>
                                    <div className="notification-settings__block">
                                        <span className="notification-settings__label --desktop-only">Напомнить за</span>
                                        <span className="notification-settings__label --mobile-only">За</span>
                                        <input
                                            type="number"
                                            className="notification-settings__input"
                                            value={n?.hour_offset || 0}
                                            disabled={n.activated}
                                            onChange={(e) => handleNotificationChange(idx, Number(e.target.value))}
                                        />
                                        <span className="notification-settings__label">{formatHourTextForNotification(n.hour_offset || 0)}</span>
                                    </div>
                                    <div className={`notification-settings__block ${n.activated ? 'status-activated' : 'status-waiting'}`}>
                                        <span className="notification-settings__label --desktop-only">{(n.activated ? "Активировано" : "Ожидается...")}</span>
                                        <span className="notification-settings__label --mobile-only">{(n.activated ? "✔" : "🕑")}</span>
                                    </div>
                                    {(!n.activated) && <button
                                        className="notification-settings__button remove-notification-btn"
                                        onClick={() => removeNotification(idx)}
                                    >
                                        <span className="--desktop-only">Удалить</span>
                                        <span className="--mobile-only">⨉</span>
                                    </button>}
                                </div>
                            ))}
                            <button
                                className="notification-settings__button add-button"
                                onClick={() => addNotification()}
                            >Добавить напоминание</button>
                        </div>
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