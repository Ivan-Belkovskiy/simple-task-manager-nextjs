import { completeTask, deleteTask } from "@/app/actions";
import "./TaskBlock.css";
import { Category, Priority, Task, User } from "@/app/page";
import { Dispatch, RefObject, SetStateAction, useRef, useState } from "react";
import SimpleModal from "@/components/UI/SimpleModal/SimpleModal";
import TaskEditorModal from "@/components/UI/TaskEditorModal/TaskEditorModal";
import SimpleDropdown from "@/components/UI/SimpleDropdown/SimpleDropdown";
import TaskInfoModal from "@/components/UI/TaskInfoModal/TaskInfoModal";
import TextHighlight from "@/components/UI/TextHighlight/TextHighlight";
import { getLocalDatetimeString } from "@/utils/datetime";


export default function TaskBlock({ isEditMode, idx, data, categories, users, priorities, bodyRef, filterString = "" }: { isEditMode?: RefObject<boolean>, idx: number, data: Task, categories: Category[], users: User[], priorities: Priority[], filterString?: string; bodyRef?: RefObject<HTMLElement | null> }) {

    const [isLoading, setLoading] = useState(false);

    const [isExpanded, setExpanded] = useState(false);

    const [openedModal, setOpenedModal] = useState<"confirm-delete" | "confirm-complete" | "edit-task" | null>(null);

    const updateOpenedModal = (value: "confirm-delete" | "confirm-complete" | "edit-task" | null) => {
        setOpenedModal(value);
        if (isEditMode) isEditMode.current = (
            value ? true : false
        );
    }

    const confirmDeleteTask = async () => {
        if (!data.id) return;

        setLoading(true);
        await deleteTask(data.id);
        setLoading(false);

        updateOpenedModal(null);
    }

    const confirmCompleteTask = async () => {
        if (!data.id) return;

        setLoading(true);
        await completeTask(data.id);
        setLoading(false);

        updateOpenedModal(null);
    }

    return (
        <div className={`task-block ${(isExpanded ? 'expanded' : '')} ${data.completed ? 'completed' : ''} ${data.rejected ? 'rejected' : ''}`}>
            <div className="task-block__left">
                <span className="task-block__idx">{idx + 1}</span>
                <div className="task-block__info">
                    <span className="task-block__name">
                        <TextHighlight text={data.name} highlight={filterString} />
                        {/* {data.name} */}
                    </span>
                    <div
                        className={`task-block__description`}
                        onClick={() => setExpanded(p => !p)}
                    >{data.description}</div>
                </div>
                {/* <span className="task-block__name">{data.name}</span> */}
            </div>
            <div className="task-block__right">
                <div className="task-block__infobox">
                    <span className="task-block__infobox-label">Приоритет</span>
                    <span className="task-block__infobox-value" style={{
                        color: (data.task_priorities?.display_color || '')
                    }}>{data.task_priorities?.name}</span>
                </div>

                <div className="task-block__infobox category-infobox">
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
                    <div className="task-block__infobox-value">{getLocalDatetimeString(data.created_at)}</div>
                    {(data.completed) ? (
                        <>
                            <hr />
                            <div className="task-block__infobox-label completed-at">Выполнена</div>
                            <div className="task-block__infobox-value completed-at">{getLocalDatetimeString(data.completed_at)}</div>
                        </>
                    ) : (data.complete_before_date) && (
                        <>
                            <hr />
                            <div className="task-block__infobox-label complete-before-date">{(data.rejected) ? "Пропущена" : "Выполнить до"}</div>
                            <div className="task-block__infobox-value complete-before-date">{getLocalDatetimeString(data.complete_before_date)}</div>
                        </>
                    )}
                </div>

                <div className="task-block__buttons">
                    <button
                        className={`task-block__button complete-btn ${(data.completed) ? 'completed' : ''} ${(data.rejected) ? 'rejected' : ''}`}
                        onClick={() => {
                            if (!data.completed && !data.rejected) updateOpenedModal('confirm-complete');
                        }}
                    >{data.rejected ? 'Пропущена' : (data.completed ? 'Выполнена' : 'Выполнить')}</button>
                    <button
                        className={`task-block__button ${(data.completed || data.rejected) ? 'reupload-btn' : 'edit-btn'}`}
                        onClick={() => updateOpenedModal('edit-task')}
                    >{(data.completed || data.rejected) ? "Повторить" : "Редактировать"}</button>
                    <button
                        className={`task-block__button delete-btn`}
                        onClick={() => updateOpenedModal('confirm-delete')}
                    >Удалить</button>
                </div>
            </div>
            <div className="task-block__right-mobile">
                <div className="task-block__infobox">
                    {/* <div className="task-block__infobox-label">Создана</div>
                    <div className="task-block__infobox-value">{data.created_at?.toLocaleDateString('ru-RU')}</div> */}
                    {(data.completed) ? (
                        <>
                            {/* <hr /> */}
                            <div className="task-block__infobox-label completed-at">Выполнена</div>
                            <div className="task-block__infobox-value completed-at">{data.completed_at?.toLocaleDateString('ru-RU')}</div>
                        </>
                    ) : (data.complete_before_date) && (
                        <>
                            {/* <hr /> */}
                            <div className={`task-block__infobox-label complete-before-date ${(data.rejected) ? 'rejected' : ''}`}>{(data.rejected) ? "Пропущена" : "Выполнить до"}</div>
                            <div className="task-block__infobox-value complete-before-date">{data.complete_before_date?.toLocaleDateString('ru-RU')}</div>
                        </>
                    )}
                </div>
                {/* <SimpleDropdown
                    className="task-block__dropdown more-data-dropdown"
                    buttonLabel="Ещё ▽"
                    position={{
                        // top: 0,
                        right: 0,
                        automatic: {
                            vertical: {
                                container: bodyRef
                            },
                        }
                        // bottom: undefined,
                    }}
                >

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

                    <div className="task-block__infobox date-infobox">
                        <div className="task-block__infobox-mobile-item">
                            <div className="task-block__infobox-label">Создана</div>
                            <div className="task-block__infobox-value">{data.created_at?.toLocaleDateString('ru-RU')}</div>
                        </div>
                        <div className="task-block__infobox-mobile-item">
                            {(data.completed) ? (
                                <>
                                    <div className="task-block__infobox-label completed-at">Выполнена</div>
                                    <div className="task-block__infobox-value completed-at">{data.completed_at?.toLocaleDateString('ru-RU')}</div>
                                </>
                            ) : (data.complete_before_date) && (
                                <>
                                    <div className="task-block__infobox-label complete-before-date">Выполнить до</div>
                                    <div className="task-block__infobox-value complete-before-date">{data.complete_before_date?.toLocaleDateString('ru-RU')}</div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="task-block__buttons">
                        <button
                            className={`task-block__button complete-btn ${(data.completed) ? 'completed' : ''}`}
                            onClick={() => {
                                if (!data.completed) updateOpenedModal('confirm-complete');
                            }}
                        >{data.completed ? 'Выполнена' : 'Выполнить'}</button>
                        <button
                            className={`task-block__button ${(data.completed) ? 'reupload-btn' : 'edit-btn'}`}
                            onClick={() => updateOpenedModal('edit-task')}
                        >{(data.completed) ? "Повторить" : "Редактировать"}</button>
                        <button
                            className={`task-block__button delete-btn`}
                            onClick={() => updateOpenedModal('confirm-delete')}
                        >Удалить</button>
                    </div>

                </SimpleDropdown> */}
                <button
                    className="task-block__button more-data-button"
                    onClick={() => setExpanded(true)}
                >Ещё ▽</button>
            </div>

            {isExpanded && (
                <TaskInfoModal title={data.name} onClose={() => setExpanded(false)}>

                    <div className="task-block__modal-mobile-data">
                        <div className="task-block__data --mobile-only">
                            {data.description || "- Нет описания -"}
                        </div>

                        <div className="task-block__data --mobile-only">
                            <div className="task-block__infobox">
                                <span className="task-block__infobox-label">Приоритет</span>
                                <span className="task-block__infobox-value" style={{
                                    color: (data.task_priorities?.display_color || '')
                                }}>{data.task_priorities?.name}</span>
                            </div>

                            <div className="task-block__infobox category-infobox">
                                <span className="task-block__infobox-label">Категория</span>
                                <span className="task-block__infobox-value">{data.task_categories?.name || " — "}</span>
                            </div>
                        </div>

                        <div className="task-block__data --mobile-only">
                            <div className="task-block__infobox users-infobox-mobile">
                                {data.task_users.map((user, i) => (
                                    <div className="task-block__user" key={i}>{user.users.name}</div>
                                ))}
                            </div>
                        </div>

                        <div className="task-block__data --mobile-only">
                            <div className="task-block__infobox">
                                <div className="task-block__infobox-label">Создана</div>
                                <div className="task-block__infobox-value">{getLocalDatetimeString(data.created_at)}</div>
                            </div>
                            <div className="task-block__infobox">
                                {(data.completed) ? (
                                    <>
                                        <div className="task-block__infobox-label completed-at">Выполнена</div>
                                        <div className="task-block__infobox-value completed-at">{getLocalDatetimeString(data.completed_at)}</div>
                                    </>
                                ) : (data.complete_before_date) && (
                                    <>
                                        <div className="task-block__infobox-label complete-before-date">{(data.rejected) ? "Пропущена" : "Выполнить до"}</div>
                                        <div className="task-block__infobox-value complete-before-date">{getLocalDatetimeString(data.complete_before_date)}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="task-block__buttons">
                        <button
                            className={`task-block__button complete-btn ${(data.completed) ? 'completed' : ''} ${(data.rejected) ? 'rejected' : ''}`}
                            onClick={() => {
                                if (!data.completed && !data.rejected) updateOpenedModal('confirm-complete');
                            }}
                        >{(data.rejected) ? 'Пропущена' : (data.completed ? 'Выполнена' : 'Выполнить')}</button>
                        <button
                            className={`task-block__button ${(data.completed || data.rejected) ? 'reupload-btn' : 'edit-btn'}`}
                            onClick={() => updateOpenedModal('edit-task')}
                        >{(data.completed || data.rejected) ? "Повторить" : "Редактировать"}</button>
                        <button
                            className={`task-block__button delete-btn`}
                            onClick={() => updateOpenedModal('confirm-delete')}
                        >Удалить</button>
                        <button
                            className={`task-block__button close-btn`}
                            onClick={() => setExpanded(false)}
                        >↲ Назад</button>
                    </div>

                </TaskInfoModal>
            )}

            {(openedModal === 'confirm-delete') && (
                <SimpleModal title={`Удалить задачу "${data.name}"?`} buttons={[
                    {
                        text: "Отмена",
                        className: "task-block__button cancel-delete-btn",
                        onClick: () => updateOpenedModal(null),
                        disabled: isLoading
                    },
                    {
                        text: "Подтвердить",
                        className: "task-block__button confirm-delete-btn",
                        onClick: () => confirmDeleteTask(),
                        disabled: isLoading
                    }
                ]} styles={{
                    title: {
                        color: '#ff0000'
                    },
                    modal: {
                        border: '8px solid #ff0000',
                        borderRadius: '15px',
                        // width: '50%',
                        // height: '30%'
                    }
                }} />
            )}

            {(openedModal === 'confirm-complete') && (
                <SimpleModal title={`Выполнить задачу "${data.name}"?`} buttons={[
                    {
                        text: "Отмена",
                        className: "task-block__button cancel-complete-btn",
                        onClick: () => updateOpenedModal(null),
                        disabled: isLoading
                    },
                    {
                        text: "Подтвердить",
                        className: "task-block__button confirm-complete-btn",
                        onClick: () => confirmCompleteTask(),
                        disabled: isLoading
                    }
                ]} styles={{
                    title: {
                        color: '#129b00'
                    },
                    modal: {
                        border: '8px solid #17c900',
                        borderRadius: '15px',
                        // width: '50%',
                        // height: '30%'
                    }
                }} />
            )}

            {(openedModal === 'edit-task') && (
                <TaskEditorModal
                    taskData={data}
                    categories={categories}
                    users={users}
                    priorities={priorities}
                    onClose={() => updateOpenedModal(null)}
                />
            )}
        </div>
    );
}