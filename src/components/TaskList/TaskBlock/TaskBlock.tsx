import { completeTask, deleteTask } from "@/app/actions";
import "./TaskBlock.css";
import { Category, Priority, Task, User } from "@/app/page";
import { useState } from "react";
import SimpleModal from "@/components/UI/SimpleModal/SimpleModal";
import TaskEditorModal from "@/components/UI/TaskEditorModal/TaskEditorModal";


export default function TaskBlock({ idx, data, categories, users, priorities }: { idx: number, data: Task, categories: Category[], users: User[], priorities: Priority[] }) {

    const [openedModal, setOpenedModal] = useState<"confirm-delete" | "confirm-complete" | "edit-task" | null>(null);

    const confirmDeleteTask = async () => {
        if (!data.id) return;

        await deleteTask(data.id);
    }

    const confirmCompleteTask = async () => {
        if (!data.id) return;

        await completeTask(data.id);
    }

    return (
        <div className="task-block">
            <div className="task-block__left">
                <span className="task-block__idx">{idx + 1}</span>
                <span className="task-block__name">{data.name}</span>
            </div>
            <div className="task-block__right">
                <div className="task-block__infobox">
                    <span className="task-block__infobox-label">Приоритет</span>
                    <span className="task-block__infobox-value" style={{
                        color: (data.task_priorities?.display_color || '')
                    }}>{data.task_priorities?.name}</span>
                </div>

                <div className="task-block__infobox">
                    <span className="task-block__infobox-label">Категория</span>
                    <span className="task-block__infobox-value">{data.task_categories?.name || " — "}</span>
                </div>

                <div className="task-block__infobox users-infobox">
                    {data.task_users.map((user, i) => (
                        <div className="task-block__user" key={i}>{user.users.name}</div>
                    ))}
                </div>

                <div className="task-block__infobox">
                    <div className="task-block__infobox-label">Создана</div>
                    <div className="task-block__infobox-value">{data.created_at?.toLocaleDateString('ru-RU')}</div>
                    {(data.completed) ? (
                        <>
                            <hr />
                            <div className="task-block__infobox-label">Выполнена</div>
                            <div className="task-block__infobox-value">{data.completed_at?.toLocaleDateString('ru-RU')}</div>
                        </>
                    ) : (data.complete_before_date) && (
                        <>
                            <hr />
                            <div className="task-block__infobox-label complete-before-date">Выполнить до</div>
                            <div className="task-block__infobox-value complete-before-date">{data.complete_before_date?.toLocaleDateString('ru-RU')}</div>
                        </>
                    )}
                </div>

                <div className="task-block__buttons">
                    <button
                        className={`task-block__button complete-btn ${(data.completed) ? 'completed' : ''}`}
                        onClick={() => {
                            if (!data.completed) setOpenedModal('confirm-complete');
                        }}
                    >{data.completed ? 'Выполнена' : 'Выполнить'}</button>
                    <button
                        className={`task-block__button edit-btn`}
                        onClick={() => setOpenedModal('edit-task')}
                    >Редактировать</button>
                    <button
                        className={`task-block__button delete-btn`}
                        onClick={() => setOpenedModal('confirm-delete')}
                    >Удалить</button>
                </div>
            </div>

            {(openedModal === 'confirm-delete') && (
                <SimpleModal title={`Удалить задачу "${data.name}"?`} buttons={[
                    {
                        text: "Отмена",
                        className: "task-block__button cancel-delete-btn",
                        onClick: () => setOpenedModal(null),
                    },
                    {
                        text: "Подтвердить",
                        className: "task-block__button confirm-delete-btn",
                        onClick: () => confirmDeleteTask(),
                    }
                ]} styles={{
                    title: {
                        color: '#ff0000'
                    },
                    modal: {
                        border: '8px solid #ff0000',
                        borderRadius: '15px',
                        width: '50%',
                        height: '30%'
                    }
                }} />
            )}

            {(openedModal === 'confirm-complete') && (
                <SimpleModal title={`Выполнить задачу "${data.name}"?`} buttons={[
                    {
                        text: "Отмена",
                        className: "task-block__button cancel-complete-btn",
                        onClick: () => setOpenedModal(null),
                    },
                    {
                        text: "Подтвердить",
                        className: "task-block__button confirm-complete-btn",
                        onClick: () => confirmCompleteTask(),
                    }
                ]} styles={{
                    title: {
                        color: '#129b00'
                    },
                    modal: {
                        border: '8px solid #17c900',
                        borderRadius: '15px',
                        width: '50%',
                        height: '30%'
                    }
                }} />
            )}

            {(openedModal === 'edit-task') && (
                <TaskEditorModal
                    taskData={data}
                    categories={categories}
                    users={users}
                    priorities={priorities}
                    onClose={() => setOpenedModal(null)}
                />
            )}
        </div>
    );
}