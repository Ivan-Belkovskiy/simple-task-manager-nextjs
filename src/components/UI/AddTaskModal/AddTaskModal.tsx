'use client';


import { formatHourTextForNotification, getLocalDateString } from "@/utils/datetime";
import { Category, Priority, Task, User } from "@/app/page";
import "./AddTaskModal.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import { useState } from "react";
import { createTask } from "@/app/actions";
import UserListModal from "../UserListModal/UserListModal";
import CustomSelect from "../CustomSelect/CustomSelect";
import CategoryListModal from "../CategoryListModal/CategoryListModal";
import InteractiveList from "../InteractiveList/InteractiveList";
import ErrorBlock from "./ErrorBlock/ErrorBlock";

// interface ValidationError {
//     errorText: string;
// }

interface ValidationErrors {
    name: boolean | null;
    users: boolean | null;
}

export default function AddTaskModal({ categories, priorities, users, onClose }: {
    categories: Category[];
    priorities: Priority[];
    users: User[];
    onClose?: () => void;
}) {

    const [isLoading, setLoading] = useState(false);

    const [userModalOpened, setUserModalOpened] = useState(false);
    const [categoryModalOpened, setCategoryModalOpened] = useState(false);

    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
        name: null,
        users: null
    });

    const onAddTask = async () => {
        // if (
        //     !newTaskData.name ||
        //     !newTaskData.priority ||
        //     !newTaskData.users ||
        //     !newTaskData.completeBefore
        // ) return;

        const completeBeforeDate = new Date(newTaskData.completeBefore!).toISOString();

        const formData = new FormData();
        formData.append("name", newTaskData.name);
        formData.append("description", newTaskData.description);
        formData.append("priorityId", String(newTaskData.priority));
        formData.append("categoryId", String(newTaskData.category));

        if (!newTaskData.disableCompleteBeforeDate) formData.append("completeBeforeDate", completeBeforeDate);

        setValidationErrors(p => ({
            ...p,
            name: (newTaskData.name.length === 0),
            users: (newTaskData.users.length === 0)
        }));

        if (newTaskData.name.length === 0) return;
        if (newTaskData.users.length === 0) return;

        setLoading(true);

        await createTask(formData, newTaskData.users.map(v => Number(v)), (
            (newTaskData.disableCompleteBeforeDate) ? [] : notifications
        ));

        setNewTaskData({
            ...initialTaskData,
            // name: '',
            // description: '',
            // users: [],
        });

        setLoading(false);

        onClose?.();
    }


    const initialTaskData = ({
        name: '',
        description: '',
        users: [],
        priority: priorities[0].id,
        category: '[[NONE]]',
        completeBefore: getLocalDateString(new Date()),
    });

    const [notifications, setNotifications] = useState<{ offset: number }[]>([]);

    const [newTaskData, setNewTaskData] = useState<{
        name: string,
        description: string,
        priority?: number,
        category?: string | number,
        users: (string | number)[],
        completeBefore?: string,
        disableCompleteBeforeDate?: boolean,
        // complete_before_date: 
    }>({
        ...initialTaskData,
        // name: '',
        // description: '',
        // users: [],
    });

    const addNotification = () => {

        if ((notifications[
            (notifications.length - 1)
        ]?.offset > 1) || notifications.length === 0) setNotifications([...notifications, {
            offset: (
                notifications[notifications.length - 1] ? (notifications[notifications.length - 1].offset - 1) : 5
            )
        }]);
    }

    const removeNotification = (id: number) => {
        setNotifications(p =>
            p.filter((_, i) => i !== id)
        );
    }

    return (
        <div className="add-task-modal__overlay">
            <div className="add-task-modal">
                <div className="add-task-modal__header">
                    <h1 className="add-task-modal__title">Добавить задачу</h1>
                    <button className="add-task-modal__button close-modal-btn" onClick={() => {
                        setNewTaskData({
                            ...initialTaskData,
                            // name: '',
                            // description: '',
                            // users: [],
                        });
                        onClose?.();
                    }}>⨉</button>
                </div>
                <div className="add-task-modal__content">
                    <ErrorBlock text={"Введите название задачи!"} displayError={validationErrors.name} className="add-task-modal__error-block" >
                        <div className="add-task-modal__block">
                            <span className="add-task-modal__label">Название:</span>
                            <input
                                type="text"
                                className="add-task-modal__input task-name-input"
                                value={newTaskData.name}
                                onChange={(e) => {
                                    if (validationErrors.name) setValidationErrors(p => ({
                                        ...p,
                                        name: false
                                    }));
                                    setNewTaskData({
                                        ...newTaskData,
                                        name: e.target.value
                                    });
                                }}
                            />
                        </div>
                    </ErrorBlock>
                    {/* <div className="add-task-modal__block">
                        <span className="add-task-modal__label">Название:</span>
                        <input
                            type="text"
                            className="add-task-modal__input task-name-input"
                            value={newTaskData.name}
                            onChange={(e) => setNewTaskData({
                                ...newTaskData,
                                name: e.target.value
                            })}
                        />
                    </div> */}
                    <div className="add-task-modal__block">
                        <span className="add-task-modal__label">Описание:</span>
                        <textarea
                            className="add-task-modal__input task-name-input"
                            value={newTaskData.description}
                            onChange={(e) => setNewTaskData({
                                ...newTaskData,
                                description: e.target.value
                            })}
                        />
                    </div>
                    <div className="add-task-modal__block">
                        <span className="add-task-modal__label">Приоритет:</span>
                        <select
                            className="add-task-modal__select task-priority-select"
                            value={newTaskData.priority || ''}
                            onChange={(e) => setNewTaskData({
                                ...newTaskData,
                                priority: Number(e.target.value)
                            })}
                            style={{
                                color: (priorities.find(p => p.id === newTaskData.priority)?.display_color || '')
                            }}
                        >
                            {priorities.map(p => (
                                <option key={p.id} value={p.id} style={{ color: p.display_color || '' }}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="add-task-modal__block">
                        <span className="add-task-modal__label">Категория:</span>
                        <CustomSelect
                            className="add-task-modal__select task-category-select"
                            value={newTaskData.category}
                            onSelect={(newVal) => setNewTaskData({
                                ...newTaskData,
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
                        {/* <select
                            className="add-task-modal__select task-category-select"
                            value={newTaskData.category}
                            onChange={(e) => setNewTaskData({
                                ...newTaskData,
                                category: (e.target.value !== '[[NONE]]') ? Number(e.target.value) : undefined
                            })}
                        >
                            <option value="[[NONE]]">—</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select> */}
                    </div>
                    <ErrorBlock text={"Добавьте минимум одного пользователя!"} displayError={validationErrors.users} className="add-task-modal__error-block" >
                        <div className="add-task-modal__block --desktop-only">
                            <span className="add-task-modal__label">Ответственный за выполнение:</span>
                            <MultiSelect
                                className="add-task-modal__select task-user-select"
                                value={newTaskData.users}
                                onSelect={(newValue) => {
                                    if (validationErrors.users) setValidationErrors(p => ({
                                        ...p,
                                        users: false
                                    }));
                                    setNewTaskData({
                                        ...newTaskData,
                                        users: newValue,
                                    });
                                }}
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

                        <div className="add-task-modal__block flex-col --mobile-only">
                            <span className="add-task-modal__label">Ответственный за выполнение:</span>

                            <InteractiveList
                                className="add-task-modal__list task-user-list"
                                value={newTaskData.users}
                                onSelect={(newValue) => {
                                    if (validationErrors.users) setValidationErrors(p => ({
                                        ...p,
                                        users: false
                                    }));
                                    setNewTaskData({
                                        ...newTaskData,
                                        users: newValue,
                                    });
                                }}
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
                    </ErrorBlock>

                    {/* <div className="add-task-modal__block flex-col --mobile-only">
                        <span className="add-task-modal__label">Ответственный за выполнение:</span>

                        <InteractiveList
                            className="add-task-modal__list task-user-list"
                            value={newTaskData.users}
                            onSelect={(newValue) => setNewTaskData({
                                ...newTaskData,
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
                    </div> */}
                    <div className="add-task-modal__block complete-before-datetime-block">
                        <span className="add-task-modal__label">Выполнить до:</span>
                        {(!newTaskData.disableCompleteBeforeDate) && (
                            <input
                                type="datetime-local"
                                className="add-task-modal__input"
                                min={getLocalDateString(new Date())}
                                value={newTaskData.completeBefore || ""}
                                onChange={(e) => {
                                    const today = getLocalDateString(new Date());
                                    if (
                                        e.target.value >= today
                                        // new Date(e.target.value).getTime() > new Date().getTime()
                                    ) {
                                        setNewTaskData({
                                            ...newTaskData,
                                            completeBefore: e.target.value
                                        });
                                    } else setNewTaskData({
                                        ...newTaskData,
                                        completeBefore: today,
                                    })
                                }}
                            />
                        )}

                        <div className="--desktop-only" style={{ gap: 'inherit' }}>
                            <span className="add-task-modal__label">Не указывать дату</span>
                            <input type="checkbox" checked={newTaskData.disableCompleteBeforeDate} onChange={(e) => setNewTaskData(p => ({
                                ...p,
                                disableCompleteBeforeDate: e.target.checked,
                            }))} />
                        </div>

                        {/* <input type="datetime-local" className="add-task-modal__input" /> */}
                    </div>
                    <div className="add-task-modal__block --mobile-only">
                        <span className="add-task-modal__label">Не указывать дату</span>
                        <input type="checkbox" checked={newTaskData.disableCompleteBeforeDate} onChange={(e) => setNewTaskData(p => ({
                            ...p,
                            disableCompleteBeforeDate: e.target.checked,
                        }))} />
                    </div>
                    {!newTaskData.disableCompleteBeforeDate && (
                        <div className="add-task-modal__block notification-settings">
                            <h1>Настройки уведомления</h1>
                            <div className="notification-settings__notification-list">
                                {notifications.map((n, idx) => (
                                    <div className="notification-settings__notification" key={idx}>
                                        <span className="notification-settings__number">{idx + 1}-й раз</span>
                                        <div className="notification-settings__block">
                                            <span className="notification-settings__label --desktop-only">Напомнить за</span>
                                            <span className="notification-settings__label --mobile-only">За</span>
                                            <input
                                                type="number"
                                                className="notification-settings__input"
                                                value={n?.offset}
                                                onChange={(e) => {
                                                    let value = (Number(e.target.value) < ((notifications[idx - 1]?.offset - 1) || 48)) ?
                                                        Number(e.target.value) : ((notifications[idx - 1]?.offset - 1) || 0);
                                                    // setNotifications(p => (
                                                    //     p.map((nt, i) => i === idx ? { ...nt, offset: Number(value) } : nt)
                                                    // ));

                                                    setNotifications(p => (
                                                        p.map((nt, i) => i === idx ? (
                                                            (
                                                                value - p[idx].offset < 0 && (
                                                                    p[idx].offset - p[idx + 1]?.offset < 2
                                                                )
                                                            ) ? {
                                                                ...nt, offset: (
                                                                    (p[p.length - 1]?.offset > 1) ? Number(value) : nt.offset
                                                                )
                                                            } : { ...nt, offset: (value < 1 ? 1 : Number(value)) }
                                                        ) : (i > idx) ? {
                                                            ...nt,
                                                            offset: ((p[i - 1] && (nt.offset + 1) >= ((p[i - 1].offset - 1))) && (
                                                                value - p[idx].offset < 0 &&
                                                                p[p.length - 1]?.offset > 1
                                                            )) ? (p[i - 1].offset - 2) : nt.offset
                                                        } : nt)
                                                    ));
                                                }}
                                            />
                                            <span className="notification-settings__label">{formatHourTextForNotification(n.offset)}
                                                <span className="--desktop-only"> до окончания периода</span>
                                            </span>
                                        </div>
                                        <button
                                            className="notification-settings__button remove-notification-btn"
                                            onClick={() => removeNotification(idx)}
                                        >
                                            <span className="--desktop-only">Удалить</span>
                                            <span className="--mobile-only">⨉</span>
                                        </button>
                                    </div>
                                ))}
                                <button
                                    className="notification-settings__button add-button"
                                    onClick={() => addNotification()}
                                >Добавить напоминание</button>
                            </div>
                        </div>
                    )}
                    {/* <select className="add-task-modal__select">
                        {Array(40).fill('', 0, 40).map((_, n) => (
                            <option value={n} key={n}>Option #{n + 1}</option>
                        ))}
                    </select> */}
                    {/* <div className="add-task-modal__block">
                        <button className="add-task-modal__button add-task-button" onClick={() => onAddTask()}>Добавить задачу</button>
                    </div> */}
                </div>
                <div className="add-task-modal__buttons">
                    <button disabled={isLoading} className="add-task-modal__button add-task-button" onClick={() => onAddTask()}>Добавить задачу</button>
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