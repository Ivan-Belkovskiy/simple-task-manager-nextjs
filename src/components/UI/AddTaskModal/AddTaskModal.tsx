'use client';


import { getLocalDateString } from "@/utils/date";
import { Category, Priority, Task, User } from "@/app/page";
import "./AddTaskModal.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import { useState } from "react";
import { createTask } from "@/app/actions";
import UserListModal from "../UserListModal/UserListModal";
import CustomSelect from "../CustomSelect/CustomSelect";
import CategoryListModal from "../CategoryListModal/CategoryListModal";

export default function AddTaskModal({ categories, priorities, users, onClose }: {
    categories: Category[];
    priorities: Priority[];
    users: User[];
    onClose?: () => void;
}) {
    
    const [isLoading, setLoading] = useState(false);

    const [userModalOpened, setUserModalOpened] = useState(false);
    const [categoryModalOpened, setCategoryModalOpened] = useState(false);

    const onAddTask = async () => {
        setLoading(true);
        // if (
        //     !newTaskData.name ||
        //     !newTaskData.priority ||
        //     !newTaskData.users ||
        //     !newTaskData.completeBefore
        // ) return;
        const formData = new FormData();
        formData.append("name", newTaskData.name);
        formData.append("description", newTaskData.description);
        formData.append("priorityId", String(newTaskData.priority));
        formData.append("categoryId", String(newTaskData.category));
        formData.append("completeBeforeDate", String(newTaskData.completeBefore));

        await createTask(formData, newTaskData.users.map(v => Number(v)));

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
        priority: 0,
        category: 0,
        completeBefore: getLocalDateString(new Date()),
    });

    const [newTaskData, setNewTaskData] = useState<{
        name: string,
        description: string,
        priority?: number,
        category?: string | number,
        users: (string | number)[],
        completeBefore?: string
        // complete_before_date: 
    }>({
        ...initialTaskData,
        // name: '',
        // description: '',
        // users: [],
    });

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
                    <div className="add-task-modal__block">
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
                    </div>
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
                    <div className="add-task-modal__block">
                        <span className="add-task-modal__label">Ответственный за выполнение:</span>
                        <MultiSelect
                            className="add-task-modal__select"
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
                    </div>
                    <div className="add-task-modal__block">
                        <span className="add-task-modal__label">Выполнить до:</span>
                        <input
                            type="date"
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
                                    })
                                }
                            }}
                        />
                    </div>
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