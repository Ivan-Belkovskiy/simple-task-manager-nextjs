'use client';

import { useState } from 'react';
import './TaskManagementModal.css';
import { MODE_CONFIG } from './modes';
import { useTaskForm } from './useTaskForm';
import { useNotifications } from './useNotifications';
import { TaskManagementModalProps } from './types';
import TaskFormFields from './TaskFormFields';
import NotificationSettings from './NotificationSettings';
import UserListModal from '../UserListModal/UserListModal';
import CategoryListModal from '../CategoryListModal/CategoryListModal';
import SimpleModal from '../NEW/SimpleModal/SimpleModal';

export default function TaskManagementModal({
    mode, taskData, categories, priorities, users, onClose,
}: TaskManagementModalProps) {
    const config = MODE_CONFIG[mode];
    const form = useTaskForm(mode, priorities, taskData);
    const notificationOps = useNotifications(form.setNotifications);

    const [userModalOpened, setUserModalOpened] = useState(false);
    const [categoryModalOpened, setCategoryModalOpened] = useState(false);

    const handleClose = () => {
        form.reset();
        onClose?.();
    };

    const handleSubmit = async () => {
        const ok = await form.submit(config.validate);
        if (ok) handleClose();
    };

    return (
        <div className={`task-management-modal__overlay ${config.themeClass}`}>
            <div className="task-management-modal">
                <header className="task-management-modal__header">
                    <h1 className="task-management-modal__title">{config.title}</h1>
                    <button
                        className="task-management-modal__button close-modal-btn"
                        onClick={handleClose}
                    >⨉</button>
                </header>

                <div className="task-management-modal__content">
                    <TaskFormFields
                        mode={mode}
                        data={form.data}
                        setData={form.setData}
                        errors={form.errors}
                        setErrors={form.setErrors}
                        showIsCompleted={config.showIsCompleted}
                        categories={categories}
                        priorities={priorities}
                        users={users}
                        onOpenUserModal={() => setUserModalOpened(true)}
                        onOpenCategoryModal={() => setCategoryModalOpened(true)}

                        subtasks={form.data.subtasks}
                        onSubtasksChange={(subtasks) => form.setData(p => ({ ...p, subtasks }))}

                        items={form.data.items}                                           
                        onItemsChange={(items) => form.setData(p => ({ ...p, items }))}   
                    />

                    {!form.data.disableCompleteBeforeDate && !form.data.isCompleted && (
                        <NotificationSettings
                            mode={mode}
                            notifications={form.notifications}
                            onAdd={notificationOps.add}
                            onRemove={notificationOps.remove}
                            onUpdate={notificationOps.update}
                        />
                    )}

                    {config.showReuploadNote && (
                        <div className="task-management-modal__block">
                            <div className="task-management-modal__notification reupload-task-notification">
                                ПРИМЕЧАНИЕ: Будет создана <b>отдельная</b> новая задача с введёнными выше настройками,
                                которая <b>не будет иметь связи</b> с данной выполненной задачей!
                            </div>
                        </div>
                    )}
                </div>

                <footer className="task-management-modal__buttons">
                    {config.showCancel && (
                        <button
                            disabled={form.isLoading}
                            className="task-management-modal__button cancel-btn"
                            onClick={handleClose}
                        >{config.cancelLabel}</button>
                    )}
                    <button
                        disabled={form.isLoading}
                        className="task-management-modal__button confirm-btn"
                        onClick={handleSubmit}
                    >{config.confirmLabel}</button>
                </footer>
            </div>

            {userModalOpened && <UserListModal users={users} onClose={() => setUserModalOpened(false)} />}
            {categoryModalOpened && <CategoryListModal categories={categories} onClose={() => setCategoryModalOpened(false)} />}

            
        </div>
    );
}