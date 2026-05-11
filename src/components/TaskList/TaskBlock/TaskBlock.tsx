import "./TaskBlock.css";
import { Task } from "@/app/page";


export default function TaskBlock({ idx, data }: { idx: number, data: Task }) {
    return (
        <div className="task-block">
            <div className="task-block__left">
                <span className="task-block__idx">{idx + 1}</span>
                <span className="task-block__name">{data.name}</span>
                {/* <span className="task-block__priority">{data.task_priorities?.name}</span> */}
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
                    {(data.completed) && (
                        <>
                            <hr />
                            <div className="task-block__infobox-label">Выполнена</div>
                            <div className="task-block__infobox-value">{data.completed_at?.toLocaleDateString('ru-RU')}</div>
                        </>
                    )}
                </div>

                <div className="task-block__buttons">
                    <button className={`task-block__button complete-btn ${(data.completed) ? 'completed' : ''}`}>{data.completed ? 'Выполнена' : 'Выполнить'}</button>
                    <button className={`task-block__button edit-btn`}>Редактировать</button>
                    <button className={`task-block__button delete-btn`}>Удалить</button>
                </div>
            </div>
        </div>
    );
}